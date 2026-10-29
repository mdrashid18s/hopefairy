'use client';

/**
 * Course Curriculum & Syllabus Explorer (Course -> Subject -> Topic -> Subtopic)
 * ============================================================================
 * Deep hierarchical drilldown view for a specific Master Course.
 * Displays Course Details -> Subjects -> Topics -> Subtopics with in-context
 * management and attached Study Material / PDF links.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminTheme } from '../../AdminThemeContext.js';
import AdminCustomSelect from '../../AdminCustomSelect.js';
import {
  getAdminCourses,
  getAdminMetadataHierarchy,
  getAdminSubjects,
  createAdminSubject,
  updateAdminSubject,
  deleteAdminSubject,
  getAdminTopics,
  createAdminTopic,
  updateAdminTopic,
  deleteAdminTopic,
  getAdminSubtopics,
  createAdminSubtopic,
  updateAdminSubtopic,
  deleteAdminSubtopic,
  getAdminResources,
} from '../../../../services/adminApi.js';

function CourseCurriculumContent() {
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';
  const router = useRouter();
  const searchParams = useSearchParams();

  // Query parameters: course_id, optional subject_id, optional topic_id
  const queryCourseId = searchParams.get('course_id') || searchParams.get('id') || '';
  const querySubjectId = searchParams.get('subject_id') || '';
  const queryTopicId = searchParams.get('topic_id') || '';

  // Data states
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(queryCourseId);
  const [hierarchy, setHierarchy] = useState({
    courses: [],
    subjects: [],
    topics: [],
    subtopics: [],
    relationalSubjectsByCourse: {},
    relationalTopicsBySubject: {},
    relationalSubtopicsByTopic: {},
  });
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active selections for drill-down flow
  const [activeSubjectId, setActiveSubjectId] = useState(querySubjectId || null);
  const [activeTopicId, setActiveTopicId] = useState(queryTopicId || null);


  // Flash Feedback Banner
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: 'success' });
  const showFeedback = useCallback((text, type = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg({ text: '', type: 'success' }), 4000);
  }, []);

  // Modal States for in-context CRUD
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ course_id: '', name: '', code: '', description: '' });

  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [topicForm, setTopicForm] = useState({ course_id: '', subject_id: '', name: '', description: '' });

  const [subtopicModalOpen, setSubtopicModalOpen] = useState(false);
  const [editingSubtopic, setEditingSubtopic] = useState(null);
  const [subtopicForm, setSubtopicForm] = useState({
    course_id: '',
    subject_id: '',
    topic_id: '',
    name: '',
    description: '',
    display_order: 1,
    is_active: true,
  });

  const [deleteModal, setDeleteModal] = useState({ open: false, type: '', id: null, name: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Fetch all initial data
  const loadData = useCallback(async (showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      setError('');

      const [coursesRes, hierarchyRes, resourcesRes] = await Promise.all([
        getAdminCourses().catch(() => []),
        getAdminMetadataHierarchy().catch(() => ({ courses: [] })),
        getAdminResources().catch(() => []),
      ]);

      const rawCourses = Array.isArray(coursesRes) ? coursesRes : (coursesRes?.data || []);
      const cList = rawCourses.map((c) => ({
        id: c.id,
        name: c.course_name || c.name,
        slug: c.slug,
        level: c.level,
        duration: c.duration,
        eligibility: c.eligibility,
        entrance_exams: c.entrance_exams,
        description: c.description,
        stream_id: c.stream_id,
        stream_name: c.stream?.name || c.stream_name || '',
      }));
      setCourses(cList);

      const hData = hierarchyRes?.courses ? hierarchyRes : (hierarchyRes?.data || {});
      setHierarchy({
        courses: hData.courses || [],
        subjects: hData.subjects || [],
        topics: hData.topics || [],
        subtopics: hData.subtopics || [],
        relationalSubjectsByCourse: hData.relationalSubjectsByCourse || {},
        relationalTopicsBySubject: hData.relationalTopicsBySubject || {},
        relationalSubtopicsByTopic: hData.relationalSubtopicsByTopic || {},
      });

      const rList = Array.isArray(resourcesRes) ? resourcesRes : (resourcesRes?.data || []);
      setResources(rList);

      // Determine initial course selection
      let currentCid = selectedCourseId;
      if (!currentCid || !cList.some((c) => String(c.id) === String(currentCid))) {
        currentCid = queryCourseId && cList.some((c) => String(c.id) === String(queryCourseId))
          ? queryCourseId
          : '';
        setSelectedCourseId(currentCid);
      }
    } catch (err) {
      setError(err.message || 'Failed to load course curriculum.');
    } finally {
      if (showSkeleton) setLoading(false);
    }
  }, [queryCourseId, selectedCourseId]);

  useEffect(() => {
    loadData(true);
  }, []);

  // Sync selected course object (defaults to null if no course chosen)
  const currentCourse = useMemo(() => {
    if (!selectedCourseId) return null;
    return courses.find((c) => String(c.id) === String(selectedCourseId)) || null;
  }, [courses, selectedCourseId]);

  // Derived Subjects for the selected course
  const currentSubjects = useMemo(() => {
    if (!currentCourse) return [];
    const cid = String(currentCourse.id);
    let list = hierarchy.relationalSubjectsByCourse?.[cid] || [];
    if (list.length === 0 && Array.isArray(hierarchy.subjects)) {
      list = hierarchy.subjects.filter((s) => String(s.course_id) === cid);
    }
    return list;
  }, [currentCourse, hierarchy]);

  // Active Subject Object
  const activeSubject = useMemo(() => {
    if (!activeSubjectId) return null;
    return currentSubjects.find((s) => String(s.id) === String(activeSubjectId)) || null;
  }, [currentSubjects, activeSubjectId]);

  // Derived Topics for the active Subject
  const currentTopics = useMemo(() => {
    if (!activeSubjectId) return [];
    const sid = String(activeSubjectId);
    let list = hierarchy.relationalTopicsBySubject?.[sid] || [];
    if (list.length === 0 && Array.isArray(hierarchy.topics)) {
      list = hierarchy.topics.filter((t) => String(t.subject_id) === sid);
    }
    return list;
  }, [activeSubjectId, hierarchy]);

  // Sync query parameters if provided in URL (e.g. from deep links)
  useEffect(() => {
    if (querySubjectId && currentSubjects.some((s) => String(s.id) === String(querySubjectId))) {
      setActiveSubjectId(String(querySubjectId));
    }
  }, [querySubjectId, currentSubjects]);

  useEffect(() => {
    if (queryTopicId && currentTopics.some((t) => String(t.id) === String(queryTopicId))) {
      setActiveTopicId(String(queryTopicId));
    }
  }, [queryTopicId, currentTopics]);

  // If activeSubjectId is invalid for current course, reset it
  useEffect(() => {
    if (activeSubjectId && currentSubjects.length > 0) {
      if (!currentSubjects.some((s) => String(s.id) === String(activeSubjectId))) {
        setActiveSubjectId(null);
        setActiveTopicId(null);
      }
    }
  }, [currentSubjects, activeSubjectId]);

  // If activeTopicId is invalid for current subject, reset it
  useEffect(() => {
    if (activeTopicId && currentTopics.length > 0) {
      if (!currentTopics.some((t) => String(t.id) === String(activeTopicId))) {
        setActiveTopicId(null);
      }
    }
  }, [currentTopics, activeTopicId]);

  // Active Topic Object
  const activeTopic = useMemo(() => {
    if (!activeTopicId) return null;
    return currentTopics.find((t) => String(t.id) === String(activeTopicId)) || null;
  }, [currentTopics, activeTopicId]);

  // Derived Subtopics for the active Topic
  const currentSubtopics = useMemo(() => {
    if (!activeTopicId) return [];
    const tid = String(activeTopicId);
    let list = hierarchy.relationalSubtopicsByTopic?.[tid] || [];
    if (list.length === 0 && Array.isArray(hierarchy.subtopics)) {
      list = hierarchy.subtopics.filter((st) => String(st.topic_id) === tid);
    }
    return list;
  }, [activeTopicId, hierarchy]);

  // Resources linked to the current course
  const courseResources = useMemo(() => {
    if (!currentCourse) return [];
    return resources.filter((r) => String(r.course_id) === String(currentCourse.id));
  }, [currentCourse, resources]);

  // Handle course switch from top dropdown
  const handleCourseSwitch = (newId) => {
    setSelectedCourseId(newId);
    setActiveSubjectId(null);
    setActiveTopicId(null);
    if (newId) {
      router.replace(`/courses/curriculum/?course_id=${newId}`, { scroll: false });
    } else {
      router.replace(`/courses/curriculum/`, { scroll: false });
    }
  };

  // -------------------------------------------------------------
  // Cascading Helpers for Modals
  // -------------------------------------------------------------
  // Available subjects for Topic modal based on topicForm.course_id
  const availableSubjectsForTopic = useMemo(() => {
    if (!topicForm.course_id) return [];
    const cid = String(topicForm.course_id);
    let list = hierarchy.relationalSubjectsByCourse?.[cid] || [];
    if (list.length === 0 && Array.isArray(hierarchy.subjects)) {
      list = hierarchy.subjects.filter((s) => String(s.course_id) === cid);
    }
    return list;
  }, [topicForm.course_id, hierarchy]);

  // Available subjects for Subtopic modal based on subtopicForm.course_id
  const availableSubjectsForSubtopic = useMemo(() => {
    if (!subtopicForm.course_id) return [];
    const cid = String(subtopicForm.course_id);
    let list = hierarchy.relationalSubjectsByCourse?.[cid] || [];
    if (list.length === 0 && Array.isArray(hierarchy.subjects)) {
      list = hierarchy.subjects.filter((s) => String(s.course_id) === cid);
    }
    return list;
  }, [subtopicForm.course_id, hierarchy]);

  // Available topics for Subtopic modal based on subtopicForm.subject_id
  const availableTopicsForSubtopic = useMemo(() => {
    if (!subtopicForm.subject_id) return [];
    const sid = String(subtopicForm.subject_id);
    let list = hierarchy.relationalTopicsBySubject?.[sid] || [];
    if (list.length === 0 && Array.isArray(hierarchy.topics)) {
      list = hierarchy.topics.filter((t) => String(t.subject_id) === sid);
    }
    return list;
  }, [subtopicForm.subject_id, hierarchy]);

  const handleTopicModalCourseChange = (newCourseId) => {
    const subs = hierarchy.relationalSubjectsByCourse?.[String(newCourseId)] || [];
    const firstSub = subs[0]?.id ? String(subs[0].id) : '';
    setTopicForm((prev) => ({
      ...prev,
      course_id: newCourseId,
      subject_id: firstSub,
    }));
  };

  const handleSubtopicModalCourseChange = (newCourseId) => {
    const subs = hierarchy.relationalSubjectsByCourse?.[String(newCourseId)] || [];
    const firstSub = subs[0]?.id ? String(subs[0].id) : '';
    const tops = firstSub ? (hierarchy.relationalTopicsBySubject?.[String(firstSub)] || []) : [];
    const firstTop = tops[0]?.id ? String(tops[0].id) : '';
    setSubtopicForm((prev) => ({
      ...prev,
      course_id: newCourseId,
      subject_id: firstSub,
      topic_id: firstTop,
    }));
  };

  const handleSubtopicModalSubjectChange = (newSubjectId) => {
    const tops = newSubjectId ? (hierarchy.relationalTopicsBySubject?.[String(newSubjectId)] || []) : [];
    const firstTop = tops[0]?.id ? String(tops[0].id) : '';
    setSubtopicForm((prev) => ({
      ...prev,
      subject_id: newSubjectId,
      topic_id: firstTop,
    }));
  };

  // -------------------------------------------------------------
  // CRUD Handlers for Subjects
  // -------------------------------------------------------------
  const handleOpenSubjectModal = (subj = null) => {
    setEditingSubject(subj);
    const initialCourseId = subj?.course_id
      ? String(subj.course_id)
      : (selectedCourseId || '');
    setSubjectForm({
      course_id: initialCourseId,
      name: subj?.name || '',
      code: subj?.code || '',
      description: subj?.description || '',
    });
    setModalError('');
    setSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.course_id) {
      setModalError('Please select a course.');
      return;
    }
    if (!subjectForm.name.trim()) {
      setModalError('Subject name is required.');
      return;
    }
    try {
      setActionLoading(true);
      setModalError('');
      if (editingSubject) {
        await updateAdminSubject(editingSubject.id, {
          course_id: subjectForm.course_id,
          name: subjectForm.name.trim(),
          code: subjectForm.code.trim() || null,
          description: subjectForm.description.trim() || null,
        });
        showFeedback(`Subject "${subjectForm.name}" updated successfully.`);
      } else {
        await createAdminSubject({
          course_id: subjectForm.course_id,
          name: subjectForm.name.trim(),
          code: subjectForm.code.trim() || null,
          description: subjectForm.description.trim() || null,
        });
        showFeedback(`New subject "${subjectForm.name}" added successfully.`);
      }
      setSelectedCourseId(subjectForm.course_id);
      setSubjectModalOpen(false);
      loadData(false);
    } catch (err) {
      setModalError(err.message || 'Failed to save subject.');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // CRUD Handlers for Topics
  // -------------------------------------------------------------
  const handleOpenTopicModal = (top = null) => {
    setEditingTopic(top);
    let initialCourseId = selectedCourseId || '';
    let initialSubjectId = activeSubjectId || '';

    if (top) {
      initialSubjectId = top.subject_id ? String(top.subject_id) : '';
      const foundSubj = (hierarchy.subjects || []).find((s) => String(s.id) === String(initialSubjectId));
      if (foundSubj?.course_id) {
        initialCourseId = String(foundSubj.course_id);
      }
    } else {
      if (activeSubject?.course_id) {
        initialCourseId = String(activeSubject.course_id);
        initialSubjectId = String(activeSubject.id);
      } else {
        const subs = hierarchy.relationalSubjectsByCourse?.[String(initialCourseId)] || [];
        initialSubjectId = subs[0]?.id ? String(subs[0].id) : '';
      }
    }

    setTopicForm({
      course_id: String(initialCourseId),
      subject_id: String(initialSubjectId),
      name: top?.name || '',
      description: top?.description || '',
    });
    setModalError('');
    setTopicModalOpen(true);
  };

  const handleSaveTopic = async (e) => {
    e.preventDefault();
    if (!topicForm.course_id) {
      setModalError('Please select a course.');
      return;
    }
    if (!topicForm.subject_id) {
      setModalError('Please select a subject.');
      return;
    }
    if (!topicForm.name.trim()) {
      setModalError('Topic name is required.');
      return;
    }
    try {
      setActionLoading(true);
      setModalError('');
      if (editingTopic) {
        await updateAdminTopic(editingTopic.id, {
          subject_id: topicForm.subject_id,
          name: topicForm.name.trim(),
          description: topicForm.description.trim() || null,
        });
        showFeedback(`Topic "${topicForm.name}" updated successfully.`);
      } else {
        await createAdminTopic({
          subject_id: topicForm.subject_id,
          name: topicForm.name.trim(),
          description: topicForm.description.trim() || null,
        });
        showFeedback(`New topic "${topicForm.name}" added successfully.`);
      }
      setSelectedCourseId(topicForm.course_id);
      setActiveSubjectId(String(topicForm.subject_id));
      setTopicModalOpen(false);
      loadData(false);
    } catch (err) {
      setModalError(err.message || 'Failed to save topic.');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // CRUD Handlers for Subtopics
  // -------------------------------------------------------------
  const handleOpenSubtopicModal = (subtop = null) => {
    setEditingSubtopic(subtop);
    let initialCourseId = selectedCourseId || '';
    let initialSubjectId = activeSubjectId || '';
    let initialTopicId = activeTopicId || '';

    if (subtop) {
      initialTopicId = subtop.topic_id ? String(subtop.topic_id) : '';
      const foundTop = (hierarchy.topics || []).find((t) => String(t.id) === String(initialTopicId));
      if (foundTop?.subject_id) {
        initialSubjectId = String(foundTop.subject_id);
        const foundSubj = (hierarchy.subjects || []).find((s) => String(s.id) === String(initialSubjectId));
        if (foundSubj?.course_id) {
          initialCourseId = String(foundSubj.course_id);
        }
      }
    } else {
      if (activeTopic) {
        initialTopicId = String(activeTopic.id);
        initialSubjectId = String(activeSubject?.id || activeTopic.subject_id || '');
        const foundSubj = (hierarchy.subjects || []).find((s) => String(s.id) === String(initialSubjectId));
        if (foundSubj?.course_id) initialCourseId = String(foundSubj.course_id);
      } else {
        const subs = hierarchy.relationalSubjectsByCourse?.[String(initialCourseId)] || [];
        initialSubjectId = subs[0]?.id ? String(subs[0].id) : '';
        const tops = initialSubjectId ? (hierarchy.relationalTopicsBySubject?.[String(initialSubjectId)] || []) : [];
        initialTopicId = tops[0]?.id ? String(tops[0].id) : '';
      }
    }

    setSubtopicForm({
      course_id: String(initialCourseId),
      subject_id: String(initialSubjectId),
      topic_id: String(initialTopicId),
      name: subtop?.name || '',
      description: subtop?.description || '',
      display_order: subtop?.display_order || currentSubtopics.length + 1,
      is_active: subtop ? Boolean(subtop.is_active) : true,
    });
    setModalError('');
    setSubtopicModalOpen(true);
  };

  const handleSaveSubtopic = async (e) => {
    e.preventDefault();
    if (!subtopicForm.course_id) {
      setModalError('Please select a course.');
      return;
    }
    if (!subtopicForm.subject_id) {
      setModalError('Please select a subject.');
      return;
    }
    if (!subtopicForm.topic_id) {
      setModalError('Please select a topic.');
      return;
    }
    if (!subtopicForm.name.trim()) {
      setModalError('Subtopic title is required.');
      return;
    }
    try {
      setActionLoading(true);
      setModalError('');
      if (editingSubtopic) {
        await updateAdminSubtopic(editingSubtopic.id, {
          topic_id: subtopicForm.topic_id,
          name: subtopicForm.name.trim(),
          description: subtopicForm.description.trim() || null,
          display_order: parseInt(subtopicForm.display_order, 10) || 1,
          is_active: Boolean(subtopicForm.is_active),
        });
        showFeedback(`Subtopic "${subtopicForm.name}" updated successfully.`);
      } else {
        await createAdminSubtopic({
          topic_id: subtopicForm.topic_id,
          name: subtopicForm.name.trim(),
          description: subtopicForm.description.trim() || null,
          display_order: parseInt(subtopicForm.display_order, 10) || currentSubtopics.length + 1,
          is_active: Boolean(subtopicForm.is_active),
        });
        showFeedback(`New subtopic "${subtopicForm.name}" added successfully.`);
      }
      setSelectedCourseId(subtopicForm.course_id);
      setActiveSubjectId(String(subtopicForm.subject_id));
      setActiveTopicId(String(subtopicForm.topic_id));
      setSubtopicModalOpen(false);
      loadData(false);
    } catch (err) {
      setModalError(err.message || 'Failed to save subtopic.');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Delete Handler
  // -------------------------------------------------------------
  const confirmDelete = async () => {
    if (!deleteModal.id || !deleteModal.type) return;
    try {
      setActionLoading(true);
      if (deleteModal.type === 'subject') {
        await deleteAdminSubject(deleteModal.id);
        showFeedback(`Subject "${deleteModal.name}" deleted.`);
        if (activeSubjectId === String(deleteModal.id)) setActiveSubjectId(null);
      } else if (deleteModal.type === 'topic') {
        await deleteAdminTopic(deleteModal.id);
        showFeedback(`Topic "${deleteModal.name}" deleted.`);
        if (activeTopicId === String(deleteModal.id)) setActiveTopicId(null);
      } else if (deleteModal.type === 'subtopic') {
        await deleteAdminSubtopic(deleteModal.id);
        showFeedback(`Subtopic "${deleteModal.name}" deleted.`);
      }
      setDeleteModal({ open: false, type: '', id: null, name: '' });
      loadData(false);
    } catch (err) {
      showFeedback(err.message || 'Failed to delete record.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Card & Input styling
  const cardBg = isLight
    ? 'bg-white border-slate-100 shadow-[0_10px_30px_-4px_rgba(15,23,42,0.05)] text-slate-800'
    : 'bg-[#100f0e] border-[#24221e] shadow-[0_10px_30px_-4px_rgba(0,0,0,0.5)] text-slate-100';

  const inputClass = isLight
    ? 'bg-white border-slate-200 text-slate-800 focus:border-[#d8b056] focus:ring-[#d8b056]/20'
    : 'bg-[#141311] border-[#2a2824] text-slate-100 focus:border-[#d8b056] focus:ring-[#d8b056]/20';

  return (
    <div className="space-y-6">
      {/* Flash Alert Banner */}
      {feedbackMsg.text && (
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200 ${
            feedbackMsg.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <svg
              className={`w-4 h-4 shrink-0 ${feedbackMsg.type === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {feedbackMsg.type === 'error' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              )}
            </svg>
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg({ text: '', type: 'success' })}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap text-xs font-semibold text-slate-400">
            <Link
              href="/metadata"
              className="hover:text-[#d8b056] flex items-center gap-1 transition"
            >
              <span>← Metadata Master</span>
            </Link>
            <span>/</span>
            <Link
              href="/courses"
              className="hover:text-[#d8b056] transition"
            >
              Courses
            </Link>
            <span>/</span>
            <span className="text-[#d8b056] font-bold">
              {currentCourse?.name || 'Curriculum Explorer'}
            </span>
          </div>

          <h1 className={`text-xl sm:text-2xl font-black tracking-tight mt-1 flex items-center gap-2.5 ${isLight ? 'text-slate-900' : 'text-[#faf7f0]'}`}>
            <span>Course Curriculum &amp; Syllabus Breakdown</span>
            {currentCourse?.level && (
              <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full font-black tracking-wider border shadow-xs ${
                isLight
                  ? 'bg-[#d8b056]/25 text-[#4e3103] border-[#d8b056]/60'
                  : 'bg-[#d8b056]/20 text-[#eedb9f] border-[#d8b056]/35'
              }`}>
                {currentCourse.level}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Hierarchical 3NF breakdown: Click any <strong>Subject</strong> to reveal its <strong>Topics</strong>, then click a <strong>Topic</strong> to view all <strong>Subtopics</strong> &amp; study notes.
          </p>
        </div>

        {/* Course Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Executive Course Selector */}
          <div className="w-64 sm:w-72 min-w-[220px]">
            <AdminCustomSelect
              variant="header"
              value={selectedCourseId}
              onChange={(val) => handleCourseSwitch(val)}
              options={courses}
              placeholder="Choose Course"
            />
          </div>
        </div>
      </div>

      {/* Course Overview Banner */}
      {currentCourse && (
        <div className={`p-5 sm:p-6 rounded-3xl border relative overflow-hidden ${cardBg}`}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#d8b056]/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d8b056]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#d8b056]">
                  {currentCourse.stream_name || 'Academic Course Master'}
                </span>
                {currentCourse.duration && (
                  <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                    ⏱ {currentCourse.duration}
                  </span>
                )}
                {currentCourse.entrance_exams && (
                  <span className="text-[10px] text-[#d8b056] font-semibold px-2 py-0.5 rounded-md bg-[#d8b056]/10 border border-[#d8b056]/20">
                    Exams: {currentCourse.entrance_exams}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-[#faf7f0]">
                {currentCourse.name}
              </h2>

              {currentCourse.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {currentCourse.description}
                </p>
              )}

              {currentCourse.eligibility && (
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                  <span className="font-bold text-slate-600 dark:text-slate-300">Eligibility:</span>
                  <span>{currentCourse.eligibility}</span>
                </div>
              )}
            </div>

            {/* Quick KPI stats for this course */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151412] border border-slate-200 dark:border-[#24221e] text-center min-w-[100px]">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Subjects</div>
                <div className="text-xl font-black text-[#d8b056] mt-0.5">{currentSubjects.length}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151412] border border-slate-200 dark:border-[#24221e] text-center min-w-[100px]">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Topics</div>
                <div className="text-xl font-black text-blue-500 mt-0.5">
                  {currentSubjects.reduce((acc, s) => acc + (hierarchy.relationalTopicsBySubject?.[String(s.id)]?.length || 0), 0)}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151412] border border-slate-200 dark:border-[#24221e] text-center min-w-[100px]">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Subtopics</div>
                <div className="text-xl font-black text-emerald-500 mt-0.5">
                  {currentSubjects.reduce((acc, s) => {
                    const tops = hierarchy.relationalTopicsBySubject?.[String(s.id)] || [];
                    return acc + tops.reduce((tAcc, t) => tAcc + (hierarchy.relationalSubtopicsByTopic?.[String(t.id)]?.length || 0), 0);
                  }, 0)}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151412] border border-slate-200 dark:border-[#24221e] text-center min-w-[100px]">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Resources</div>
                <div className="text-xl font-black text-purple-500 mt-0.5">{courseResources.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Flow Pill Bar */}
      <div className={`p-3 rounded-2xl border flex items-center gap-2 overflow-x-auto text-xs font-semibold ${cardBg}`}>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 shrink-0">Active Path:</span>
        <span className={`px-2.5 py-1 rounded-lg font-black border shrink-0 shadow-xs ${
          isLight
            ? 'bg-[#fbf7ed] text-[#4e3103] border-[#d8b056]/70'
            : 'bg-[#d8b056]/20 text-[#eedb9f] border-[#d8b056]/40'
        }`}>
          {currentCourse?.name || 'Course'}
        </span>
        <span className="text-slate-400 shrink-0">→</span>
        <span className={`px-2.5 py-1 rounded-lg shrink-0 ${
          activeSubject
            ? isLight
              ? 'bg-[#fbf7ed] text-[#4e3103] font-black border border-[#d8b056]/70 shadow-xs'
              : 'bg-[#d8b056]/20 text-[#eedb9f] font-bold border border-[#d8b056]/40'
            : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
        }`}>
          {activeSubject ? activeSubject.name : 'Select Subject'}
        </span>
        <span className="text-slate-400 shrink-0">→</span>
        <span className={`px-2.5 py-1 rounded-lg shrink-0 ${
          activeTopic
            ? isLight
              ? 'bg-[#fbf7ed] text-[#4e3103] font-black border border-[#d8b056]/70 shadow-xs'
              : 'bg-[#d8b056]/20 text-[#eedb9f] font-bold border border-[#d8b056]/40'
            : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
        }`}>
          {activeTopic ? activeTopic.name : 'Select Topic'}
        </span>
        <span className="text-slate-400 shrink-0">→</span>
        <span className="px-2.5 py-1 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 shrink-0">
          {currentSubtopics.length} Subtopic{currentSubtopics.length !== 1 ? 's' : ''} Listed
        </span>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* STEP-BY-STEP DRILLDOWN COLUMNS (Subject -> Topic -> Subtopic) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* COLUMN 1: SUBJECTS (Course Details -> Subjects) */}
          <div className={`lg:col-span-4 rounded-3xl border p-4 sm:p-5 space-y-4 ${cardBg}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#24221e]">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#d8b056]">
                  Step 1 &bull; Course Disciplines
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#faf7f0]">
                  Subjects ({currentSubjects.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleOpenSubjectModal()}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] hover:brightness-105 active:scale-[0.98] transition cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>+ Add Subject</span>
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="w-7 h-7 border-2 border-[#d8b056] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs text-slate-400">Loading subjects...</span>
              </div>
            ) : currentSubjects.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 rounded-2xl bg-[#d8b056]/10 text-[#d8b056] flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {currentCourse ? 'No Subjects Yet' : 'Choose a Course'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  {currentCourse ? `Add the first academic subject for ${currentCourse.name}.` : 'Please select a course from the Choose Course dropdown above.'}
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenSubjectModal()}
                  className="mt-3 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#d8b056] text-[#0b0b0c] hover:brightness-105 transition cursor-pointer"
                >
                  + Add Subject
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {currentSubjects.map((subj, idx) => {
                  const isSelected = activeSubjectId === String(subj.id);
                  const topicCount = hierarchy.relationalTopicsBySubject?.[String(subj.id)]?.length || 0;

                  return (
                    <div
                      key={subj.id}
                      onClick={() => {
                        setActiveSubjectId(String(subj.id));
                        setActiveTopicId(null);
                      }}
                      className={`group p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-[#d8b056] bg-gradient-to-r from-[#eedb9f]/10 via-[#d8b056]/15 to-transparent shadow-sm'
                          : isLight
                          ? 'border-slate-200 hover:border-[#d8b056]/60 hover:bg-slate-50'
                          : 'border-[#24221e] hover:border-[#d8b056]/60 hover:bg-[#141311]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[#d8b056] text-[#0b0b0c]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-[#d8b056]' : 'text-slate-800 dark:text-slate-200 group-hover:text-[#d8b056]'}`}>
                              {subj.name}
                            </h4>
                            {subj.code && (
                              <span className="text-[10px] font-mono text-slate-400">
                                {subj.code}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Counts & Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-[#d8b056]/20 text-[#d8b056]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {topicCount} Topic{topicCount !== 1 ? 's' : ''}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenSubjectModal(subj);
                            }}
                            title="Edit Subject"
                            className="p-1 rounded-md text-slate-400 hover:text-[#d8b056] transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModal({ open: true, type: 'subject', id: subj.id, name: subj.name });
                            }}
                            title="Delete Subject"
                            className="p-1 rounded-md text-slate-400 hover:text-rose-500 transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {subj.description && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 pl-8">
                          {subj.description}
                        </p>
                      )}

                      {isSelected && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-[#d8b056] pl-8">
                          <span>Viewing topics in this subject</span>
                          <span>→</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* COLUMN 2: TOPICS (under the clicked Subject) */}
          <div className={`lg:col-span-4 rounded-3xl border p-4 sm:p-5 space-y-4 ${cardBg}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#24221e]">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                  Step 2 &bull; Active Topics
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#faf7f0] truncate max-w-[200px]">
                  {activeSubject ? activeSubject.name : 'Select a Subject'}
                </h3>
              </div>
              {activeSubject && (
                <button
                  type="button"
                  onClick={() => handleOpenTopicModal()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30 hover:bg-blue-500/25 active:scale-[0.98] transition cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <span>+ Add Topic</span>
                </button>
              )}
            </div>

            {!activeSubject ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-3 border border-blue-500/20">
                  <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Select a Subject
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Click on any subject on the left to reveal all its curriculum topics.
                </p>
              </div>
            ) : currentTopics.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No Topics in {activeSubject.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1">Add key curriculum topics under this subject discipline.</p>
                <button
                  type="button"
                  onClick={() => handleOpenTopicModal()}
                  className="mt-3 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500 text-white hover:brightness-105 transition cursor-pointer"
                >
                  + Add First Topic
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {currentTopics.map((top, idx) => {
                  const isSelected = activeTopicId === String(top.id);
                  const subtopicCount = hierarchy.relationalSubtopicsByTopic?.[String(top.id)]?.length || 0;

                  return (
                    <div
                      key={top.id}
                      onClick={() => setActiveTopicId(String(top.id))}
                      className={`group p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-gradient-to-r from-blue-500/10 via-blue-500/15 to-transparent shadow-sm'
                          : isLight
                          ? 'border-slate-200 hover:border-blue-500/60 hover:bg-slate-50'
                          : 'border-[#24221e] hover:border-blue-500/60 hover:bg-[#141311]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-blue-500' : 'text-slate-800 dark:text-slate-200 group-hover:text-blue-500'}`}>
                              {top.name}
                            </h4>
                          </div>
                        </div>

                        {/* Counts & Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-blue-500/20 text-blue-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {subtopicCount} Subtopic{subtopicCount !== 1 ? 's' : ''}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTopicModal(top);
                            }}
                            title="Edit Topic"
                            className="p-1 rounded-md text-slate-400 hover:text-blue-500 transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModal({ open: true, type: 'topic', id: top.id, name: top.name });
                            }}
                            title="Delete Topic"
                            className="p-1 rounded-md text-slate-400 hover:text-rose-500 transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {top.description && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 pl-8">
                          {top.description}
                        </p>
                      )}

                      {isSelected && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-blue-500 pl-8">
                          <span>Viewing subtopics in this topic</span>
                          <span>→</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* COLUMN 3: SUBTOPICS (under the clicked Topic) */}
          <div className={`lg:col-span-4 rounded-3xl border p-4 sm:p-5 space-y-4 ${cardBg}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#24221e]">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                  Step 3 &bull; Subtopics &amp; Materials
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#faf7f0] truncate max-w-[200px]">
                  {activeTopic ? activeTopic.name : 'Select a Topic'}
                </h3>
              </div>
              {activeTopic && (
                <button
                  type="button"
                  onClick={() => handleOpenSubtopicModal()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 active:scale-[0.98] transition cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <span>+ Add Subtopic</span>
                </button>
              )}
            </div>

            {!activeTopic ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
                  <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Select a Topic
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Click on any topic in the middle column to reveal its subtopics and study materials.
                </p>
              </div>
            ) : currentSubtopics.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No Subtopics in {activeTopic.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1">Add specific syllabus chapters, modules, or lecture subtopics.</p>
                <button
                  type="button"
                  onClick={() => handleOpenSubtopicModal()}
                  className="mt-3 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:brightness-105 transition cursor-pointer"
                >
                  + Add First Subtopic
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentSubtopics.map((subtop, idx) => {
                  return (
                    <div
                      key={subtop.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 ${
                        isLight
                          ? 'border-slate-200/80 bg-white hover:border-emerald-500/50 hover:shadow-xs'
                          : 'border-[#24221e] bg-[#141311] hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#faf7f0] leading-snug">
                              {subtop.name}
                            </h4>
                            {subtop.description && (
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {subtop.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            subtop.is_active !== false
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-500/10 text-slate-400'
                          }`}>
                            {subtop.is_active !== false ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenSubtopicModal(subtop)}
                            title="Edit Subtopic"
                            className="p-1 rounded-md text-slate-400 hover:text-emerald-500 transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModal({ open: true, type: 'subtopic', id: subtop.id, name: subtop.name })}
                            title="Delete Subtopic"
                            className="p-1 rounded-md text-slate-400 hover:text-rose-500 transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: Add / Edit Subject                                   */}
      {/* ------------------------------------------------------------- */}
      {subjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`relative w-full max-w-md sm:max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 ${isLight ? 'bg-white border-[#e5dfd3] shadow-[0_25px_60px_-15px_rgba(60,44,12,0.18)] text-slate-900' : 'bg-[#100f0e] border-[#292622] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] text-[#faf7f0]'}`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#24221e]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#d8b056]/12 border border-[#d8b056]/28 text-[#d8b056] shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    {editingSubject ? 'Edit Subject' : 'Add Subject Discipline'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Course: <strong>{currentCourse?.name || 'Please select a course'}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSubjectModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveSubject} className="mt-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                  Course <span className="text-rose-500">*</span>
                </label>
                <AdminCustomSelect
                  required
                  value={subjectForm.course_id}
                  onChange={(val) => setSubjectForm({ ...subjectForm, course_id: val })}
                  options={courses}
                  placeholder="Select Course"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                  Subject Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="e.g. Human Anatomy, Data Structures, Financial Management"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold border ${inputClass}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                  Subject Code (Optional)
                </label>
                <input
                  type="text"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  placeholder="e.g. ANAT101, CS201, FIN502"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold border ${inputClass}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                  Description / Syllabus Summary (Optional)
                </label>
                <textarea
                  rows={3}
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  placeholder="Core academic scope and objectives..."
                  className={`w-full px-4 py-2.5 rounded-xl text-xs border resize-none ${inputClass}`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#24221e]">
                <button
                  type="button"
                  onClick={() => setSubjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] disabled:opacity-60 transition cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : editingSubject ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: Add / Edit Topic                                     */}
      {/* ------------------------------------------------------------- */}
      {topicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`relative w-full max-w-lg sm:max-w-xl rounded-3xl border shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 ${isLight ? 'bg-white border-[#e5dfd3] shadow-[0_25px_60px_-15px_rgba(60,44,12,0.18)] text-slate-900' : 'bg-[#100f0e] border-[#292622] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] text-[#faf7f0]'}`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#24221e]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-500/15 border border-blue-500/30 text-blue-500 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    {editingTopic ? 'Edit Topic' : 'Add Curriculum Topic'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Course &bull; Subject &bull; Topic Hierarchy
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTopicModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveTopic} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                    Course <span className="text-rose-500">*</span>
                  </label>
                  <AdminCustomSelect
                    required
                    value={topicForm.course_id}
                    onChange={(val) => handleTopicModalCourseChange(val)}
                    options={courses}
                    placeholder="Select Course"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <AdminCustomSelect
                    required
                    value={topicForm.subject_id}
                    onChange={(val) => setTopicForm({ ...topicForm, subject_id: val })}
                    options={availableSubjectsForTopic}
                    placeholder={availableSubjectsForTopic.length === 0 ? 'No subjects in course' : 'Select Subject'}
                    disabled={availableSubjectsForTopic.length === 0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                  Topic Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={topicForm.name}
                  onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                  placeholder="e.g. Cardiovascular System, Binary Search Trees, Valuation Models"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold border ${inputClass}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                  Description / Topic Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  placeholder="Important chapters, theoretical foundations, exam highlights..."
                  className={`w-full px-4 py-2.5 rounded-xl text-xs border resize-none ${inputClass}`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#24221e]">
                <button
                  type="button"
                  onClick={() => setTopicModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 active:scale-[0.99] disabled:opacity-60 transition cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : editingTopic ? 'Update Topic' : 'Save Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: Add / Edit Subtopic                                  */}
      {/* ------------------------------------------------------------- */}
      {subtopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`relative w-full max-w-xl sm:max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 ${isLight ? 'bg-white border-[#e5dfd3] shadow-[0_25px_60px_-15px_rgba(60,44,12,0.18)] text-slate-900' : 'bg-[#100f0e] border-[#292622] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] text-[#faf7f0]'}`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#24221e]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    {editingSubtopic ? 'Edit Subtopic' : 'Add Syllabus Subtopic'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Course &bull; Subject &bull; Topic Hierarchy
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSubtopicModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveSubtopic} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                    Course <span className="text-rose-500">*</span>
                  </label>
                  <AdminCustomSelect
                    required
                    value={subtopicForm.course_id}
                    onChange={(val) => handleSubtopicModalCourseChange(val)}
                    options={courses}
                    placeholder="Select Course"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <AdminCustomSelect
                    required
                    value={subtopicForm.subject_id}
                    onChange={(val) => handleSubtopicModalSubjectChange(val)}
                    options={availableSubjectsForSubtopic}
                    placeholder={availableSubjectsForSubtopic.length === 0 ? 'No subjects' : 'Select Subject'}
                    disabled={availableSubjectsForSubtopic.length === 0}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                    Topic <span className="text-rose-500">*</span>
                  </label>
                  <AdminCustomSelect
                    required
                    value={subtopicForm.topic_id}
                    onChange={(val) => setSubtopicForm({ ...subtopicForm, topic_id: val })}
                    options={availableTopicsForSubtopic}
                    placeholder={availableTopicsForSubtopic.length === 0 ? 'No topics' : 'Select Topic'}
                    disabled={availableTopicsForSubtopic.length === 0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                  Subtopic Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subtopicForm.name}
                  onChange={(e) => setSubtopicForm({ ...subtopicForm, name: e.target.value })}
                  placeholder="e.g. Heart chambers, valves, and cardiac cycle"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold border ${inputClass}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                  Description / Study Material Summary (Optional)
                </label>
                <textarea
                  rows={3}
                  value={subtopicForm.description}
                  onChange={(e) => setSubtopicForm({ ...subtopicForm, description: e.target.value })}
                  placeholder="Key concepts, laboratory practicals, textbook references..."
                  className={`w-full px-4 py-2.5 rounded-xl text-xs border resize-none ${inputClass}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700 dark:text-slate-300">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={subtopicForm.display_order}
                    onChange={(e) => setSubtopicForm({ ...subtopicForm, display_order: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs border ${inputClass}`}
                  />
                </div>

                <div className="flex items-center justify-between self-end pb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Active:
                  </label>
                  <button
                    type="button"
                    onClick={() => setSubtopicForm({ ...subtopicForm, is_active: !subtopicForm.is_active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${subtopicForm.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${subtopicForm.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#24221e]">
                <button
                  type="button"
                  onClick={() => setSubtopicModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-60 transition cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : editingSubtopic ? 'Update Subtopic' : 'Save Subtopic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: Delete Confirmation                                  */}
      {/* ------------------------------------------------------------- */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 animate-in zoom-in-95 duration-200 ${isLight ? 'bg-white border-[#e5dfd3] shadow-[0_25px_60px_-15px_rgba(60,44,12,0.18)] text-slate-900' : 'bg-[#100f0e] border-[#292622] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] text-[#faf7f0]'}`}>
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-rose-500 uppercase">
                  Delete {deleteModal.type}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Are you sure you want to delete this record? All child items will also be removed.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-2xl bg-slate-500/10 border border-slate-500/15 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-100">{deleteModal.name}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Type: {deleteModal.type}</div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, type: '', id: null, name: '' })}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {actionLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CourseCurriculumPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-3 border-[#d8b056]/30 border-t-[#d8b056] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-400">Loading Course Curriculum Explorer...</p>
        </div>
      }
    >
      <CourseCurriculumContent />
    </Suspense>
  );
}
