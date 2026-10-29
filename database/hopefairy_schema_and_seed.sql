-- ============================================================================
-- HopeFairy Study Abroad & Admissions Platform
-- Database Schema: Countries & Country Services Architecture
-- Database Engine: InnoDB (Full Foreign Key Constraints, Cascades, Soft Deletes)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `hopefairy` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `hopefairy`;

-- ----------------------------------------------------------------------------
-- 1. Table: countries (Master Study Abroad Destinations)
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
-- 2. Table: services (Consultancy & Advisory Offerings)
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
-- 3. Table: country_services (Pivot: Which services are active in which country)
--    Full FOREIGN KEY constraints with ON DELETE CASCADE and ON UPDATE CASCADE
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
-- 4. Table: country_highlights (Key advantages per destination)
--    Full FOREIGN KEY constraint with ON DELETE CASCADE and ON UPDATE CASCADE
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
-- 5. Table: universities (Universities under each destination)
--    Full FOREIGN KEY constraint with ON DELETE CASCADE and ON UPDATE CASCADE
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

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================

-- 1. Insert Countries
INSERT INTO `countries` (`id`, `country_code`, `name`, `slug`, `currency`, `flag_code`, `tagline`, `description`, `avg_tuition`, `cost_of_living`, `post_study_work`, `intakes`, `universities_count`, `is_active`, `is_featured`, `display_order`) VALUES
(1, 'GB', 'United Kingdom', 'united-kingdom', 'GBP (£)', 'GB', 'World-renowned universities and shorter degrees.', 'Study in the UK with globally recognised universities, 1-year master programmes, and post-study work opportunities.', '£12,000 - £25,000 / year', '£9,000 - £12,000 / year', '2 Years Graduate Route (3 Years for PhD)', 'September, January', 150, 1, 1, 1),
(2, 'US', 'United States', 'united-states', 'USD ($)', 'US', 'The widest choice of universities and programmes.', 'Study in the USA with unmatched academic flexibility, world-leading research, and up to 3 years STEM OPT extension.', '$20,000 - $45,000 / year', '$12,000 - $18,000 / year', '1 Year OPT (up to 3 Years for STEM)', 'Fall (Aug/Sep), Spring (Jan)', 350, 1, 1, 2),
(3, 'CA', 'Canada', 'canada', 'CAD ($)', 'CA', 'Quality education in a welcoming, multicultural country.', 'Canada offers top-tier academic institutions, welcoming communities, co-op work-integrated learning, and post-graduation work permits.', 'CAD 15,000 - 35,000 / year', 'CAD 12,000 - 15,000 / year', 'Up to 3 Years PGWP', 'September, January, May', 100, 1, 1, 3),
(4, 'AU', 'Australia', 'australia', 'AUD ($)', 'AU', 'Top universities, great lifestyle and strong outcomes.', 'Australia is home to world-class Group of Eight universities, exceptional lifestyle, and attractive post-study work rights.', 'AUD 20,000 - 42,000 / year', 'AUD 21,000 / year', '2 to 4 Years Temporary Graduate Visa', 'February, July', 45, 1, 1, 4),
(5, 'IE', 'Ireland', 'ireland', 'EUR (€)', 'IE', 'Europe’s English-speaking tech and pharma hub.', 'Study in Ireland, Europe’s buzzing tech headquarters, offering 2-year stay back for masters graduates in an English-speaking EU country.', '€10,000 - €22,000 / year', '€10,000 - €12,000 / year', '2 Years Third Level Graduate Scheme', 'September, January', 30, 1, 1, 5),
(6, 'DE', 'Germany', 'germany', 'EUR (€)', 'DE', 'Engineering excellence with low or no tuition at many public universities.', 'Germany is the engineering power-house of Europe with zero or low tuition fees at public universities and an 18-month job seeker visa.', '€0 - €3,000 / year (Public)', '€11,208 / year (Blocked Account)', '18 Months Job Seeker Residence Permit', 'Winter (Oct), Summer (Apr)', 80, 1, 1, 6),
(7, 'NZ', 'New Zealand', 'new-zealand', 'NZD ($)', 'NZ', 'A safe, peaceful country with practical, hands-on learning.', 'New Zealand offers world-ranked universities, high student safety, and generous post-study work visas.', 'NZD 22,000 - 36,000 / year', 'NZD 20,000 / year', 'Up to 3 Years Post Study Work Visa', 'February, July', 25, 1, 0, 7),
(8, 'FR', 'France', 'france', 'EUR (€)', 'FR', 'Elite business schools at the heart of Europe.', 'Study in France with globally accredited Grandes Écoles and business schools, subsidized housing, and Schengen travel benefits.', '€4,000 - €18,000 / year', '€9,000 - €12,000 / year', '2 Years APS / Post-Study Visa', 'September, January', 40, 1, 0, 8)
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `currency` = VALUES(`currency`),
  `tagline` = VALUES(`tagline`),
  `updated_at` = CURRENT_TIMESTAMP;

-- 2. Insert Core Services
INSERT INTO `services` (`id`, `service_code`, `title`, `slug`, `headline`, `short_description`, `icon`, `is_active`, `display_order`) VALUES
(1, 'career-counselling', 'Career Counselling', 'career-counselling', 'Clarity Before You Commit', 'Understand your strengths, interests and goals, then map them to the right course, country and career path.', 'compass', 1, 1),
(2, 'university-admissions', 'University Admissions', 'university-admissions', 'The Right University, Not Just Any University', 'A balanced university shortlist and expertly managed applications for undergraduate, postgraduate and diploma programmes.', 'graduation-cap', 1, 2),
(3, 'sop-lor-guidance', 'SOP, LOR & Essays Guidance', 'sop-lor-guidance', 'Applications That Sound Like You — Only Stronger', 'Structured guidance on Statements of Purpose, recommendation letters, essays and CVs that help your application stand out.', 'file-text', 1, 3),
(4, 'test-preparation', 'Test Preparation', 'test-preparation', 'Coaching For Global & Medical Admissions', 'Structured test prep for IMAT, GMAT, IELTS and CELPIP with experienced faculty and targeted practice.', 'award', 1, 4),
(5, 'scholarships-financial-aid', 'Scholarships & Financial Aid', 'scholarships-financial-aid', 'Making Global Education Affordable', 'Identify merit-based, need-based and university scholarships, plus education loan guidance and proof-of-funds planning.', 'badge-percent', 1, 5),
(6, 'visa-assistance', 'Visa Assistance', 'visa-assistance', 'End-to-End Student Visa Filing & Mock Interviews', 'Document verification, financial documentation checks, visa filing, and one-to-one mock interview preparation.', 'shield-check', 1, 6),
(7, 'pre-departure-briefing', 'Pre-Departure Briefing', 'pre-departure-briefing', 'Step Off the Plane Prepared', 'Guidance on student accommodation, currency exchange, SIM cards, packing essentials and airport arrival protocols.', 'plane-takeoff', 1, 7),
(8, 'accommodation-support', 'Accommodation Support', 'accommodation-support', 'Safe, Student-Friendly Stays', 'Assistance with university dorms, private student residences, and verified PBSA apartments.', 'home', 1, 8)
ON DUPLICATE KEY UPDATE 
  `title` = VALUES(`title`),
  `headline` = VALUES(`headline`),
  `updated_at` = CURRENT_TIMESTAMP;

-- 3. Link Countries with Available Services (country_services)
-- All 8 countries receive full study abroad services with customized availability
INSERT INTO `country_services` (`country_id`, `service_id`, `is_available`, `notes`) VALUES
-- United Kingdom (Country 1)
(1, 1, 1, 'Profile evaluation and UK university fit mapping'),
(1, 2, 1, 'Direct admissions via UCAS or university portals'),
(1, 3, 1, 'UK-specific personal statements and academic references'),
(1, 4, 1, 'IELTS Academic, PTE Academic & CELPIP preparation'),
(1, 5, 1, 'Chevening, GREAT scholarships and university bursaries'),
(1, 6, 1, 'Student Visa (Tier 4 / Student Route) filing with CAS support'),
(1, 7, 1, 'BRP collection guidance and London/regional airport prep'),
(1, 8, 1, 'University halls and verified UK PBSA providers'),

-- United States (Country 2)
(2, 1, 1, 'US college selection & Ivy/Tier-1 fit strategy'),
(2, 2, 1, 'Common App, Coalition, and graduate department applications'),
(2, 3, 1, 'Holistic statement of purpose & supplemental essays'),
(2, 4, 1, 'GMAT, GRE, IELTS and TOEFL prep courses'),
(2, 5, 1, 'Assistantships (TA/RA), merit fellowships, and loan assistance'),
(2, 6, 1, 'F-1 Visa slot booking, DS-160 filing, and intense mock interviews'),
(2, 7, 1, 'US health insurance and port of entry customs protocol'),
(2, 8, 1, 'On-campus dorms and off-campus student apartments'),

-- Canada (Country 3)
(3, 1, 1, 'Provincial college and university pathway guidance'),
(3, 2, 1, 'Undergraduate, Master’s and PG Diploma applications'),
(3, 3, 1, 'Statement of Intent and SOP tailored for IRCC scrutiny'),
(3, 4, 1, 'IELTS and CELPIP Coaching'),
(3, 5, 1, 'Entrance awards and provincial scholarship programs'),
(3, 6, 1, 'Study Permit application (SDS / Non-SDS stream) with GIC setup'),
(3, 7, 1, 'SIN registration prep, winter preparation, and health card setup'),
(3, 8, 1, 'Homestay, student residences, and shared housing assistance'),

-- Australia (Country 4)
(4, 1, 1, 'Group of Eight (Go8) and regional universities counselling'),
(4, 2, 1, 'Fast-track application processing through official partners'),
(4, 3, 1, 'Genuine Student (GS) assessment documentation and SOP'),
(4, 4, 1, 'IELTS, PTE Academic coaching'),
(4, 5, 1, 'Vice-Chancellor and International Excellence scholarships'),
(4, 6, 1, 'Subclass 500 Student Visa with OSHC health insurance setup'),
(4, 7, 1, 'Tax File Number (TFN) and bank account pre-activation'),
(4, 8, 1, 'Purpose-built student accommodation (PBSA)'),

-- Ireland (Country 5)
(5, 1, 1, 'Tech, Biotech and Pharma industry-aligned university fit'),
(5, 2, 1, 'Direct application management for Irish National Universities'),
(5, 3, 1, 'Motivational letters and recommendation reviews'),
(5, 4, 1, 'IELTS / TOEFL coaching'),
(5, 5, 1, 'Government of Ireland International Education Scholarships'),
(5, 6, 1, 'Irish Student Visa (Stamp 2) application support'),
(5, 7, 1, 'IRP registration assistance and PPS number guidance'),
(5, 8, 1, 'Dublin and Cork campus accommodation & private leases'),

-- Germany (Country 6)
(6, 1, 1, 'Public vs. Private university mapping for tuition-free studies'),
(6, 2, 1, 'Uni-Assist document evaluation and direct university applications'),
(6, 3, 1, 'Motivational essays, APS certificate readiness'),
(6, 4, 1, 'German language prep (A1-B2) and English proficiency tests'),
(6, 5, 1, 'DAAD scholarships and low-tuition guidance'),
(6, 6, 1, 'National German Student Visa (Type D) with Blocked Account setup'),
(6, 7, 1, 'Anmeldung (city registration) and statutory health insurance setup'),
(6, 8, 1, 'Studentenwerk dormitory applications and shared WG flats'),

-- New Zealand (Country 7)
(7, 1, 1, 'Hands-on practical and research university roadmap'),
(7, 2, 1, 'Applications for all 8 New Zealand universities'),
(7, 3, 1, 'Academic CV and Statement of Purpose structuring'),
(7, 4, 1, 'IELTS / PTE Academic training'),
(7, 5, 1, 'Manaaki New Zealand scholarships'),
(7, 6, 1, 'Fee Paying Student Visa filing and medical requirements'),
(7, 7, 1, 'IRD number registration and pre-departure checklist'),
(7, 8, 1, 'Catered and self-catered residential halls'),

-- France (Country 8)
(8, 1, 1, 'Grandes Écoles, business schools and engineering schools fit'),
(8, 2, 1, 'Etudes en France (Campus France) application workflow'),
(8, 3, 1, 'CV Europass format and cover letters'),
(8, 4, 1, 'IELTS / IMAT / TCF preparation'),
(8, 5, 1, 'Eiffel Excellence Scholarship and CROUS student benefits'),
(8, 6, 1, 'Long-stay Student Visa (VLS-TS) and Campus France interview prep'),
(8, 7, 1, 'CAF housing subsidy application prep and OFII validation'),
(8, 8, 1, 'CROUS student residences and verified private rentals')
ON DUPLICATE KEY UPDATE 
  `is_available` = VALUES(`is_available`),
  `notes` = VALUES(`notes`),
  `updated_at` = CURRENT_TIMESTAMP;

-- 4. Insert Sample Universities
INSERT INTO `universities` (`country_id`, `name`, `slug`, `city`, `ranking`, `website_url`, `is_active`) VALUES
(1, 'University of Oxford', 'university-of-oxford', 'Oxford', 1, 'https://www.ox.ac.uk', 1),
(1, 'University of Cambridge', 'university-of-cambridge', 'Cambridge', 2, 'https://www.cam.ac.uk', 1),
(1, 'Imperial College London', 'imperial-college-london', 'London', 6, 'https://www.imperial.ac.uk', 1),
(2, 'Harvard University', 'harvard-university', 'Cambridge, MA', 4, 'https://www.harvard.edu', 1),
(2, 'Stanford University', 'stanford-university', 'Stanford, CA', 5, 'https://www.stanford.edu', 1),
(3, 'University of Toronto', 'university-of-toronto', 'Toronto, ON', 21, 'https://www.utoronto.ca', 1),
(3, 'University of British Columbia', 'university-of-british-columbia', 'Vancouver, BC', 34, 'https://www.ubc.ca', 1),
(4, 'University of Melbourne', 'university-of-melbourne', 'Melbourne, VIC', 14, 'https://www.unimelb.edu.au', 1),
(4, 'University of Sydney', 'university-of-sydney', 'Sydney, NSW', 19, 'https://www.sydney.edu.au', 1),
(5, 'Trinity College Dublin', 'trinity-college-dublin', 'Dublin', 81, 'https://www.tcd.ie', 1),
(6, 'Technical University of Munich', 'tum-germany', 'Munich', 37, 'https://www.tum.de', 1)
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `updated_at` = CURRENT_TIMESTAMP;

-- 5. Insert Country Highlights
INSERT INTO `country_highlights` (`country_id`, `highlight_text`, `display_order`) VALUES
(1, 'Many master’s degrees completed in just 1 year', 1),
(1, '2-Year Post-study graduate work visa', 2),
(1, 'Globally recognised, historic Russell Group institutions', 3),
(2, 'Widest range of academic majors and STEM research opportunities', 1),
(2, 'Up to 36 months OPT work authorization for STEM graduates', 2),
(2, 'World-class campus facilities and extensive global alumni network', 3),
(3, 'Up to 3-Year Post-Graduation Work Permit (PGWP)', 1),
(3, 'Co-op programs with integrated paid industry internships', 2),
(3, 'Safe, multicultural and immigrant-welcoming society', 3),
(4, 'Top-ranked Group of Eight (Go8) universities', 1),
(4, 'Generous post-study work rights (up to 4 years)', 2),
(4, 'High minimum wage and excellent standard of living', 3),
(5, 'European headquarters for Google, Meta, Apple & Pfizer', 1),
(5, '2-Year stay-back work permit for Master’s graduates', 2),
(5, 'The only English-speaking tech hub in the European Union', 3),
(6, 'Low or zero tuition fees at world-renowned public universities', 1),
(6, '18-Month post-study job seeker visa', 2),
(6, 'Global leader in automotive, mechanical and green engineering', 3),
(7, 'Consistently ranked among the top 10 safest countries globally', 1),
(7, 'Post-study work rights up to 3 years for eligible graduates', 2),
(7, 'Hands-on, research-backed practical education model', 3),
(8, 'Elite Grandes Écoles and top European business schools', 1),
(8, 'Government housing subsidy (CAF) available for international students', 2),
(8, '2-Year post-study work visa (APS) and Schengen mobility', 3);
