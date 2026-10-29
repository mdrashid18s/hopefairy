<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Country;
use App\Models\CountryCourse;

class CountryCourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $countries = Country::all();

        $degreeOptions = ['Master (Postgraduate)', 'Bachelor (Undergraduate)', 'MBA', 'Diploma'];

        foreach ($countries as $country) {
            $courses = is_array($country->courses) ? $country->courses : [];
            $order = 1;

            foreach ($courses as $idx => $courseTitle) {
                $degree = $degreeOptions[$idx % count($degreeOptions)];
                $duration = str_contains($degree, 'Master') || str_contains($degree, 'MBA') ? '1 - 2 Years' : '3 - 4 Years';

                CountryCourse::updateOrCreate(
                    [
                        'country_id'  => $country->id,
                        'course_name' => $courseTitle,
                    ],
                    [
                        'degree_level'  => $degree,
                        'duration'      => $duration,
                        'avg_fee'       => $country->avg_tuition ?: 'Competitive',
                        'intakes'       => is_array($country->intakes) ? implode(', ', $country->intakes) : 'Sep / Jan / May',
                        'requirements'  => 'IELTS 6.0 - 6.5 or equivalent. Minimum 55%-60% in previous qualification.',
                        'description'   => "Premier {$degree} program in {$courseTitle} offering world-class industry accreditation and post-study opportunities in {$country->name}.",
                        'is_active'     => true,
                        'display_order' => $order++,
                    ]
                );
            }
        }
    }
}
