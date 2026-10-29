<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\IndiaAdmission;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Ensure Education & Teaching stream exists
        $education = IndiaAdmission::firstOrCreate(
            ['slug' => 'education'],
            [
                'name' => 'Education & Teaching',
                'icon' => 'book-open',
                'text' => 'Premier universities and teacher training institutes for professional education degrees.',
                'ug_programs' => ['B.Ed', 'B.El.Ed', 'D.El.Ed'],
                'ug_exams' => ['CUET-UG', 'State B.Ed CETs'],
                'pg_programs' => ['M.Ed', 'MA Education'],
                'pg_exams' => ['CUET-PG', 'University Entrance'],
                'is_active' => true,
                'display_order' => 6,
            ]
        );

        // 2. Fetch all streams
        $streams = IndiaAdmission::all()->keyBy('slug');

        // 3. Clear existing courses if any
        DB::table('courses')->truncate();

        $coursesData = [
            // Engineering
            ['slug' => 'engineering', 'course_name' => 'B.Tech', 'level' => 'undergraduate', 'entrance_exams' => 'JEE Main · JEE Advanced · State CETs', 'duration' => '4 Years', 'eligibility' => '10+2 with Physics, Chemistry & Mathematics (min 50%)', 'display_order' => 1],
            ['slug' => 'engineering', 'course_name' => 'B.E.', 'level' => 'undergraduate', 'entrance_exams' => 'JEE Main · State CETs', 'duration' => '4 Years', 'eligibility' => '10+2 with PCM', 'display_order' => 2],
            ['slug' => 'engineering', 'course_name' => 'M.Tech', 'level' => 'postgraduate', 'entrance_exams' => 'GATE', 'duration' => '2 Years', 'eligibility' => 'B.Tech / B.E. in relevant discipline', 'display_order' => 1],
            ['slug' => 'engineering', 'course_name' => 'M.E.', 'level' => 'postgraduate', 'entrance_exams' => 'GATE', 'duration' => '2 Years', 'eligibility' => 'B.Tech / B.E. in relevant discipline', 'display_order' => 2],
            ['slug' => 'engineering', 'course_name' => 'MS (Research)', 'level' => 'postgraduate', 'entrance_exams' => 'GATE', 'duration' => '2 - 3 Years', 'eligibility' => 'B.Tech / B.E. with valid GATE score', 'display_order' => 3],

            // Medicine
            ['slug' => 'medicine', 'course_name' => 'MBBS', 'level' => 'undergraduate', 'entrance_exams' => 'NEET-UG', 'duration' => '5.5 Years', 'eligibility' => '10+2 with PCB (min 50%) & NEET qualified', 'display_order' => 1],
            ['slug' => 'medicine', 'course_name' => 'BDS', 'level' => 'undergraduate', 'entrance_exams' => 'NEET-UG', 'duration' => '5 Years', 'eligibility' => '10+2 with PCB & NEET qualified', 'display_order' => 2],
            ['slug' => 'medicine', 'course_name' => 'BAMS', 'level' => 'undergraduate', 'entrance_exams' => 'NEET-UG', 'duration' => '5.5 Years', 'eligibility' => '10+2 with PCB & NEET qualified', 'display_order' => 3],
            ['slug' => 'medicine', 'course_name' => 'B.Sc Nursing', 'level' => 'undergraduate', 'entrance_exams' => 'NEET-UG · State Nursing CETs', 'duration' => '4 Years', 'eligibility' => '10+2 with PCB', 'display_order' => 4],
            ['slug' => 'medicine', 'course_name' => 'MD', 'level' => 'postgraduate', 'entrance_exams' => 'NEET-PG · INI-CET', 'duration' => '3 Years', 'eligibility' => 'MBBS with 1-year internship completion', 'display_order' => 1],
            ['slug' => 'medicine', 'course_name' => 'MS', 'level' => 'postgraduate', 'entrance_exams' => 'NEET-PG · INI-CET', 'duration' => '3 Years', 'eligibility' => 'MBBS with 1-year internship completion', 'display_order' => 2],
            ['slug' => 'medicine', 'course_name' => 'MDS', 'level' => 'postgraduate', 'entrance_exams' => 'NEET-MDS', 'duration' => '3 Years', 'eligibility' => 'BDS with internship completion', 'display_order' => 3],

            // Management
            ['slug' => 'management', 'course_name' => 'BBA', 'level' => 'undergraduate', 'entrance_exams' => 'IPMAT · CUET-UG', 'duration' => '3 Years', 'eligibility' => '10+2 in any stream (min 50%)', 'display_order' => 1],
            ['slug' => 'management', 'course_name' => 'BMS', 'level' => 'undergraduate', 'entrance_exams' => 'IPMAT · CUET-UG', 'duration' => '3 Years', 'eligibility' => '10+2 in any stream', 'display_order' => 2],
            ['slug' => 'management', 'course_name' => 'Integrated IPM', 'level' => 'undergraduate', 'entrance_exams' => 'IPMAT · JIPMAT', 'duration' => '5 Years', 'eligibility' => '10+2 in any stream (min 60%)', 'display_order' => 3],
            ['slug' => 'management', 'course_name' => 'MBA', 'level' => 'postgraduate', 'entrance_exams' => 'CAT · XAT · GMAT · CMAT', 'duration' => '2 Years', 'eligibility' => 'Bachelor degree in any stream (min 50%)', 'display_order' => 1],
            ['slug' => 'management', 'course_name' => 'PGDM', 'level' => 'postgraduate', 'entrance_exams' => 'CAT · XAT · GMAT · CMAT', 'duration' => '2 Years', 'eligibility' => 'Bachelor degree in any stream', 'display_order' => 2],

            // Law
            ['slug' => 'law', 'course_name' => 'BA LL.B', 'level' => 'undergraduate', 'entrance_exams' => 'CLAT · AILET', 'duration' => '5 Years', 'eligibility' => '10+2 in any stream (min 45%)', 'display_order' => 1],
            ['slug' => 'law', 'course_name' => 'BBA LL.B', 'level' => 'undergraduate', 'entrance_exams' => 'CLAT · AILET', 'duration' => '5 Years', 'eligibility' => '10+2 in any stream (min 45%)', 'display_order' => 2],
            ['slug' => 'law', 'course_name' => 'LL.B (3-year)', 'level' => 'undergraduate', 'entrance_exams' => 'CUET-PG · University Entrance', 'duration' => '3 Years', 'eligibility' => 'Bachelor degree in any discipline', 'display_order' => 3],
            ['slug' => 'law', 'course_name' => 'LL.M', 'level' => 'postgraduate', 'entrance_exams' => 'CLAT PG · AILET PG', 'duration' => '1 - 2 Years', 'eligibility' => 'LL.B degree (min 50%)', 'display_order' => 1],

            // Liberal Arts
            ['slug' => 'liberal-arts', 'course_name' => 'BA (Hons)', 'level' => 'undergraduate', 'entrance_exams' => 'CUET-UG · University tests', 'duration' => '3 - 4 Years', 'eligibility' => '10+2 in any stream', 'display_order' => 1],
            ['slug' => 'liberal-arts', 'course_name' => 'B.Sc (Hons)', 'level' => 'undergraduate', 'entrance_exams' => 'CUET-UG · University tests', 'duration' => '3 - 4 Years', 'eligibility' => '10+2 in Science stream', 'display_order' => 2],
            ['slug' => 'liberal-arts', 'course_name' => 'Liberal Arts & Sciences', 'level' => 'undergraduate', 'entrance_exams' => 'CUET-UG · University tests', 'duration' => '3 - 4 Years', 'eligibility' => '10+2 in any stream', 'display_order' => 3],
            ['slug' => 'liberal-arts', 'course_name' => 'MA', 'level' => 'postgraduate', 'entrance_exams' => 'CUET-PG · University tests', 'duration' => '2 Years', 'eligibility' => 'Bachelor degree in relevant subject', 'display_order' => 1],
            ['slug' => 'liberal-arts', 'course_name' => 'M.Sc', 'level' => 'postgraduate', 'entrance_exams' => 'CUET-PG · University tests', 'duration' => '2 Years', 'eligibility' => 'B.Sc in relevant subject', 'display_order' => 2],

            // Education & Teaching
            ['slug' => 'education', 'course_name' => 'B.Ed', 'level' => 'undergraduate', 'entrance_exams' => 'CUET-UG · State B.Ed CETs', 'duration' => '2 Years', 'eligibility' => 'Bachelor degree in any stream (min 50%)', 'display_order' => 1],
            ['slug' => 'education', 'course_name' => 'B.El.Ed', 'level' => 'undergraduate', 'entrance_exams' => 'CUET-UG', 'duration' => '4 Years', 'eligibility' => '10+2 in any stream (min 50%)', 'display_order' => 2],
            ['slug' => 'education', 'course_name' => 'M.Ed', 'level' => 'postgraduate', 'entrance_exams' => 'CUET-PG · University CETs', 'duration' => '2 Years', 'eligibility' => 'B.Ed degree (min 50%)', 'display_order' => 1],
            ['slug' => 'education', 'course_name' => 'MA (Education)', 'level' => 'postgraduate', 'entrance_exams' => 'CUET-PG', 'duration' => '2 Years', 'eligibility' => 'Bachelor degree in any stream', 'display_order' => 2],
        ];

        foreach ($coursesData as $item) {
            if (isset($streams[$item['slug']])) {
                DB::table('courses')->insert([
                    'stream_id' => $streams[$item['slug']]->id,
                    'course_name' => $item['course_name'],
                    'level' => $item['level'],
                    'entrance_exams' => $item['entrance_exams'],
                    'duration' => $item['duration'],
                    'eligibility' => $item['eligibility'],
                    'description' => $item['course_name'] . ' admission counselling, college shortlisting and entrance exam strategy.',
                    'is_active' => 1,
                    'display_order' => $item['display_order'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
