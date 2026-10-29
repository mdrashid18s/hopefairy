<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseMetadata;
use App\Models\Resource;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ResourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find existing metadata items
        $mbbsMeta = CourseMetadata::where('subject', 'like', '%Anatomy%')->first();
        $btechMeta = CourseMetadata::where('subject', 'like', '%Computer Science%')->orWhere('subject', 'like', '%Data Structures%')->first();
        $mbaMeta = CourseMetadata::where('subject', 'like', '%Finance%')->orWhere('subject', 'like', '%Marketing%')->first();

        // Fallback to any metadata if not matched
        if (!$mbbsMeta) $mbbsMeta = CourseMetadata::first();
        $firstCourse = Course::where('course_name', 'like', '%MBBS%')->first() ?: Course::first();
        $btechCourse = Course::where('course_name', 'like', '%B.Tech%')->first() ?: $firstCourse;
        $mbaCourse = Course::where('course_name', 'like', '%MBA%')->first() ?: $firstCourse;

        $samples = [
            [
                'course_id'          => $mbbsMeta ? $mbbsMeta->course_id : $firstCourse->id,
                'course_metadata_id' => $mbbsMeta ? $mbbsMeta->id : null,
                'subject'            => $mbbsMeta ? $mbbsMeta->subject : 'Human Anatomy',
                'topic'              => $mbbsMeta ? $mbbsMeta->topic : 'Gross Anatomy & Histology',
                'subtopic'           => $mbbsMeta ? $mbbsMeta->subtopic : 'Upper Limb & Thorax Complete Overview',
                'title'              => 'Complete Human Anatomy Illustrated Notes (Vol 1)',
                'slug'               => 'complete-human-anatomy-illustrated-notes-vol-1',
                'short_description'  => 'High-yield illustrated anatomical charts, clinical correlations, and mnemonic guides for 1st year MBBS and NEET-PG aspirants.',
                'description'        => 'Comprehensive, color-coded study material covering upper limb muscular innervation, thoracic cage landmarks, and cardiac blood supply. Includes 50+ hand-drawn labeled diagrams and high-frequency exam questions.',
                'thumbnail'          => null,
                'pdf_file'           => null,
                'file_size'          => null,
                'page_count'         => 142,
                'author_name'        => 'Dr. Arvind Sharma (MD Anatomy)',
                'material_type'      => 'Handwritten Notes',
                'badge'              => 'Bestseller',
                'is_free'            => false,
                'actual_price'       => 799.00,
                'sell_price'         => 299.00,
                'discount_percent'   => 63,
                'currency'           => 'INR',
                'download_count'     => 348,
                'rating'             => 4.95,
                'rating_count'       => 86,
                'is_featured'        => true,
                'is_active'          => true,
                'display_order'      => 1,
            ],
            [
                'course_id'          => $btechMeta ? $btechMeta->course_id : $btechCourse->id,
                'course_metadata_id' => $btechMeta ? $btechMeta->id : null,
                'subject'            => $btechMeta ? $btechMeta->subject : 'Data Structures & Algorithms',
                'topic'              => $btechMeta ? $btechMeta->topic : 'Trees, Graphs & Dynamic Programming',
                'subtopic'           => $btechMeta ? $btechMeta->subtopic : 'Binary Search Trees & Heap Operations',
                'title'              => 'DSA Cheat Sheet & Big-O Complexity Formula Cards',
                'slug'               => 'dsa-cheat-sheet-big-o-complexity-formula-cards',
                'short_description'  => 'Compact 20-page rapid revision guide with time/space complexities, pseudo-code templates, and top 50 coding interview patterns.',
                'description'        => 'Master data structures and graph algorithms for university semester exams and FAANG product company interviews. Covers quick sort, AVL tree rotations, Dijkstra, and DP memoization patterns.',
                'thumbnail'          => null,
                'pdf_file'           => null,
                'file_size'          => null,
                'page_count'         => 28,
                'author_name'        => 'HopeFairy Engineering Lab',
                'material_type'      => 'Formula Sheet',
                'badge'              => 'Trending',
                'is_free'            => true,
                'actual_price'       => 499.00,
                'sell_price'         => 0.00,
                'discount_percent'   => 100,
                'currency'           => 'INR',
                'download_count'     => 1240,
                'rating'             => 4.90,
                'rating_count'       => 214,
                'is_featured'        => true,
                'is_active'          => true,
                'display_order'      => 2,
            ],
            [
                'course_id'          => $mbaMeta ? $mbaMeta->course_id : $mbaCourse->id,
                'course_metadata_id' => $mbaMeta ? $mbaMeta->id : null,
                'subject'            => $mbaMeta ? $mbaMeta->subject : 'Financial Management',
                'topic'              => $mbaMeta ? $mbaMeta->topic : 'Corporate Valuation & Capital Budgeting',
                'subtopic'           => $mbaMeta ? $mbaMeta->subtopic : 'DCF Modeling & WACC Calculations',
                'title'              => 'Executive Financial Modeling & DCF Valuation Handbook',
                'slug'               => 'executive-financial-modeling-dcf-valuation-handbook',
                'short_description'  => 'Step-by-step financial statement forecasting, weighted average cost of capital formula sheets, and M&A case studies.',
                'description'        => 'Designed for MBA Finance candidates, CFA Level 1 students, and investment banking prep. Contains full excel formula walkthroughs, sensitivity tables, and terminal value calculations.',
                'thumbnail'          => null,
                'pdf_file'           => null,
                'file_size'          => null,
                'page_count'         => 96,
                'author_name'        => 'Prof. S. K. Roy (CFA)',
                'material_type'      => 'Complete Syllabus Guide',
                'badge'              => 'Must Read',
                'is_free'            => false,
                'actual_price'       => 1299.00,
                'sell_price'         => 499.00,
                'discount_percent'   => 62,
                'currency'           => 'INR',
                'download_count'     => 194,
                'rating'             => 4.88,
                'rating_count'       => 43,
                'is_featured'        => false,
                'is_active'          => true,
                'display_order'      => 3,
            ]
        ];

        foreach ($samples as $data) {
            Resource::updateOrCreate(['slug' => $data['slug']], $data);
        }
    }
}
