-- ============================================================================
-- HopeFairy Master Enterprise Database Architecture
-- Full Relational Schema for All Web Platform Modules:
--   1. Staff & Counsellor Management (users)
--   2. Study Abroad Destinations (countries, highlights, universities, programs)
--   3. Advisory Services (services, features, highlights, process_steps, country_services)
--   4. India Admissions (streams, stream_programs, entrance_exams, colleges)
--   5. Test Preparation (courses, subjects, batches)
--   6. Lead Inquiries & Counselling Sessions (inquiries, sessions)
--   7. Social Proof & FAQs (testimonials, faq_categories, faqs)
--   8. Dynamic Platform Settings (site_settings)
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `hopefairy`
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `hopefairy`;

-- ----------------------------------------------------------------------------
-- 1. Table: users (Staff, Admins, Counsellors)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(25) DEFAULT NULL,
  `role` ENUM('super_admin', 'admin', 'counsellor', 'editor') NOT NULL DEFAULT 'counsellor',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_is_active` (`is_active`),
  KEY `idx_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Table: countries (Master Study Abroad Destinations)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `countries` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `country_code` VARCHAR(5) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `currency` VARCHAR(25) NOT NULL DEFAULT 'USD ($)',
  `flag_code` VARCHAR(10) DEFAULT NULL,
  `tagline` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `avg_tuition` VARCHAR(100) DEFAULT NULL,
  `cost_of_living` VARCHAR(100) DEFAULT NULL,
  `post_study_work` VARCHAR(150) DEFAULT NULL,
  `intakes` VARCHAR(255) DEFAULT NULL,
  `universities_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_countries_country_code` (`country_code`),
  UNIQUE KEY `uq_countries_slug` (`slug`),
  KEY `idx_countries_is_active` (`is_active`),
  KEY `idx_countries_is_featured` (`is_featured`),
  KEY `idx_countries_display_order` (`display_order`),
  KEY `idx_countries_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Table: country_highlights (Key highlights & selling points per country)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `country_highlights` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `country_id` BIGINT UNSIGNED NOT NULL,
  `highlight_text` VARCHAR(255) NOT NULL,
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ch_country_id` (`country_id`),
  CONSTRAINT `fk_country_highlights_country` 
    FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Table: universities (Foreign Partner / Target Universities)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `universities` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `country_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(220) NOT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `ranking` INT UNSIGNED DEFAULT NULL,
  `website_url` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_universities_slug` (`slug`),
  KEY `idx_universities_country_id` (`country_id`),
  KEY `idx_universities_is_active` (`is_active`),
  KEY `idx_universities_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_universities_country` 
    FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Table: university_programs (Degrees & Courses per University)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `university_programs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `university_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(220) NOT NULL,
  `degree_level` ENUM('undergraduate', 'postgraduate', 'doctorate', 'diploma') NOT NULL DEFAULT 'postgraduate',
  `duration` VARCHAR(50) DEFAULT NULL,
  `annual_tuition` VARCHAR(100) DEFAULT NULL,
  `intake_months` VARCHAR(100) DEFAULT NULL,
  `requirements` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_up_university_id` (`university_id`),
  KEY `idx_up_degree_level` (`degree_level`),
  KEY `idx_up_is_active` (`is_active`),
  CONSTRAINT `fk_uni_prog_university` 
    FOREIGN KEY (`university_id`) REFERENCES `universities` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Table: services (Advisory Offerings)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `services` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `service_code` VARCHAR(60) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL,
  `headline` VARCHAR(255) DEFAULT NULL,
  `short_description` TEXT DEFAULT NULL,
  `icon` VARCHAR(60) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_services_code` (`service_code`),
  UNIQUE KEY `uq_services_slug` (`slug`),
  KEY `idx_services_is_active` (`is_active`),
  KEY `idx_services_display_order` (`display_order`),
  KEY `idx_services_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Table: service_features ("What's Included" feature checklist per service)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `service_features` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `service_id` BIGINT UNSIGNED NOT NULL,
  `feature_text` VARCHAR(255) NOT NULL,
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sf_service_id` (`service_id`),
  CONSTRAINT `fk_service_features_service` 
    FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. Table: service_highlights (Key value cards per service)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `service_highlights` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `service_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `icon` VARCHAR(60) DEFAULT NULL,
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sh_service_id` (`service_id`),
  CONSTRAINT `fk_service_highlights_service` 
    FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. Table: service_process_steps (Process flow roadmap per service)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `service_process_steps` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `service_id` BIGINT UNSIGNED NOT NULL,
  `step_number` INT UNSIGNED NOT NULL,
  `step_title` VARCHAR(150) NOT NULL,
  `step_description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sps_service_id` (`service_id`),
  CONSTRAINT `fk_service_process_service` 
    FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. Table: country_services (Country-Service Matrix with Custom Country Notes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `country_services` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `country_id` BIGINT UNSIGNED NOT NULL,
  `service_id` BIGINT UNSIGNED NOT NULL,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_country_service` (`country_id`, `service_id`),
  KEY `idx_cs_country_id` (`country_id`),
  KEY `idx_cs_service_id` (`service_id`),
  KEY `idx_cs_is_available` (`is_available`),
  CONSTRAINT `fk_country_services_country` 
    FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_country_services_service` 
    FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 11. Table: india_streams (India Admissions Academic Streams)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `india_streams` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(100) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(60) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_india_streams_slug` (`slug`),
  KEY `idx_india_streams_is_active` (`is_active`),
  KEY `idx_india_streams_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 12. Table: india_stream_programs (Programs per stream: UG & PG)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `india_stream_programs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `stream_id` BIGINT UNSIGNED NOT NULL,
  `level` ENUM('ug', 'pg') NOT NULL,
  `program_name` VARCHAR(100) NOT NULL,
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_isp_stream_id` (`stream_id`),
  KEY `idx_isp_level` (`level`),
  CONSTRAINT `fk_isp_stream` 
    FOREIGN KEY (`stream_id`) REFERENCES `india_streams` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 13. Table: india_entrance_exams (Entrance Exams per stream: JEE, NEET, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `india_entrance_exams` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `stream_id` BIGINT UNSIGNED NOT NULL,
  `level` ENUM('ug', 'pg') NOT NULL,
  `exam_name` VARCHAR(100) NOT NULL,
  `conducting_body` VARCHAR(150) DEFAULT NULL,
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_iee_stream_id` (`stream_id`),
  KEY `idx_iee_level` (`level`),
  CONSTRAINT `fk_iee_stream` 
    FOREIGN KEY (`stream_id`) REFERENCES `india_streams` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 14. Table: india_colleges (Top Indian Institutions / Colleges)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `india_colleges` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `stream_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(220) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `nirf_ranking` INT UNSIGNED DEFAULT NULL,
  `college_type` ENUM('government', 'private', 'deemed') NOT NULL DEFAULT 'government',
  `website_url` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_india_colleges_slug` (`slug`),
  KEY `idx_ic_stream_id` (`stream_id`),
  KEY `idx_ic_is_active` (`is_active`),
  CONSTRAINT `fk_ic_stream` 
    FOREIGN KEY (`stream_id`) REFERENCES `india_streams` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 15. Table: test_prep_courses (Coaching Programs: IMAT, GMAT, IELTS, CELPIP)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `test_prep_courses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(25) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL,
  `flag_code` VARCHAR(10) DEFAULT NULL,
  `tagline` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `icon` VARCHAR(60) DEFAULT NULL,
  `cta_text` VARCHAR(100) DEFAULT 'Enquire about coaching',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_test_prep_code` (`code`),
  UNIQUE KEY `uq_test_prep_slug` (`slug`),
  KEY `idx_test_prep_is_featured` (`is_featured`),
  KEY `idx_test_prep_is_active` (`is_active`),
  KEY `idx_test_prep_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 16. Table: test_prep_subjects (Syllabus & Subject breakdown per exam)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `test_prep_subjects` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `test_prep_id` BIGINT UNSIGNED NOT NULL,
  `subject_name` VARCHAR(100) NOT NULL,
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tps_test_prep_id` (`test_prep_id`),
  CONSTRAINT `fk_tps_test_prep` 
    FOREIGN KEY (`test_prep_id`) REFERENCES `test_prep_courses` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 17. Table: test_prep_batches (Upcoming Live/Offline Batches & Schedules)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `test_prep_batches` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `test_prep_id` BIGINT UNSIGNED NOT NULL,
  `batch_title` VARCHAR(150) NOT NULL,
  `mode` ENUM('online_live', 'classroom_offline', 'hybrid') NOT NULL DEFAULT 'online_live',
  `start_date` DATE NOT NULL,
  `timing` VARCHAR(100) DEFAULT NULL,
  `duration_weeks` INT UNSIGNED NOT NULL DEFAULT 8,
  `fee_amount` DECIMAL(10,2) DEFAULT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR (₹)',
  `seats_limit` INT UNSIGNED DEFAULT 25,
  `is_enrollment_open` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tpb_test_prep_id` (`test_prep_id`),
  KEY `idx_tpb_start_date` (`start_date`),
  KEY `idx_tpb_is_enrollment_open` (`is_enrollment_open`),
  CONSTRAINT `fk_tpb_test_prep` 
    FOREIGN KEY (`test_prep_id`) REFERENCES `test_prep_courses` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 18. Table: inquiries (Leads & Booking Submissions)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(25) NOT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `interest` VARCHAR(100) NOT NULL,
  `qualification` VARCHAR(100) DEFAULT NULL,
  `study_level` VARCHAR(100) DEFAULT NULL,
  `destination_country_id` BIGINT UNSIGNED DEFAULT NULL,
  `service_id` BIGINT UNSIGNED DEFAULT NULL,
  `test_prep_id` BIGINT UNSIGNED DEFAULT NULL,
  `india_stream_id` BIGINT UNSIGNED DEFAULT NULL,
  `intake_timeline` VARCHAR(100) DEFAULT NULL,
  `course_interest` VARCHAR(150) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `lead_status` ENUM('new', 'contacted', 'session_scheduled', 'in_progress', 'converted', 'closed', 'junk') NOT NULL DEFAULT 'new',
  `assigned_counsellor_id` BIGINT UNSIGNED DEFAULT NULL,
  `counsellor_notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_inq_email` (`email`),
  KEY `idx_inq_phone` (`phone`),
  KEY `idx_inq_lead_status` (`lead_status`),
  KEY `idx_inq_created_at` (`created_at`),
  KEY `idx_inq_destination_id` (`destination_country_id`),
  KEY `idx_inq_service_id` (`service_id`),
  KEY `idx_inq_test_prep_id` (`test_prep_id`),
  KEY `idx_inq_stream_id` (`india_stream_id`),
  KEY `idx_inq_counsellor_id` (`assigned_counsellor_id`),
  CONSTRAINT `fk_inq_destination` 
    FOREIGN KEY (`destination_country_id`) REFERENCES `countries` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_inq_service` 
    FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_inq_test_prep` 
    FOREIGN KEY (`test_prep_id`) REFERENCES `test_prep_courses` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_inq_stream` 
    FOREIGN KEY (`india_stream_id`) REFERENCES `india_streams` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_inq_counsellor` 
    FOREIGN KEY (`assigned_counsellor_id`) REFERENCES `users` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 19. Table: counselling_sessions (1:1 Scheduled Appointments)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `counselling_sessions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `inquiry_id` BIGINT UNSIGNED NOT NULL,
  `counsellor_id` BIGINT UNSIGNED DEFAULT NULL,
  `session_date` DATETIME NOT NULL,
  `session_mode` ENUM('google_meet', 'zoom', 'phone_call', 'in_person') NOT NULL DEFAULT 'google_meet',
  `meeting_link` VARCHAR(255) DEFAULT NULL,
  `session_status` ENUM('scheduled', 'completed', 'rescheduled', 'cancelled', 'no_show') NOT NULL DEFAULT 'scheduled',
  `student_notes` TEXT DEFAULT NULL,
  `counsellor_summary` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_csess_inquiry_id` (`inquiry_id`),
  KEY `idx_csess_counsellor_id` (`counsellor_id`),
  KEY `idx_csess_date` (`session_date`),
  KEY `idx_csess_status` (`session_status`),
  CONSTRAINT `fk_csess_inquiry` 
    FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_csess_counsellor` 
    FOREIGN KEY (`counsellor_id`) REFERENCES `users` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 20. Table: testimonials (Student Success Stories)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_name` VARCHAR(100) NOT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `country_id` BIGINT UNSIGNED DEFAULT NULL,
  `university_id` BIGINT UNSIGNED DEFAULT NULL,
  `course_name` VARCHAR(150) DEFAULT NULL,
  `quote` TEXT NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL DEFAULT 5,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_testi_country_id` (`country_id`),
  KEY `idx_testi_university_id` (`university_id`),
  KEY `idx_testi_is_published` (`is_published`),
  CONSTRAINT `fk_testi_country` 
    FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_testi_university` 
    FOREIGN KEY (`university_id`) REFERENCES `universities` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 21. Table: faq_categories (FAQ Groups: General, Visas, Admissions, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `faq_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_faqc_slug` (`slug`),
  KEY `idx_faqc_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 22. Table: faqs (Frequently Asked Questions)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `question` TEXT NOT NULL,
  `answer` TEXT NOT NULL,
  `display_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_faqs_category_id` (`category_id`),
  KEY `idx_faqs_is_active` (`is_active`),
  CONSTRAINT `fk_faqs_category` 
    FOREIGN KEY (`category_id`) REFERENCES `faq_categories` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 23. Table: site_settings (Dynamic Configuration & Contact Data)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT DEFAULT NULL,
  `group_name` VARCHAR(50) NOT NULL DEFAULT 'general',
  `is_public` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_setting_key` (`setting_key`),
  KEY `idx_settings_group` (`group_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- COMPREHENSIVE SEED DATA
-- ============================================================================

-- 1. Users (Admins and Counsellors)
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `role`, `is_active`) VALUES
(1, 'Lead Super Admin', 'admin@hopefairy.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+91 98765 43210', 'super_admin', 1),
(2, 'Senior Study Abroad Counsellor', 'counsellor@hopefairy.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+91 98765 43211', 'counsellor', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 2. Countries
INSERT INTO `countries` (`id`, `country_code`, `name`, `slug`, `currency`, `flag_code`, `tagline`, `description`, `avg_tuition`, `cost_of_living`, `post_study_work`, `intakes`, `universities_count`, `is_active`, `is_featured`, `display_order`) VALUES
(1, 'GB', 'United Kingdom', 'united-kingdom', 'GBP (£)', 'GB', 'World-renowned universities and shorter degrees.', 'Study in the UK with globally recognised universities, 1-year master programmes, and post-study work opportunities.', '£12,000 - £25,000 / year', '£9,000 - £12,000 / year', '2 Years Graduate Route (3 Years for PhD)', 'September, January', 150, 1, 1, 1),
(2, 'US', 'United States', 'united-states', 'USD ($)', 'US', 'The widest choice of universities and programmes.', 'Study in the USA with unmatched academic flexibility, world-leading research, and up to 3 years STEM OPT extension.', '$20,000 - $45,000 / year', '$12,000 - $18,000 / year', '1 Year OPT (up to 3 Years for STEM)', 'Fall (Aug/Sep), Spring (Jan)', 350, 1, 1, 2),
(3, 'CA', 'Canada', 'canada', 'CAD ($)', 'CA', 'Quality education in a welcoming, multicultural country.', 'Canada offers top-tier academic institutions, welcoming communities, co-op work-integrated learning, and post-graduation work permits.', 'CAD 15,000 - 35,000 / year', 'CAD 12,000 - 15,000 / year', 'Up to 3 Years PGWP', 'September, January, May', 100, 1, 1, 3),
(4, 'AU', 'Australia', 'australia', 'AUD ($)', 'AU', 'Top universities, great lifestyle and strong outcomes.', 'Australia is home to world-class Group of Eight universities, exceptional lifestyle, and attractive post-study work rights.', 'AUD 20,000 - 42,000 / year', 'AUD 21,000 / year', '2 to 4 Years Temporary Graduate Visa', 'February, July', 45, 1, 1, 4),
(5, 'IE', 'Ireland', 'ireland', 'EUR (€)', 'IE', 'Europe’s English-speaking tech and pharma hub.', 'Study in Ireland, Europe’s buzzing tech headquarters, offering 2-year stay back for masters graduates in an English-speaking EU country.', '€10,000 - €22,000 / year', '€10,000 - €12,000 / year', '2 Years Third Level Graduate Scheme', 'September, January', 30, 1, 1, 5),
(6, 'DE', 'Germany', 'germany', 'EUR (€)', 'DE', 'Engineering excellence with low or no tuition at many public universities.', 'Germany is the engineering power-house of Europe with zero or low tuition fees at public universities and an 18-month job seeker visa.', '€0 - €3,000 / year (Public)', '€11,208 / year (Blocked Account)', '18 Months Job Seeker Residence Permit', 'Winter (Oct), Summer (Apr)', 80, 1, 1, 6),
(7, 'NZ', 'New Zealand', 'new-zealand', 'NZD ($)', 'NZ', 'A safe, peaceful country with practical, hands-on learning.', 'New Zealand offers world-ranked universities, high student safety, and generous post-study work visas.', 'NZD 22,000 - 36,000 / year', 'NZD 20,000 / year', 'Up to 3 Years Post Study Work Visa', 'February, July', 25, 1, 0, 7),
(8, 'FR', 'France', 'france', 'EUR (€)', 'FR', 'Elite business schools at the heart of Europe.', 'Study in France with globally accredited Grandes Écoles and business schools, subsidized housing, and Schengen travel benefits.', '€4,000 - €18,000 / year', '€9,000 - €12,000 / year', '2 Years APS / Post-Study Visa', 'September, January', 40, 1, 0, 8)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. Country Highlights
INSERT INTO `country_highlights` (`id`, `country_id`, `highlight_text`, `display_order`) VALUES
(1, 1, 'Many master’s degrees completed in just 1 year', 1),
(2, 1, '2-Year Post-study graduate work visa', 2),
(3, 1, 'Globally recognised, historic Russell Group institutions', 3),
(4, 2, 'Widest range of academic majors and STEM research opportunities', 1),
(5, 2, 'Up to 36 months OPT work authorization for STEM graduates', 2),
(6, 2, 'World-class campus facilities and extensive global alumni network', 3),
(7, 3, 'Up to 3-Year Post-Graduation Work Permit (PGWP)', 1),
(8, 3, 'Co-op programs with integrated paid industry internships', 2),
(9, 3, 'Safe, multicultural and immigrant-welcoming society', 3),
(10, 4, 'Top-ranked Group of Eight (Go8) universities', 1),
(11, 4, 'Generous post-study work rights (up to 4 years)', 2),
(12, 4, 'High minimum wage and excellent standard of living', 3),
(13, 5, 'European headquarters for Google, Meta, Apple & Pfizer', 1),
(14, 5, '2-Year stay-back work permit for Master’s graduates', 2),
(15, 5, 'The only English-speaking tech hub in the European Union', 3),
(16, 6, 'Low or zero tuition fees at world-renowned public universities', 1),
(17, 6, '18-Month post-study job seeker visa', 2),
(18, 6, 'Global leader in automotive, mechanical and green engineering', 3),
(19, 7, 'Consistently ranked among the top 10 safest countries globally', 1),
(20, 7, 'Post-study work rights up to 3 years for eligible graduates', 2),
(21, 7, 'Hands-on, research-backed practical education model', 3),
(22, 8, 'Elite Grandes Écoles and top European business schools', 1),
(23, 8, 'Government housing subsidy (CAF) available for international students', 2),
(24, 8, '2-Year post-study work visa (APS) and Schengen mobility', 3)
ON DUPLICATE KEY UPDATE `highlight_text` = VALUES(`highlight_text`);

-- 4. Universities
INSERT INTO `universities` (`id`, `country_id`, `name`, `slug`, `city`, `ranking`, `website_url`, `is_active`) VALUES
(1, 1, 'University of Oxford', 'university-of-oxford', 'Oxford', 1, 'https://www.ox.ac.uk', 1),
(2, 1, 'University of Cambridge', 'university-of-cambridge', 'Cambridge', 2, 'https://www.cam.ac.uk', 1),
(3, 1, 'Imperial College London', 'imperial-college-london', 'London', 6, 'https://www.imperial.ac.uk', 1),
(4, 2, 'Harvard University', 'harvard-university', 'Cambridge, MA', 4, 'https://www.harvard.edu', 1),
(5, 2, 'Stanford University', 'stanford-university', 'Stanford, CA', 5, 'https://www.stanford.edu', 1),
(6, 3, 'University of Toronto', 'university-of-toronto', 'Toronto, ON', 21, 'https://www.utoronto.ca', 1),
(7, 3, 'University of British Columbia', 'university-of-british-columbia', 'Vancouver, BC', 34, 'https://www.ubc.ca', 1),
(8, 4, 'University of Melbourne', 'university-of-melbourne', 'Melbourne, VIC', 14, 'https://www.unimelb.edu.au', 1),
(9, 4, 'University of Sydney', 'university-of-sydney', 'Sydney, NSW', 19, 'https://www.sydney.edu.au', 1),
(10, 5, 'Trinity College Dublin', 'trinity-college-dublin', 'Dublin', 81, 'https://www.tcd.ie', 1),
(11, 6, 'Technical University of Munich', 'tum-germany', 'Munich', 37, 'https://www.tum.de', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 5. University Programs
INSERT INTO `university_programs` (`university_id`, `title`, `slug`, `degree_level`, `duration`, `annual_tuition`, `intake_months`) VALUES
(1, 'MSc Computer Science', 'oxford-msc-computer-science', 'postgraduate', '1 Year', '£36,000', 'October'),
(1, 'Full-time MBA (Saïd Business School)', 'oxford-said-mba', 'postgraduate', '1 Year', '£78,500', 'September'),
(3, 'MSc Data Science & Artificial Intelligence', 'imperial-msc-ai', 'postgraduate', '1 Year', '£41,000', 'October'),
(4, 'Master in Public Policy (MPP)', 'harvard-mpp', 'postgraduate', '2 Years', '$58,000', 'August'),
(5, 'MS Computer Science (AI Track)', 'stanford-ms-cs', 'postgraduate', '2 Years', '$62,000', 'September'),
(6, 'Master of Management Analytics', 'utoronto-mma', 'postgraduate', '1 Year', 'CAD 48,000', 'September'),
(8, 'Master of Information Technology', 'unimelb-mit', 'postgraduate', '2 Years', 'AUD 51,000', 'February, July'),
(10, 'MSc Finance', 'trinity-msc-finance', 'postgraduate', '1 Year', '€24,000', 'September'),
(11, 'MSc Automotive Engineering', 'tum-automotive-engineering', 'postgraduate', '2 Years', '€0 (Tuition-free)', 'October');

-- 6. Services
INSERT INTO `services` (`id`, `service_code`, `title`, `slug`, `headline`, `short_description`, `icon`, `is_active`, `display_order`) VALUES
(1, 'career-counselling', 'Career Counselling', 'career-counselling', 'Clarity Before You Commit', 'Understand your strengths, interests and goals, then map them to the right course, country and career path.', 'compass', 1, 1),
(2, 'university-admissions', 'University Admissions', 'university-admissions', 'The Right University, Not Just Any University', 'A balanced university shortlist and expertly managed applications for undergraduate, postgraduate and diploma programmes.', 'graduation-cap', 1, 2),
(3, 'sop-lor-guidance', 'SOP, LOR & Essays Guidance', 'sop-lor-guidance', 'Applications That Sound Like You — Only Stronger', 'Structured guidance on Statements of Purpose, recommendation letters, essays and CVs that help your application stand out.', 'file-text', 1, 3),
(4, 'test-preparation', 'Test Preparation', 'test-preparation', 'Coaching For Global & Medical Admissions', 'Structured test prep for IMAT, GMAT, IELTS and CELPIP with experienced faculty and targeted practice.', 'award', 1, 4),
(5, 'scholarships-financial-aid', 'Scholarships & Financial Aid', 'scholarships-financial-aid', 'Making Global Education Affordable', 'Identify merit-based, need-based and university scholarships, plus education loan guidance and proof-of-funds planning.', 'badge-percent', 1, 5),
(6, 'visa-assistance', 'Visa Assistance', 'visa-assistance', 'End-to-End Student Visa Filing & Mock Interviews', 'Document verification, financial documentation checks, visa filing, and one-to-one mock interview preparation.', 'shield-check', 1, 6),
(7, 'pre-departure-briefing', 'Pre-Departure Briefing', 'pre-departure-briefing', 'Step Off the Plane Prepared', 'Guidance on student accommodation, currency exchange, SIM cards, packing essentials and airport arrival protocols.', 'plane-takeoff', 1, 7),
(8, 'accommodation-support', 'Accommodation Support', 'accommodation-support', 'Safe, Student-Friendly Stays', 'Assistance with university dorms, private student residences, and verified PBSA apartments.', 'home', 1, 8)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 7. Service Features ("What's Included")
INSERT INTO `service_features` (`service_id`, `feature_text`, `display_order`) VALUES
(1, 'One-to-one career discovery session with dedicated expert', 1),
(1, 'Academic profile and aptitude evaluation', 2),
(1, 'Country and budget return-on-investment fit analysis', 3),
(1, 'Parent counselling session and joint family roadmap', 4),
(2, 'Personalised shortlist: ambitious, target, and safe universities', 1),
(2, 'Application calendar and deadline tracking', 2),
(2, 'Direct portal form review and submission management', 3),
(2, 'Offer comparison and conditional-to-unconditional support', 4),
(6, 'Visa document checklist and financial statement verification', 1),
(6, 'Embassy portal filing with zero errors guarantee', 2),
(6, '1:1 intense mock interview coaching sessions', 3),
(6, 'Biometrics and appointment booking assistance', 4);

-- 8. Service Highlights
INSERT INTO `service_highlights` (`service_id`, `title`, `description`, `icon`, `display_order`) VALUES
(1, 'Know your options', 'See the courses and careers that suit your profile — not just the popular ones.', 'lightbulb', 1),
(1, 'Plan with your family', 'Sessions that include parents, so every decision is made together and with confidence.', 'heart-handshake', 2),
(2, 'Balanced shortlist', 'Ambitious, target and safe choices so you apply with confidence and realistic odds.', 'target', 1),
(6, 'High Visa Success Rate', 'Meticulous document verification ensures peace of mind before visa stamping.', 'shield-check', 1);

-- 9. Service Process Steps
INSERT INTO `service_process_steps` (`service_id`, `step_number`, `step_title`, `step_description`) VALUES
(1, 1, 'Discovery Call', 'Understand student interests, academic history and goals.'),
(1, 2, 'Profile Assessment', 'Analyze scores, extracurriculars, and budget.'),
(1, 3, 'Career Mapping', 'Match ambitions with high-growth global professions.'),
(1, 4, 'Action Plan', 'Finalize a milestone timeline with deadlines and test dates.'),
(2, 1, 'Shortlisting', 'Prepare balanced ambitious, target and safe options.'),
(2, 2, 'Documents Prep', 'Gather transcripts, recommendations and portfolio.'),
(2, 3, 'Submission', 'Review every line and submit directly to universities.');

-- 10. Country Services (Pivot table)
INSERT INTO `country_services` (`country_id`, `service_id`, `is_available`, `notes`) VALUES
(1, 1, 1, 'Profile evaluation and UK university fit mapping'),
(1, 2, 1, 'Direct admissions via UCAS or university portals'),
(1, 3, 1, 'UK-specific personal statements and academic references'),
(1, 4, 1, 'IELTS Academic, PTE Academic & CELPIP preparation'),
(1, 5, 1, 'Chevening, GREAT scholarships and university bursaries'),
(1, 6, 1, 'Student Visa (Tier 4 / Student Route) filing with CAS support'),
(1, 7, 1, 'BRP collection guidance and London/regional airport prep'),
(1, 8, 1, 'University halls and verified UK PBSA providers'),
(2, 1, 1, 'US college selection & Ivy/Tier-1 fit strategy'),
(2, 2, 1, 'Common App, Coalition, and graduate department applications'),
(2, 6, 1, 'F-1 Visa slot booking, DS-160 filing, and intense mock interviews'),
(3, 1, 1, 'Provincial college and university pathway guidance'),
(3, 6, 1, 'Study Permit application (SDS / Non-SDS stream) with GIC setup'),
(4, 1, 1, 'Group of Eight (Go8) and regional universities counselling'),
(4, 6, 1, 'Subclass 500 Student Visa with OSHC health insurance setup'),
(5, 1, 1, 'Tech, Biotech and Pharma industry-aligned university fit'),
(5, 6, 1, 'Irish Student Visa (Stamp 2) application support'),
(6, 1, 1, 'Public vs. Private university mapping for tuition-free studies'),
(6, 6, 1, 'National German Student Visa (Type D) with Blocked Account setup'),
(7, 1, 1, 'Hands-on practical and research university roadmap'),
(8, 1, 1, 'Grandes Écoles, business schools and engineering schools fit')
ON DUPLICATE KEY UPDATE `is_available` = VALUES(`is_available`);

-- 11. India Streams
INSERT INTO `india_streams` (`id`, `slug`, `name`, `icon`, `description`, `is_active`, `display_order`) VALUES
(1, 'engineering', 'Engineering', 'cpu', 'College and branch selection, counselling rounds and seat allocation guidance.', 1, 1),
(2, 'medicine', 'Medicine', 'stethoscope', 'Guidance through medical counselling, college choices and documentation.', 1, 2),
(3, 'management', 'Management', 'briefcase', 'B-school shortlisting, applications, essays and interview preparation.', 1, 3),
(4, 'law', 'Law', 'scale', 'NLU and law school selection, applications and counselling support.', 1, 4),
(5, 'liberal-arts', 'Liberal Arts', 'palette', 'Finding the right liberal arts university, program fit and application essays.', 1, 5)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 12. India Stream Programs
INSERT INTO `india_stream_programs` (`stream_id`, `level`, `program_name`, `display_order`) VALUES
(1, 'ug', 'B.Tech', 1),
(1, 'ug', 'B.E.', 2),
(1, 'pg', 'M.Tech', 1),
(1, 'pg', 'M.E.', 2),
(1, 'pg', 'MS (Research)', 3),
(2, 'ug', 'MBBS', 1),
(2, 'ug', 'BDS', 2),
(2, 'ug', 'BAMS', 3),
(2, 'ug', 'B.Sc Nursing', 4),
(2, 'pg', 'MD', 1),
(2, 'pg', 'MS', 2),
(2, 'pg', 'MDS', 3),
(3, 'ug', 'BBA', 1),
(3, 'ug', 'BMS', 2),
(3, 'ug', 'Integrated IPM', 3),
(3, 'pg', 'MBA', 1),
(3, 'pg', 'PGDM', 2),
(4, 'ug', 'BA LL.B', 1),
(4, 'ug', 'BBA LL.B', 2),
(4, 'ug', 'LL.B (3-year)', 3),
(4, 'pg', 'LL.M', 1),
(5, 'ug', 'BA (Hons)', 1),
(5, 'ug', 'B.Sc (Hons)', 2),
(5, 'ug', 'Liberal Arts & Sciences', 3),
(5, 'pg', 'MA', 1),
(5, 'pg', 'M.Sc', 2);

-- 13. India Entrance Exams
INSERT INTO `india_entrance_exams` (`stream_id`, `level`, `exam_name`, `conducting_body`, `display_order`) VALUES
(1, 'ug', 'JEE Main', 'NTA', 1),
(1, 'ug', 'JEE Advanced', 'IITs', 2),
(1, 'ug', 'State CETs (MHT-CET, KCET, WBJEE)', 'State Authorities', 3),
(1, 'pg', 'GATE', 'IISc / IITs', 1),
(2, 'ug', 'NEET-UG', 'NTA', 1),
(2, 'pg', 'NEET-PG', 'NBE', 1),
(2, 'pg', 'INI-CET', 'AIIMS New Delhi', 2),
(3, 'ug', 'IPMAT', 'IIM Indore / Rohtak', 1),
(3, 'ug', 'CUET-UG', 'NTA', 2),
(3, 'pg', 'CAT', 'IIMs', 1),
(3, 'pg', 'XAT', 'XLRI Jamshedpur', 2),
(3, 'pg', 'GMAT', 'GMAC', 3),
(4, 'ug', 'CLAT', 'Consortium of NLUs', 1),
(4, 'ug', 'AILET', 'NLU Delhi', 2),
(4, 'pg', 'CLAT PG', 'Consortium of NLUs', 1),
(5, 'ug', 'CUET-UG', 'NTA', 1),
(5, 'pg', 'CUET-PG', 'NTA', 1);

-- 14. India Colleges
INSERT INTO `india_colleges` (`stream_id`, `name`, `slug`, `city`, `state`, `nirf_ranking`, `college_type`, `website_url`) VALUES
(1, 'Indian Institute of Technology Delhi (IITD)', 'iit-delhi', 'New Delhi', 'Delhi', 2, 'government', 'https://home.iitd.ac.in'),
(1, 'Indian Institute of Technology Bombay (IITB)', 'iit-bombay', 'Mumbai', 'Maharashtra', 3, 'government', 'https://www.iitb.ac.in'),
(2, 'All India Institute of Medical Sciences (AIIMS)', 'aiims-new-delhi', 'New Delhi', 'Delhi', 1, 'government', 'https://www.aiims.edu'),
(2, 'Christian Medical College (CMC)', 'cmc-vellore', 'Vellore', 'Tamil Nadu', 3, 'private', 'https://www.cmch-vellore.edu'),
(3, 'Indian Institute of Management Ahmedabad (IIMA)', 'iim-ahmedabad', 'Ahmedabad', 'Gujarat', 1, 'government', 'https://www.iima.ac.in'),
(3, 'Indian Institute of Management Bangalore (IIMB)', 'iim-bangalore', 'Bengaluru', 'Karnataka', 2, 'government', 'https://www.iimb.ac.in'),
(4, 'National Law School of India University (NLSIU)', 'nlsiu-bengaluru', 'Bengaluru', 'Karnataka', 1, 'government', 'https://www.nls.ac.in'),
(5, 'Ashoka University', 'ashoka-university', 'Sonipat', 'Haryana', 12, 'private', 'https://www.ashoka.edu.in');

-- 15. Test Prep Courses
INSERT INTO `test_prep_courses` (`id`, `code`, `name`, `slug`, `flag_code`, `tagline`, `description`, `is_featured`, `icon`, `cta_text`, `is_active`, `display_order`) VALUES
(1, 'IMAT', 'International Medical Admissions Test', 'imat', 'IT', 'Your route to studying Medicine in English at Italy’s public universities.', 'IMAT is the entrance test for English-taught Medicine and Surgery programs at Italy’s public universities. Our IMAT program prepares you for every section and guides you through the admission process.', 1, 'trophy', 'Enquire about IMAT coaching', 1, 1),
(2, 'GMAT', 'Graduate Management Admission Test', 'gmat', NULL, 'For MBA and business master’s programs worldwide.', 'GMAT test preparation focusing on quantitative reasoning, verbal reasoning, and data insights with tailored practice tests.', 0, 'briefcase', 'Enquire about GMAT coaching', 1, 2),
(3, 'IELTS', 'International English Language Testing System', 'ielts', NULL, 'English proficiency for study, work and global migration.', 'IELTS Academic & General training covering listening, reading, writing, and speaking with official Cambridge practice materials.', 0, 'languages', 'Enquire about IELTS coaching', 1, 3),
(4, 'CELPIP', 'Canadian English Language Proficiency Index Program', 'celpip', 'CA', 'Canada’s English test for permanent residence and study.', 'Targeted CELPIP preparation for students and professionals targeting immigration or studies in Canada.', 0, 'message-circle', 'Enquire about CELPIP coaching', 1, 4)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 16. Test Prep Subjects
INSERT INTO `test_prep_subjects` (`test_prep_id`, `subject_name`, `display_order`) VALUES
(1, 'Biology', 1),
(1, 'Chemistry', 2),
(1, 'Physics', 3),
(1, 'Mathematics', 4),
(1, 'Logical Reasoning & General Knowledge', 5),
(2, 'Quantitative Reasoning', 1),
(2, 'Verbal Reasoning', 2),
(2, 'Data Insights', 3),
(3, 'Listening', 1),
(3, 'Reading', 2),
(3, 'Writing', 3),
(3, 'Speaking', 4);

-- 17. Test Prep Batches
INSERT INTO `test_prep_batches` (`test_prep_id`, `batch_title`, `mode`, `start_date`, `timing`, `duration_weeks`, `fee_amount`, `seats_limit`, `is_enrollment_open`) VALUES
(1, 'IMAT 2027 Comprehensive Master Batch', 'online_live', '2026-10-15', 'Mon-Fri 6:30 PM - 8:30 PM IST', 16, 45000.00, 20, 1),
(2, 'GMAT Focus Edition 8-Week Sprint', 'online_live', '2026-10-20', 'Tue, Thu, Sat 7:00 PM - 9:00 PM IST', 8, 35000.00, 15, 1),
(3, 'IELTS Academic Band 8+ Masterclass', 'online_live', '2026-10-10', 'Daily Mon-Fri 8:00 AM - 9:30 AM IST', 4, 15000.00, 25, 1);

-- 18. Sample Inquiries / Leads
INSERT INTO `inquiries` (`name`, `email`, `phone`, `city`, `interest`, `qualification`, `study_level`, `destination_country_id`, `service_id`, `intake_timeline`, `course_interest`, `message`, `lead_status`, `assigned_counsellor_id`) VALUES
('Aarav Sharma', 'aarav.sharma@example.com', '+91 98201 12345', 'Delhi', 'Study abroad', 'Bachelor’s (completed)', 'Master’s / Postgraduate', 1, 2, '6–12 months', 'MSc Data Science', 'Looking for September intake master degree options in the UK with scholarship support.', 'new', 2),
('Diya Patel', 'diya.patel@example.com', '+91 98790 54321', 'Ahmedabad', 'Test preparation (IMAT)', 'Class 12 (pursuing / completed)', 'Bachelor’s / Undergraduate', 6, 4, 'Within 6 months', 'MBBS (English in Italy)', 'Interested in joining the upcoming IMAT batch for Italian medical universities.', 'session_scheduled', 2),
('Rohan Verma', 'rohan.verma@example.com', '+91 99887 76655', 'Bangalore', 'Admission in India', 'Bachelor’s (pursuing / completed)', 'MBA', NULL, NULL, '12–18 months', 'MBA Marketing', 'Need guidance on CAT preparation and top Indian B-school shortlisting.', 'contacted', 2);

-- 19. Counselling Sessions
INSERT INTO `counselling_sessions` (`inquiry_id`, `counsellor_id`, `session_date`, `session_mode`, `meeting_link`, `session_status`, `student_notes`, `counsellor_summary`) VALUES
(2, 2, '2026-10-02 11:00:00', 'google_meet', 'https://meet.google.com/hpf-counselling-demo', 'scheduled', 'Wants to understand IMAT syllabus, test dates and Italy visa blocked account.', 'Introductory 1:1 counselling booked.');

-- 20. Testimonials
INSERT INTO `testimonials` (`student_name`, `avatar`, `country_id`, `university_id`, `course_name`, `quote`, `rating`, `is_featured`, `is_published`, `display_order`) VALUES
('Priya Nair', '/avatars/student-1.jpg', 1, 1, 'MSc Advanced Computer Science · UK', 'HopeFairy’s counselling made my Oxford application seamless. From SOP editing to visa interview prep, my counsellor was with me at every single step.', 5, 1, 1, 1),
('Kabir Mehta', '/avatars/student-2.jpg', 6, 11, 'MSc Automotive Systems · Germany', 'Studying in Germany tuition-free felt complicated until HopeFairy guided me through APS certification and university selection. Highly recommended!', 5, 1, 1, 2),
('Ananya Gupta', '/avatars/student-3.jpg', 2, 4, 'Master in Public Policy · USA', 'The 1:1 guidance was honest and personal. No false promises, just genuine work on my profile that got me admitted with a merit fellowship.', 5, 1, 1, 3);

-- 21. FAQ Categories
INSERT INTO `faq_categories` (`id`, `name`, `slug`, `display_order`, `is_active`) VALUES
(1, 'General & Counselling', 'general', 1, 1),
(2, 'Study Abroad & Admissions', 'study-abroad', 2, 1),
(3, 'Visas & Post-Study Work', 'visas', 3, 1),
(4, 'Test Preparation & Coaching', 'test-prep', 4, 1),
(5, 'India Admissions', 'india-admissions', 5, 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 22. FAQs
INSERT INTO `faqs` (`category_id`, `question`, `answer`, `display_order`, `is_active`) VALUES
(1, 'When should I start planning to study abroad?', 'Ideally 12 to 18 months before your intended intake. That leaves comfortable time for tests, shortlisting, applications, scholarships and the visa. If your intake is sooner, talk to us — shorter timelines are often still possible.', 1, 1),
(1, 'Is the first counselling session free?', 'Yes. Your first counselling session is free and comes with no obligation. It’s a chance to understand your options and see whether we’re the right fit for you.', 2, 1),
(2, 'Do I need IELTS or another English test?', 'Most universities in English-speaking countries ask for an English proficiency test such as IELTS, TOEFL, PTE or Duolingo. Some universities may waive it based on your academic record. We check this for every university on your shortlist.', 3, 1),
(2, 'Can you guarantee admission or a visa?', 'No honest consultant can. Admission decisions are made by universities and visa decisions by embassies. What we do guarantee is careful, thorough preparation to make your application as strong as it can be.', 4, 1),
(2, 'How much does it cost to study abroad?', 'It depends on the country, city, university and course. In counselling we build a realistic budget covering tuition and living costs, and explore scholarships and education loans to make it work.', 5, 1),
(3, 'Can I work part-time while studying?', 'Most popular study destinations allow students to work part-time during term, within limits. The rules differ by country and change from time to time, so we brief you on the current rules for your destination.', 6, 1);

-- 23. Dynamic Site Settings
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `group_name`, `is_public`) VALUES
('site_name', 'HopeFairy', 'general', 1),
('site_tagline', 'Where Dreams Meet Destinations', 'general', 1),
('site_kicker', 'Study Abroad · India Admissions · Test Prep', 'general', 1),
('contact_email', 'info@hopefairy.com', 'contact', 1),
('contact_phone', '+91 98765 43210', 'contact', 1),
('contact_whatsapp', '+919876543210', 'contact', 1),
('office_hours', 'Mon – Sat · 10:00 AM – 7:00 PM IST', 'contact', 1),
('office_location', 'India', 'contact', 1),
('social_instagram', 'https://instagram.com/hopefairy', 'social', 1),
('social_linkedin', 'https://linkedin.com/company/hopefairy', 'social', 1),
('social_youtube', 'https://youtube.com/@hopefairy', 'social', 1)
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);
