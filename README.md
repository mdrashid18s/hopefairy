# HopeFairy — Enterprise Study Abroad & Higher Education Admissions Platform

<div align="center">
  <img src="frontend/public/brand/hopefairy-logo-full.png" alt="HopeFairy Emblem" width="380" />
  <p><strong>Premier Global Education Advisory, Overseas Study Destinations, Indian Admissions & Standardized Test Prep</strong></p>
  <p>
    <a href="https://github.com/mdrashid18s/hopefairy"><img src="https://img.shields.io/badge/Next.js-16%20App%20Router-black?style=flat-square&logo=next.js" alt="Next.js 16" /></a>
    <a href="https://github.com/mdrashid18s/hopefairy"><img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React 19" /></a>
    <a href="https://github.com/mdrashid18s/hopefairy"><img src="https://img.shields.io/badge/Laravel-12%20REST%20API-red?style=flat-square&logo=laravel" alt="Laravel 12" /></a>
    <a href="https://github.com/mdrashid18s/hopefairy"><img src="https://img.shields.io/badge/PHP-8.4-777bb4?style=flat-square&logo=php" alt="PHP 8.4" /></a>
    <a href="https://github.com/mdrashid18s/hopefairy"><img src="https://img.shields.io/badge/MySQL-3NF%20Relational-00758f?style=flat-square&logo=mysql" alt="MySQL 3NF" /></a>
    <a href="https://github.com/mdrashid18s/hopefairy"><img src="https://img.shields.io/badge/Auth-Laravel%20Sanctum-green?style=flat-square" alt="Sanctum" /></a>
  </p>
</div>

---

## 🏛️ Executive Architecture

HopeFairy is engineered using an executive **3-container decoupled enterprise structure** ensuring complete separation of concerns, high throughput, and independent scalability:

```
hopefairy/
├── apis/                      # PHP / Laravel 12 RESTful API Engine (Port 8000)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # Thin controllers handling validation & JSON envelopes
│   │   │   └── Requests/      # Strictly typed request validation classes
│   │   ├── Models/            # Eloquent ORM Models with 3NF relationships & accessors
│   │   ├── Services/          # Dedicated OOP Domain Services (Zero business logic in UI)
│   │   └── Mail/              # Unified Dynamic Email System & OTP verification
│   ├── database/
│   │   ├── migrations/        # Normalized 3NF migrations & composite performance indexes
│   │   └── seeders/           # Master seed data (Countries, Courses, Users)
│   └── routes/api.php         # Versioned RESTful API endpoints (/api/v1/*)
│
├── backend/                   # Admin Portal (Executive Luxury Dashboard Suite)
│   ├── src/
│   │   ├── app/(admin)/       # Routes: /admin (Overview), /admin/login, /admin/inquiries,
│   │   │                      # /admin/destinations, /admin/courses, /admin/services, /admin/users
│   │   ├── components/        # Dual-theme design tokens, Miller column drilldown, SVG flags
│   │   └── services/          # Decoupled API clients connecting to apis/
│   └── package.json           # hopefairy-admin
│
└── frontend/                  # Public Website (Next.js 16 App Router & React 19)
    ├── src/
    │   ├── app/               # Routes: /, /about-us, /services, /destinations, /gulf-desk,
    │   │                      # /india-admissions, /test-prep, /contact-us, /sitemap
    │   ├── components/        # HopeFairy Compass, 3D tilt cards, destinations ticker
    │   └── services/          # Client-side domain services delegating API calls
    └── package.json           # hopefairy-frontend
```

---

## ✨ Key Features & Technical Highlights

### 1. Public Flagship Experience (`frontend/`)
- **HopeFairy Compass**: Flagship 4-pillar career assessment and counselling engine with instant consultation trigger.
- **Study Abroad Destinations**: Comprehensive coverage across UK, USA, Canada, Germany, Australia, Ireland, and Singapore with live degree level and tuition filters.
- **Indian College Admissions Desk**: Dedicated advisory portal for B.Tech, MBBS, MBA, and Law admissions with entrance exam guides (NEET, JEE, CAT, CLAT).
- **Interactive 3D UI & Micro-interactions**: Magnetic buttons, 3D tilt perspective cards, animated destination ticker marquee, and particle sparkles.
- **Enterprise SEO Optimization**: Fully dynamic XML sitemap generator (`sitemap.js`), `robots.js`, structured JSON-LD schemas, and rich OpenGraph social share previews.

### 2. Executive Luxury Admin Suite (`backend/`)
- **Dual-Theme Token Engine**:
  - *Light Mode*: Pristine White & Golden canvas (`#ffffff` surfaces, `#0f172a` typography, `#d8b056` gold accents).
  - *Dark Mode*: Deep Obsidian & Golden canvas (`#080809` background, `#100f0e` surface cards, `#faf7f0` typography).
  - *Zero Table Flickering*: Rows never jump or shift color on hover.
- **Curriculum Miller Drilldown**: 3-step Miller column explorer for navigating deep curriculum hierarchies (Subjects $\rightarrow$ Topics $\rightarrow$ Subtopics).
- **CRM Leads & Inquiries Manager**: Live consultation tracking, follow-ups, and status updates with optimistic UI mutation.
- **Sanctum Authentication & OTP System**: Token-based security with Gmail SMTP email delivery for OTP password recovery.

### 3. Backend RESTful API & 3NF Database (`apis/` & `database/`)
- **Strict 3NF Relational Normalization**:
  - Zero static JSON arrays for repeating child entities.
  - Relational foreign keys with `ON DELETE CASCADE` (`country_courses`, `courses`, `subjects`, `topics`, `subtopics`, `resources`).
  - Elimination of transitive foreign keys (pure hierarchical 3NF architecture).
- **Unified Dynamic HTML Email System**: A single responsive Master HTML email template accepting dynamic parameters (`status`, theme colors, key-value summaries, and CTAs).
- **Consistent Response Contract**: All endpoints return a standardized JSON envelope (`success`, `statusCode`, `message`, `data`, `errors`).

---

## 🛠️ Tech Stack & Prerequisites

| Layer | Technologies |
|---|---|
| **Frontend Portal** | Next.js 16 (App Router), React 19, Tailwind CSS, Framer Motion |
| **Admin Portal** | Next.js 16, React 19, Custom Luxury Design Tokens, SVG Icons |
| **Backend REST API** | Laravel 12, PHP 8.3 / 8.4, Laravel Sanctum, Spatie Permission |
| **Database** | MySQL 8.0+ / MariaDB 10.3+ (Strict 3NF, utf8mb4) |
| **Email Delivery** | Gmail SMTP / PHPMailer with Dynamic Blade Layouts |

---

## 🚀 Quick Start & Development Setup

### 1. Database Setup
```bash
# In MySQL console or phpMyAdmin:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS hopefairy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p hopefairy < database/hopefairy_master_schema_and_seed.sql
```

### 2. Backend API Setup (`apis/`)
```bash
cd apis
cp .env.example .env
# Configure DB_DATABASE=hopefairy, DB_USERNAME, DB_PASSWORD in .env
php artisan key:generate
php artisan migrate
php artisan serve --port=8000
```

### 3. Admin Portal (`backend/`)
```bash
cd backend
cp .env.example .env.local
npm install
npm run dev -- --port 3002
# Accessible at: http://localhost:3002/admin/login
```

### 4. Public Website (`frontend/`)
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
# Accessible at: http://localhost:3000
```

---

## 🔒 Security & Sensitive Data Policy

- All production credentials, SMTP passwords, database passwords, and API keys are strictly excluded via `.gitignore`.
- Template `.env.example` files are provided across all containers with sanitized placeholders.

---

## 👨‍💻 Maintainer & Author

- **Lead Engineer**: **MD Rashid** ([@mdrashid18s](https://github.com/mdrashid18s))
- **Repository**: [https://github.com/mdrashid18s/hopefairy](https://github.com/mdrashid18s/hopefairy)
- **Active Branch**: `md-rashid`
