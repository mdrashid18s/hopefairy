<?php

namespace App\Services;

use App\Models\Course;
use App\Models\CourseMetadata;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\Subtopic;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MetadataService
{
    /**
     * Get all metadata items with flexible cascading filtering and relational eager loading.
     */
    public function getAll(array $filters = []): Collection
    {
        $query = CourseMetadata::with(['course', 'subjectModel', 'topicModel', 'subtopicModel']);

        // Course filter by ID or course name
        if (!empty($filters['course_id']) && $filters['course_id'] !== 'all') {
            $query->where('course_id', $filters['course_id']);
        } elseif (!empty($filters['course']) && $filters['course'] !== 'all') {
            $courseVal = $filters['course'];
            $query->where(function ($q) use ($courseVal) {
                if (is_numeric($courseVal)) {
                    $q->where('course_id', (int)$courseVal);
                } else {
                    $q->whereHas('course', function ($cq) use ($courseVal) {
                        $cq->where('course_name', $courseVal);
                    });
                }
            });
        }

        // Subject filter by ID or string name
        if (!empty($filters['subject_id']) && $filters['subject_id'] !== 'all') {
            $query->where('subject_id', $filters['subject_id']);
        } elseif (!empty($filters['subject']) && $filters['subject'] !== 'all') {
            $query->where('subject', $filters['subject']);
        }

        // Topic filter by ID or string name
        if (!empty($filters['topic_id']) && $filters['topic_id'] !== 'all') {
            $query->where('topic_id', $filters['topic_id']);
        } elseif (!empty($filters['topic']) && $filters['topic'] !== 'all') {
            $query->where('topic', $filters['topic']);
        }

        // Subtopic filter by ID or string name
        if (!empty($filters['subtopic_id']) && $filters['subtopic_id'] !== 'all') {
            $query->where('subtopic_id', $filters['subtopic_id']);
        } elseif (!empty($filters['subtopic'])) {
            $query->where('subtopic', 'like', '%' . $filters['subtopic'] . '%');
        }

        // Active status filter
        if (isset($filters['is_active']) && $filters['is_active'] !== '' && $filters['is_active'] !== null && $filters['is_active'] !== 'all') {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        // Global search across course name, subject, topic, subtopic, PDF title, or description
        if (!empty($filters['search'])) {
            $term = trim($filters['search']);
            $query->where(function ($q) use ($term) {
                $q->whereHas('course', function ($cq) use ($term) {
                    $cq->where('course_name', 'like', "%{$term}%")
                      ->orWhere('entrance_exams', 'like', "%{$term}%");
                })
                ->orWhere('subject', 'like', "%{$term}%")
                ->orWhere('topic', 'like', "%{$term}%")
                ->orWhere('subtopic', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%");
            });
        }


        return $query->orderBy('display_order', 'asc')
                     ->orderBy('id', 'desc')
                     ->get();
    }

    /**
     * Get distinct normalized hierarchy directly from relational tables:
     * courses -> subjects -> topics -> subtopics.
     */
    public function getHierarchy(): array
    {
        // 1. Master courses list
        $courses = Course::orderBy('display_order', 'asc')
            ->orderBy('course_name', 'asc')
            ->get(['id', 'course_name', 'level', 'entrance_exams'])
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'name' => $c->course_name,
                    'level' => $c->level,
                    'entrance_exams' => $c->entrance_exams,
                ];
            })
            ->values()
            ->all();

        // 2. Normalized Relational Subjects
        $subjects = Subject::where('is_active', true)
            ->orderBy('display_order', 'asc')
            ->orderBy('name', 'asc')
            ->get(['id', 'course_id', 'name', 'slug', 'code']);

        // 3. Normalized Relational Topics (Strict 3NF: subject_id only)
        $topics = Topic::with('subject:id,course_id')
            ->where('is_active', true)
            ->orderBy('display_order', 'asc')
            ->orderBy('name', 'asc')
            ->get(['id', 'subject_id', 'name', 'slug']);

        // 4. Normalized Relational Subtopics (Strict 3NF: topic_id only)
        $subtopics = Subtopic::with('topic:id,subject_id')
            ->where('is_active', true)
            ->orderBy('display_order', 'asc')
            ->orderBy('name', 'asc')
            ->get(['id', 'topic_id', 'name', 'slug']);

        // Build associative structures for fast cascading dropdown lookups
        $subjectsByCourse = [];
        $relationalSubjectsByCourse = [];
        foreach ($subjects as $s) {
            $cid = (string)$s->course_id;
            $subjectsByCourse[$cid][] = $s->name;
            $relationalSubjectsByCourse[$cid][] = [
                'id' => $s->id,
                'name' => $s->name,
                'slug' => $s->slug,
            ];
        }

        $topicsBySubject = [];
        $relationalTopicsBySubject = [];
        foreach ($topics as $t) {
            $sid = (string)$t->subject_id;
            $cid = $t->subject ? $t->subject->course_id : $t->course_id;
            $relationalTopicsBySubject[$sid][] = [
                'id' => $t->id,
                'name' => $t->name,
                'slug' => $t->slug,
                'course_id' => $cid,
            ];

            // String key for backward compatibility
            $subj = $subjects->firstWhere('id', $t->subject_id);
            if ($subj) {
                $key = "{$cid}::{$subj->name}";
                $topicsBySubject[$key][] = $t->name;
            }
        }

        $relationalSubtopicsByTopic = [];
        foreach ($subtopics as $st) {
            $tid = (string)$st->topic_id;
            $relationalSubtopicsByTopic[$tid][] = [
                'id' => $st->id,
                'name' => $st->name,
                'slug' => $st->slug,
                'subject_id' => $st->subject_id,
                'course_id' => $st->course_id,
            ];
        }

        return [
            'courses' => $courses,
            'subjects' => $subjects,
            'topics' => $topics,
            'subtopics' => $subtopics,
            'subjectsByCourse' => $subjectsByCourse,
            'topicsBySubject' => $topicsBySubject,
            'relationalSubjectsByCourse' => $relationalSubjectsByCourse,
            'relationalTopicsBySubject' => $relationalTopicsBySubject,
            'relationalSubtopicsByTopic' => $relationalSubtopicsByTopic,
        ];
    }

    /**
     * Create a new course metadata item with automatic 3NF table resolution.
     */
    public function create(array $data): CourseMetadata
    {
        return CourseMetadata::create($data);
    }

    /**
     * Update an existing course metadata item.
     */
    public function update(CourseMetadata $metadata, array $data): CourseMetadata
    {
        $metadata->update($data);
        return $metadata->fresh(['course', 'subjectModel', 'topicModel', 'subtopicModel']);
    }

    /**
     * Toggle active/inactive state.
     */
    public function toggle(CourseMetadata $metadata): CourseMetadata
    {
        $metadata->is_active = !$metadata->is_active;
        $metadata->save();

        return $metadata;
    }

    /**
     * Delete metadata item.
     */
    public function delete(CourseMetadata $metadata): bool
    {
        return (bool)$metadata->delete();
    }

    // -------------------------------------------------------------
    // Dedicated 3NF CRUD Methods for Subjects, Topics, Subtopics
    // -------------------------------------------------------------

    public function getSubjects(array $filters = []): Collection
    {
        $q = Subject::with(['course', 'topics.subtopics']);
        if (!empty($filters['course_id']) && $filters['course_id'] !== 'all') {
            $q->where('course_id', $filters['course_id']);
        }
        return $q->orderBy('display_order')->orderBy('name')->get();
    }

    public function createSubject(array $data): Subject
    {
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        return Subject::create($data);
    }

    public function updateSubject(int $id, array $data): Subject
    {
        $subj = Subject::findOrFail($id);
        $subj->update($data);
        return $subj;
    }

    public function deleteSubject(int $id): bool
    {
        $subj = Subject::findOrFail($id);
        return $subj->delete();
    }

    public function getTopics(array $filters = []): Collection
    {
        $q = Topic::with(['subject.course', 'subtopics']);
        if (!empty($filters['subject_id']) && $filters['subject_id'] !== 'all') {
            $q->where('subject_id', $filters['subject_id']);
        }
        if (!empty($filters['course_id']) && $filters['course_id'] !== 'all') {
            $courseId = $filters['course_id'];
            $q->whereHas('subject', function ($sq) use ($courseId) {
                $sq->where('course_id', $courseId);
            });
        }
        return $q->orderBy('display_order')->orderBy('name')->get();
    }

    public function createTopic(array $data): Topic
    {
        unset($data['course_id']);
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        return Topic::create($data);
    }

    public function updateTopic(int $id, array $data): Topic
    {
        unset($data['course_id']);
        $top = Topic::findOrFail($id);
        $top->update($data);
        return $top;
    }

    public function deleteTopic(int $id): bool
    {
        $top = Topic::findOrFail($id);
        return $top->delete();
    }

    public function getSubtopics(array $filters = []): Collection
    {
        $q = Subtopic::with(['topic.subject.course']);
        if (!empty($filters['topic_id']) && $filters['topic_id'] !== 'all') {
            $q->where('topic_id', $filters['topic_id']);
        }
        if (!empty($filters['subject_id']) && $filters['subject_id'] !== 'all') {
            $subjectId = $filters['subject_id'];
            $q->whereHas('topic', function ($tq) use ($subjectId) {
                $tq->where('subject_id', $subjectId);
            });
        }
        if (!empty($filters['course_id']) && $filters['course_id'] !== 'all') {
            $courseId = $filters['course_id'];
            $q->whereHas('topic.subject', function ($sq) use ($courseId) {
                $sq->where('course_id', $courseId);
            });
        }
        return $q->orderBy('display_order')->orderBy('name')->get();
    }

    public function createSubtopic(array $data): Subtopic
    {
        unset($data['course_id'], $data['subject_id']);
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        return Subtopic::create($data);
    }

    public function updateSubtopic(int $id, array $data): Subtopic
    {
        unset($data['course_id'], $data['subject_id']);
        $subt = Subtopic::findOrFail($id);
        $subt->update($data);
        return $subt;
    }

    public function deleteSubtopic(int $id): bool
    {
        $subt = Subtopic::findOrFail($id);
        return $subt->delete();
    }
}
