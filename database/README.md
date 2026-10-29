# HopeFairy — Clean Production Architecture (Next.js + Laravel MVC)

This document details the production-aligned decoupled architecture for **HopeFairy**, strictly keeping in the database **only what is currently rendered on the UI and submitted via input forms**.

---

## 1. Clean MVC & Services Architecture

```
hope/
├── frontend/                     # Next.js 16 (App Router), React 19, Tailwind CSS 4
│   ├── src/
│   │   ├── app/                  # All Pages & Routes (100% Identical UI & Copy)
│   │   ├── components/           # 3D Cards, Flags, Icons, Sections
│   │   ├── services/api.js       # Clean REST Client connecting to Laravel
│   │   └── data/site.js          # Fallback constants & shape blueprints
│   ├── .env.local                # NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
│   └── package.json
│
└── backend/                      # Laravel 12 RESTful API (Clean MVC + Services)
    ├── app/
    │   ├── Http/Controllers/    # Thin Controllers (HTTP orchestration)
    │   │   ├── DestinationController.php
    │   │   ├── OfferingController.php
    │   │   ├── IndiaAdmissionsController.php
    │   │   ├── TestPrepController.php
    │   │   ├── InquiryController.php
    │   │   └── SiteController.php
    │   ├── Http/Requests/       # Form Request Validation (422 JSON envelopes)
    │   │   └── StoreInquiryRequest.php
    │   ├── Models/              # Eloquent Models (with JSON array casting)
    │   │   ├── Destination.php
    │   │   ├── Service.php
    │   │   ├── IndiaAdmission.php
    │   │   ├── TestPrep.php
    │   │   ├── Inquiry.php
    │   │   ├── Faq.php
    │   │   └── SiteSetting.php
    │   ├── Services/            # Reusable Business Logic Layer
    │   │   ├── DestinationService.php
    │   │   ├── OfferingService.php
    │   │   ├── IndiaAdmissionsService.php
    │   │   ├── TestPrepService.php
    │   │   ├── InquiryService.php
    │   │   └── SiteContentService.php
    │   ├── Traits/              # Standardized API Response Contract
    │   │   └── ApiResponseTrait.php
    │   └── Mail/                # Unified Dynamic Email System
    │       └── DynamicNotificationMail.php
    ├── resources/views/emails/  # master.blade.php (Luxury responsive email)
    ├── routes/api.php           # 11 RESTful endpoints
    └── config/cors.php          # Configured for Next.js
```

---

## 2. Active Database Schema (7 UI-Aligned Tables in `hopefairy`)

| Table Name | UI Route / Feature | Stored Fields (Exactly what's on UI) |
|---|---|---|
| **`destinations`** | `/destinations`, `/`, Country Cards | `id`, `slug`, `name`, `code`, `flag`, `tagline`, `intakes` (JSON), `courses` (JSON), `highlights` (JSON), `is_active`, `display_order` |
| **`services`** | `/services`, `/service/[slug]` | `id`, `slug`, `title`, `headline`, `short`, `icon`, `intro` (JSON), `features_title`, `features` (JSON), `highlights` (JSON), `process_flow` (JSON), `is_active`, `display_order` |
| **`india_admissions`** | `/india-admissions` | `id`, `slug`, `name`, `icon`, `text`, `ug_programs` (JSON), `ug_exams` (JSON), `pg_programs` (JSON), `pg_exams` (JSON), `is_active`, `display_order` |
| **`test_preps`** | `/test-prep` | `id`, `code`, `name`, `slug`, `icon`, `flag`, `tagline`, `text`, `subjects` (JSON), `features` (JSON), `cta`, `is_featured`, `is_active`, `display_order` |
| **`inquiries`** | `/contact-us`, Lead forms | `id`, `name`, `phone`, `email`, `city`, `interest`, `qualification`, `study_level`, `destination_id` (FK -> `destinations.id`), `destination_name`, `intake`, `course`, `message`, `lead_status` |
| **`faqs`** | FAQ Accordions across pages | `id`, `q`, `a`, `display_order`, `is_active` |
| **`site_settings`** | Header, Footer, Brand, Contact info | `id`, `setting_key`, `setting_value`, `group_name` |

---

## 3. Foreign Key & Integrity

- **`inquiries.destination_id` -> `destinations.id`** (`CONSTRAINT fk_inquiries_destination`):
  When a student submits the contact form selecting a destination, it links directly to the corresponding row in `destinations`.

---

## 4. API Endpoints (`routes/api.php`)

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/destinations` | List of 8 countries with intakes, highlights, and courses |
| `GET` | `/api/destinations/{slug}` | Single country details |
| `GET` | `/api/services` | List of 8 study abroad services |
| `GET` | `/api/services/{slug}` | Single service with features, highlights, and process roadmap |
| `GET` | `/api/india-admissions` | 5 academic streams with UG/PG programs and exams |
| `GET` | `/api/test-prep` | Featured IMAT coaching + GMAT, IELTS, CELPIP |
| `GET` | `/api/test-prep/{slug}` | Single test prep details |
| `POST`| `/api/contact` | Submits inquiry to database + triggers dynamic confirmation email |
| `GET` | `/api/site` | Dynamic site metadata, phone, email, and social links |
| `GET` | `/api/faqs` | FAQs shown across the application |
