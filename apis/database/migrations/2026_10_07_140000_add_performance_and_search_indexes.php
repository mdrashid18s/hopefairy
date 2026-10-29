<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * High-performance search, filtering, and composite ordering indexes across all tables.
     */
    public function up(): void
    {
        $indexes = [
            // 1. destinations table
            "ALTER TABLE destinations ADD INDEX IF NOT EXISTS idx_destinations_active_order (is_active, display_order)",
            "ALTER TABLE destinations ADD INDEX IF NOT EXISTS idx_destinations_code (code)",
            "ALTER TABLE destinations ADD INDEX IF NOT EXISTS idx_destinations_name (name)",
            "ALTER TABLE destinations ADD INDEX IF NOT EXISTS idx_destinations_created_at (created_at)",

            // 2. countries table
            "ALTER TABLE countries ADD INDEX IF NOT EXISTS idx_countries_active_order (is_active, display_order)",
            "ALTER TABLE countries ADD INDEX IF NOT EXISTS idx_countries_active_featured_order (is_active, is_featured, display_order)",
            "ALTER TABLE countries ADD INDEX IF NOT EXISTS idx_countries_name (name)",
            "ALTER TABLE countries ADD INDEX IF NOT EXISTS idx_countries_created_at (created_at)",

            // 3. inquiries table (CRM search, filter by status/interest/city, sorting by created_at)
            "ALTER TABLE inquiries ADD INDEX IF NOT EXISTS idx_inquiries_name (name)",
            "ALTER TABLE inquiries ADD INDEX IF NOT EXISTS idx_inquiries_city (city)",
            "ALTER TABLE inquiries ADD INDEX IF NOT EXISTS idx_inquiries_interest (interest)",
            "ALTER TABLE inquiries ADD INDEX IF NOT EXISTS idx_inquiries_is_active (is_active)",
            "ALTER TABLE inquiries ADD INDEX IF NOT EXISTS idx_inquiries_created_at (created_at)",
            "ALTER TABLE inquiries ADD INDEX IF NOT EXISTS idx_inquiries_status_created (lead_status, created_at)",
            "ALTER TABLE inquiries ADD INDEX IF NOT EXISTS idx_inquiries_active_created (is_active, created_at)",

            // 4. services table
            "ALTER TABLE services ADD INDEX IF NOT EXISTS idx_services_active_order (is_active, display_order)",
            "ALTER TABLE services ADD INDEX IF NOT EXISTS idx_services_title (title)",
            "ALTER TABLE services ADD INDEX IF NOT EXISTS idx_services_created_at (created_at)",

            // 5. india_admissions table
            "ALTER TABLE india_admissions ADD INDEX IF NOT EXISTS idx_india_active_order (is_active, display_order)",
            "ALTER TABLE india_admissions ADD INDEX IF NOT EXISTS idx_india_name (name)",
            "ALTER TABLE india_admissions ADD INDEX IF NOT EXISTS idx_india_created_at (created_at)",

            // 6. test_preps table
            "ALTER TABLE test_preps ADD INDEX IF NOT EXISTS idx_test_prep_active_order (is_active, display_order)",
            "ALTER TABLE test_preps ADD INDEX IF NOT EXISTS idx_test_prep_active_featured_order (is_active, is_featured, display_order)",
            "ALTER TABLE test_preps ADD INDEX IF NOT EXISTS idx_test_prep_name (name)",
            "ALTER TABLE test_preps ADD INDEX IF NOT EXISTS idx_test_prep_created_at (created_at)",

            // 7. testimonials table
            "ALTER TABLE testimonials ADD INDEX IF NOT EXISTS idx_testimonials_active_order (is_active, display_order)",
            "ALTER TABLE testimonials ADD INDEX IF NOT EXISTS idx_testimonials_active_featured_order (is_active, is_featured, display_order)",
            "ALTER TABLE testimonials ADD INDEX IF NOT EXISTS idx_testimonials_client_name (client_name)",
            "ALTER TABLE testimonials ADD INDEX IF NOT EXISTS idx_testimonials_country (destination_country)",
            "ALTER TABLE testimonials ADD INDEX IF NOT EXISTS idx_testimonials_created_at (created_at)",

            // 8. courses table
            "ALTER TABLE courses ADD INDEX IF NOT EXISTS idx_courses_stream_active_order (stream_id, is_active, display_order)",
            "ALTER TABLE courses ADD INDEX IF NOT EXISTS idx_courses_stream_active_level (stream_id, is_active, level)",
            "ALTER TABLE courses ADD INDEX IF NOT EXISTS idx_courses_name (course_name)",
            "ALTER TABLE courses ADD INDEX IF NOT EXISTS idx_courses_created_at (created_at)",

            // 9. country_courses table
            "ALTER TABLE country_courses ADD INDEX IF NOT EXISTS idx_country_courses_country_active_order (country_id, is_active, display_order)",
            "ALTER TABLE country_courses ADD INDEX IF NOT EXISTS idx_country_courses_name (course_name)",
            "ALTER TABLE country_courses ADD INDEX IF NOT EXISTS idx_country_courses_level (degree_level)",
            "ALTER TABLE country_courses ADD INDEX IF NOT EXISTS idx_country_courses_created_at (created_at)",

            // 10. faqs table
            "ALTER TABLE faqs ADD INDEX IF NOT EXISTS idx_faqs_active_order (is_active, display_order)",
            "ALTER TABLE faqs ADD INDEX IF NOT EXISTS idx_faqs_created_at (created_at)",

            // 11. site_settings table
            "ALTER TABLE site_settings ADD INDEX IF NOT EXISTS idx_site_settings_group (group_name)",
            "ALTER TABLE site_settings ADD INDEX IF NOT EXISTS idx_site_settings_is_active (is_active)",

            // 12. users table
            "ALTER TABLE users ADD INDEX IF NOT EXISTS idx_users_role_active (role, is_active)",
            "ALTER TABLE users ADD INDEX IF NOT EXISTS idx_users_name (name)",
            "ALTER TABLE users ADD INDEX IF NOT EXISTS idx_users_is_active (is_active)",
            "ALTER TABLE users ADD INDEX IF NOT EXISTS idx_users_created_at (created_at)",
        ];

        foreach ($indexes as $sql) {
            DB::statement($sql);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $dropStatements = [
            "ALTER TABLE destinations DROP INDEX IF EXISTS idx_destinations_active_order, DROP INDEX IF EXISTS idx_destinations_code, DROP INDEX IF EXISTS idx_destinations_name, DROP INDEX IF EXISTS idx_destinations_created_at",
            "ALTER TABLE countries DROP INDEX IF EXISTS idx_countries_active_order, DROP INDEX IF EXISTS idx_countries_active_featured_order, DROP INDEX IF EXISTS idx_countries_name, DROP INDEX IF EXISTS idx_countries_created_at",
            "ALTER TABLE inquiries DROP INDEX IF EXISTS idx_inquiries_name, DROP INDEX IF EXISTS idx_inquiries_city, DROP INDEX IF EXISTS idx_inquiries_interest, DROP INDEX IF EXISTS idx_inquiries_is_active, DROP INDEX IF EXISTS idx_inquiries_created_at, DROP INDEX IF EXISTS idx_inquiries_status_created, DROP INDEX IF EXISTS idx_inquiries_active_created",
            "ALTER TABLE services DROP INDEX IF EXISTS idx_services_active_order, DROP INDEX IF EXISTS idx_services_title, DROP INDEX IF EXISTS idx_services_created_at",
            "ALTER TABLE india_admissions DROP INDEX IF EXISTS idx_india_active_order, DROP INDEX IF EXISTS idx_india_name, DROP INDEX IF EXISTS idx_india_created_at",
            "ALTER TABLE test_preps DROP INDEX IF EXISTS idx_test_prep_active_order, DROP INDEX IF EXISTS idx_test_prep_active_featured_order, DROP INDEX IF EXISTS idx_test_prep_name, DROP INDEX IF EXISTS idx_test_prep_created_at",
            "ALTER TABLE testimonials DROP INDEX IF EXISTS idx_testimonials_active_order, DROP INDEX IF EXISTS idx_testimonials_active_featured_order, DROP INDEX IF EXISTS idx_testimonials_client_name, DROP INDEX IF EXISTS idx_testimonials_country, DROP INDEX IF EXISTS idx_testimonials_created_at",
            "ALTER TABLE courses DROP INDEX IF EXISTS idx_courses_stream_active_order, DROP INDEX IF EXISTS idx_courses_stream_active_level, DROP INDEX IF EXISTS idx_courses_name, DROP INDEX IF EXISTS idx_courses_created_at",
            "ALTER TABLE country_courses DROP INDEX IF EXISTS idx_country_courses_country_active_order, DROP INDEX IF EXISTS idx_country_courses_name, DROP INDEX IF EXISTS idx_country_courses_level, DROP INDEX IF EXISTS idx_country_courses_created_at",
            "ALTER TABLE faqs DROP INDEX IF EXISTS idx_faqs_active_order, DROP INDEX IF EXISTS idx_faqs_created_at",
            "ALTER TABLE site_settings DROP INDEX IF EXISTS idx_site_settings_group, DROP INDEX IF EXISTS idx_site_settings_is_active",
            "ALTER TABLE users DROP INDEX IF EXISTS idx_users_role_active, DROP INDEX IF EXISTS idx_users_name, DROP INDEX IF EXISTS idx_users_is_active, DROP INDEX IF EXISTS idx_users_created_at",
        ];

        foreach ($dropStatements as $sql) {
            DB::statement($sql);
        }
    }
};
