<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# HopeFairy — Enterprise Project Blueprint & Senior Developer Guidelines

> **Project Priority**: High / Client Milestone (First Salary Project). All architecture, database modeling, and code implementation must adhere to strict senior developer standards: modular, reusable, strictly typed/validated, and scalable.

---

## 1. Project Directory Structure

The project is organized into an executive 3-container decoupled structure:
```
hopefairy/
├── apis/                      # PHP / Laravel 12 RESTful API (Port 8000)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # Thin controllers handling requests/responses
│   │   │   └── Requests/      # Request validation classes
│   │   ├── Models/            # Eloquent / Database ORM Models
│   │   ├── Services/          # Core business logic & reusable services
│   │   └── Mail/              # Dynamic Email System & OTP templates
│   ├── database/
│   │   ├── migrations/        # Database schema migrations & Performance Indexes
│   │   └── seeders/           # Default seed data (countries, services)
│   ├── routes/
│   │   └── api.php            # RESTful API endpoints (/api/*)
│   └── config/
│
├── backend/                   # Admin Portal (Executive Luxury Dashboard Suite)
│   ├── src/
│   │   ├── app/               # Admin routes: /admin (Overview), /admin/login, /admin/inquiries (CRM), /admin/destinations, /admin/services, /admin/settings, /admin/users
│   │   ├── services/          # Admin API client & domain services connecting to apis/
│   │   └── components/        # Dual-theme tokens, modal dialogs, and SVG badges
│   ├── public/                # Admin branding & logo assets
│   └── package.json           # hopefairy-admin
│
└── frontend/                  # Public Website (Next.js 16 App Router, React 19)
    ├── src/
    │   ├── app/               # Public routes: /, /about-us, /services, /destinations, /gulf-desk, /india-admissions, /test-prep, /contact-us
    │   ├── components/        # Public UI, animations, Hero, Tickers, HopeFairy Compass
    │   ├── services/          # Client API calls to apis/
    │   └── data/              # Static fallback constants & site config
    ├── public/                # Static assets, branding & images
    └── package.json
```

---

## 2. Senior Developer Coding Principles (Mandatory)

1. **Strict DRY Principle (Don't Repeat Yourself)**:
   - Zero duplicated logic. If any logic, calculation, or query is used in more than one place, extract it into a dedicated reusable function, service, or helper class.
2. **Clean OOP & Architecture**:
   - Follow Single Responsibility Principle (SRP).
   - Use clean Classes, Objects, and Dependency Injection.
   - Thin Controllers, Fat Services/Models: Controllers only validate and orchestrate; business logic stays in Services.
3. **Unified Dynamic Email System**:
   - DO NOT create separate static email templates for success, failed, pending, etc.
   - Build a single, responsive Master HTML Email Template with dynamic parameters:
     - `status`: `'success'` | `'failed'` | `'pending'` | `'info'`
     - Dynamic theme colors (e.g., Green for Success, Red for Failed, Amber for Pending, Blue for Info)
     - Dynamic status badge icon and label
     - Dynamic title, message body, key-value data summary table, and CTA button
4. **Standardized API Response Contract**:
   Every API endpoint must return a consistent structured JSON envelope:
   ```json
   {
     "success": true,
     "statusCode": 200,
     "message": "Operation completed successfully.",
     "data": {},
     "errors": null
   }
   ```
5. **Time Management & Practical Delivery**:
   - Focus on rock-solid fundamentals and clean code without getting bogged down in trivial micro-details.
   - Code must be robust, reliable, and production-ready.
6. **Streamlined Admin UX & Zero Redundant Technical Inputs (Code Cleaning Principle)**:
   - Admins must NEVER be burdened with entering technical, internal, or redundant parameters (such as ISO 2-letter country codes, URL slugs, or emoji flags).
   - Technical values (`slug`, `country_code`, `flag`) must be automatically resolved and derived from human-friendly inputs (`name`) on both the frontend and backend.
   - Forms must remain minimal, clean, intuitive, and styled strictly to HopeFairy's Golden theme standards (no orange/amber inputs or buttons).
7. **Strict Scope Adherence & Zero Unsolicited Modifications (Execute Exactly What Is Requested — Zero Extra Work / Zero Scope Creep)**:
   - The developer/agent must strictly execute ONLY the explicit tasks requested by the user.
   - Do NOT add extra features, do NOT introduce unsolicited components, do NOT modify routes or layout chrome outside the requested scope.
   - When integrating new frontend files from external sources, strictly isolate them to their intended domain.
   - The Admin Portal (`/admin/*`) must remain 100% clean and isolated: public website navigation, public headers, public footers, floating widgets (WhatsApp buttons, back-to-top, cursor animations, preloaders) must NEVER bleed into or wrap the Admin Portal.
8. **Section-Wise Dedicated OOP Service Class Architecture (Mandatory)**:
   - Every single website section, business offering, or functional module (e.g., Destinations, Test Prep, Services, India Admissions, Psychometric / HopeFairy Compass, Testimonials, Inquiries, Site Content) MUST have its own dedicated Class that encapsulates ALL related functions, data operations, API calls, link generators, and submission methods.
   - UI components (Next.js components) must NEVER contain loose, scattered, or hardcoded business logic or raw fetch calls. Components must strictly delegate to their corresponding dedicated Service Class instance (e.g., `psychometricService.getSectionData()`, `testPrepService.getAll()`, `offeringService.getBySlug()`).
   - On the backend, every domain must similarly have a dedicated Service Class in `app/Services/` (e.g., `PsychometricService`, `TestPrepService`, `IndiaAdmissionsService`, `DestinationService`) injected into thin controllers.
9. **Mandatory Production Build Verification & Distributable Zip Archives (Strict Delivery Standard)**:
   - Whenever any feature, section copy, design update, or database migration is completed, both the backend optimization caches and the frontend production build MUST be executed, validated, and updated.
   - Frontend: `npm run build` must compile clean with 0 errors across all routes.
   - Backend: `php artisan optimize:clear` and `php artisan optimize` must compile clean without route or config errors.
   - Distributable Packages: Updated deployable zip archives (`frontend.zip`, `backend.zip`, `apis.zip` / `api.zip`, and `database.sql`) must ALWAYS be re-generated and stored in `c:\xampp\htdocs\hope\dist_zips` for instant, production-ready client deployment.
10. **Strict 3NF Relational Normalization Principle (Zero Static JSON Arrays for Repeating Entities — Mandatory Senior Standard)**:
   - Whenever ANY entity, item, or attribute can repeat (e.g. courses offered by a country, programs/exams in an admissions stream, subjects/topics/subtopics in a curriculum, study materials/PDFs for a subject), it MUST ALWAYS be modeled in a dedicated relational child table with Primary Key $\leftrightarrow$ Foreign Key relations (`ON DELETE CASCADE` or `ON DELETE SET NULL`) and indexed columns.
   - NEVER store repeating data as static JSON arrays, stringified blobs, or comma-separated values inside parent tables when child relational tables exist.
   - Database queries must use Eloquent relationships (`belongsTo`, `hasMany`) and eager-load relations (`with(...)`).
   - Eloquent models must expose dynamic backward-compatible accessors (e.g. `$country->courses`, `$stream->ug_programs`) that dynamically derive data from the normalized child relation so existing UI consumers continue functioning seamlessly without duplicate data storage.
11. **Single Authoritative Source of Truth & Dead Code/Schema Purge Standard**:
   - Never keep duplicate, parallel, or mirrored tables (e.g. `destinations` alongside `countries`, `course_metadata` alongside `metadata`, or `donations` from abandoned legacy features). Consolidate into a single authoritative master table.
   - Any column, table, service, controller, model, or route that was used previously but is no longer used and will not be used in the future MUST be completely deleted from both the database (via clean migrations) and the codebase. Zero dead, zombie, or orphaned code is permitted.
12. **Strict Elimination of Transitive & Redundant Foreign Keys (Pure Hierarchical 3NF Standard)**:
   - When entities form a strict chain or hierarchy (e.g. `courses` -> `subjects` -> `topics` -> `subtopics`), child tables must ONLY store the immediate parent's Primary Key:
     - `subjects` stores ONLY `course_id` (FK -> `courses.id`).
     - `topics` stores ONLY `subject_id` (FK -> `subjects.id`). NEVER store `course_id` on `topics`.
     - `subtopics` stores ONLY `topic_id` (FK -> `topics.id`). NEVER store `subject_id` or `course_id` on `subtopics`.
   - Any ancestral data must be derived relationally (via `hasOneThrough` or `$subtopic->topic->subject->course`) and exposed via dynamic accessors (`$subtopic->subject_id`, `$subtopic->course_id`, `$topic->course_id`) so all API contracts and frontend views remain intact without storing redundant columns.

---

## 3. Database Architecture (phpMyAdmin / MySQL)

### Standards:
- Relational 3NF integrity with strictly indexed `FOREIGN KEY` constraints (`ON DELETE CASCADE` or `ON DELETE SET NULL`).
- Zero duplicate or unnormalized repeating JSON columns: all repeating items must live in their dedicated child table.
- Zero redundant/transitive foreign keys: chain tables only store their immediate parent's foreign key (`topics` only has `subject_id`, `subtopics` only has `topic_id`).
- Explicit data types (`VARCHAR`, `INT UNSIGNED`, `TEXT`, `BOOLEAN`, `TIMESTAMP`, `DECIMAL`).
- Automatic audit columns (`created_at`, `updated_at`).

### Core Master Tables & Relational Schema:
1. **`countries`**: Master study abroad destinations (UK, USA, Canada, Germany, Australia, etc.).
   - Child Table: **`country_courses`** (`country_id` FK $\rightarrow$ `countries(id)` `ON DELETE CASCADE`) — stores all degree levels, tuition fees, and course offerings per country.
2. **`india_admissions`**: Master streams/categories for Indian college admissions (Engineering, Medicine, Management, Law, etc.).
   - Child Table: **`courses`** (`stream_id` FK $\rightarrow$ `india_admissions(id)` `ON DELETE CASCADE`) — stores all UG/PG courses, entrance exams, duration, eligibility, and descriptions.
3. **`subjects`**: 3NF normalized subjects (`course_id` FK $\rightarrow$ `courses(id)` `ON DELETE CASCADE`).
4. **`topics`**: 3NF normalized topics (`subject_id` FK $\rightarrow$ `subjects(id)` `ON DELETE CASCADE`). (Strict 3NF: No redundant `course_id`; derived through subject).
5. **`subtopics`**: 3NF normalized subtopics (`topic_id` FK $\rightarrow$ `topics(id)` `ON DELETE CASCADE`). (Strict 3NF: No redundant `subject_id` or `course_id`; derived through topic).
6. **`metadata`**: Academic curriculum metadata linking `course_id`, `subject_id`, `topic_id`, `subtopic_id` via Foreign Keys. (PDF files removed; PDFs belong strictly to `resources`).
7. **`resources`**: Study materials & digital resources table with pricing, discounts, thumbnails, and PDF files. Linked via Foreign Keys to `metadata_id`, `course_id`, `subject_id`, `topic_id`, `subtopic_id`.
8. **`testimonials`**: Student & parent reviews (`country_id` FK $\rightarrow$ `countries(id)` `ON DELETE SET NULL`).
9. **`inquiries`**: Lead capture & consultation requests (`destination_id` FK $\rightarrow$ `countries(id)` `ON DELETE SET NULL`).
10. **`services`**: Core advisory offerings.
11. **`test_preps`**: Standardized test preparation programs (IMAT, GMAT, IELTS, CELPIP).
12. **`site_settings`** & **`faqs`**: Global system parameters and FAQs.
13. **`users`**: Super administrators and team members with Sanctum authentication.

---

## 4. Execution Policy & Phase Plan

> ⚠️ **IMPORTANT**: Do NOT execute database creation, structural migrations, or code changes until the user explicitly gives the command to proceed with that phase.

- **Phase 1 (Completed)**: Requirement specifications recorded & locked in `AGENTS.md`.
- **Phase 2 (Completed)**: Decoupled container restructure complete (`frontend/` for Next.js 16 / React 19 and `backend/` for Laravel 12 API).
- **Phase 3 (Completed)**: Streamlined database schema in phpMyAdmin database `hopefairy` strictly to the 7 UI-aligned tables matching the exact frontend components and input forms (`destinations`, `services`, `india_admissions`, `test_preps`, `inquiries`, `faqs`, `site_settings` with Foreign Key constraints).
- **Phase 4 (Completed)**: Built clean MVC + Services architecture in Laravel 12 (`DestinationService`, `OfferingService`, `IndiaAdmissionsService`, `TestPrepService`, `InquiryService`, `SiteContentService`, corresponding Controllers, `StoreInquiryRequest`, `ApiResponseTrait`, and Unified Dynamic Email System). Full integration tested with Next.js frontend with zero changes to existing UI design and copy.
- **Phase 5 (Completed)**: Built complete Admin Portal Suite with Laravel Sanctum token-based authentication, Gmail SMTP integration (`mrrashidsaikh0365@gmail.com`), OTP password reset email system via Dynamic Master HTML template, and full CRUD administration for Destinations (Add/Update/Delete/Toggle), Leads/Inquiries CRM, Services, and Site Settings. Verified 0 disruption to existing public UI.
- **Phase 6 (Completed)**: HopeFairy Compass Section updated as the unified flagship career assessment & counselling program (replacing redundant cards with clean heading, intro, and consultation CTA). Full database search/filter indexing executed across all tables. Automated backend optimization, frontend production builds, and distributable release zips in `dist_zips/` established.

---

## 5. Mandatory Mobile & iPad Responsive Layout Standards

> 📱 **Critical Rule**: All public and admin interfaces must be tested and optimized for all mobile (360px–480px), iPad/tablet (768px–1024px), and desktop viewports. Layouts must never break, columns must never be squeezed into unreadable slivers, and elements must be symmetrically centered.

1. **Table Viewport Integrity & Scroll Containers**:
   - Every data table MUST be enclosed inside an `overflow-x-auto` wrapper with an explicit minimum width (`min-w-[760px]`, `min-w-[820px]`, or `min-w-[880px]`).
   - Tables must NEVER squeeze their text or break badges into vertical strips on iPad or mobile screens.
   - Horizontal scrolling must be effortless and silky-smooth.

2. **Column Alignment & Centering**:
   - Numeric indicators (e.g. `#1`, `#2`), Program Course counts, Active/Inactive status badges, Dates, and Action button clusters (Edit/Delete/View) MUST be centered in both `<th>` and `<td>` (`text-center` with `flex items-center justify-center`).
   - Entity names and descriptive text remain left-aligned for natural reading hierarchy.

3. **Responsive Controls & Search Bars**:
   - Form controls, search inputs, and filters must use fluid mobile widths (`w-full sm:w-auto`, `flex-1 sm:flex-none`) to prevent cutoff or awkward wrapping on small devices.
   - Action modals must use adaptive padding (`p-4 sm:p-6 md:p-8`) and max-height scrolling (`max-h-[90vh] overflow-y-auto`) so forms remain accessible on mobile keyboards and small screens.

4. **Cross-Platform Visual Assets**:
   - Never rely on native operating-system flag emojis (which render as plain indicator letters `GB`, `US` on Windows).
   - Always use high-definition SVG flag assets (via `country-flag-icons` and `CountryFlagBadge`) with clean inline ISO code badges.

5. **Zero Horizontal Viewport Overflow on Mobile Devices**:
   - `html` and `body` MUST strictly enforce `overflow-x: hidden; max-width: 100%; width: 100%;`.
   - The Next.js root viewport definition MUST explicitly define `width: 'device-width', initialScale: 1, maximumScale: 5`.
   - `<main>`, `<AppShell>`, `Section.jsx`, and all ticker/marquee containers MUST enforce horizontal containment (`overflow-hidden` / `overflow-x-hidden`) so decorative ambient elements, blurs, and animated banners never bleed out horizontally and expose an unstyled white gutter on mobile screens.

---

## 6. Mandatory Brand Identity & Admin Dual-Theme Standards

> 👑 **Client Directive & Visual Standard**: The HopeFairy Admin Portal incorporates an executive **Dual-Theme System**:
> - **Light Mode**: Pristine **White & Golden** canvas (`#ffffff` surfaces, dark slate `#0f172a` typography, signature `#d8b056` gold accents, subtle `#f1f5f9` dividers).
> - **Dark Mode**: Deep **Black & Golden** canvas (`#080809` obsidian canvas, `#100f0e` surface cards, crisp ivory `#faf7f0` typography, `#d8b056` luxury gold accents).
> - **Zero Hover Flickering**: Table rows in BOTH modes must NEVER change background color on hover. Rows remain solidly stable with zero color jumping.
> - **Persistent Mode Switcher**: Users can toggle between Light Mode and Dark Mode at any time via the header toggle, with choice preserved in `localStorage`.

### Master CSS Design Tokens (Single Source of Truth)
Defined in `frontend/src/app/admin/admin-theme.css`:
```css
/* LIGHT MODE (White & Golden) */
.admin-root, .admin-root.admin-light {
  --admin-bg: #ffffff;
  --admin-surface: #ffffff;
  --admin-surface-hover: #ffffff;
  --admin-border: #e2e8f0;
  --admin-gold-400: #d8b056;
  --admin-text-primary: #0f172a;
  --admin-table-bg: #ffffff;
  --admin-table-row-bg: #ffffff;
  --admin-table-row-hover: #ffffff;
}

/* DARK MODE (Black & Golden) */
.admin-root.admin-dark {
  --admin-bg: #080809;
  --admin-surface: #100f0e;
  --admin-surface-hover: #100f0e;
  --admin-border: #24221e;
  --admin-gold-400: #d8b056;
  --admin-text-primary: #faf7f0;
  --admin-table-bg: #100f0e;
  --admin-table-row-bg: #100f0e;
  --admin-table-row-hover: #100f0e;
}
```

### Inviolable UI Principles:
1. **Zero Background Hover Effect on Tables**:
   - In Light Mode, every row is permanently `#ffffff` (hover stays `#ffffff`).
   - In Dark Mode, every row is permanently `#100f0e` (hover stays `#100f0e`).
   - No zebra striping, no dark-to-grey jumping, no border-left shifts on hover.
2. **Buttons & Actions**:
   - Primary action buttons use the signature luxury gradient: `linear-gradient(135deg, var(--admin-gold-300), var(--admin-gold-400) 50%, var(--admin-gold-500))`.
3. **Form Controls**:
   - Inputs, selects, and textareas dynamically match the active theme with signature gold focus glow `rgba(216, 176, 86, 0.25)`.
4. **Soft Hairline Borders & Ambient Shadows**:
   - In Light Mode, avoid harsh/dark outlines (e.g. solid `border-slate-200` `#e2e8f0`). Always use ultra-soft hairlines (`rgba(226, 232, 240, 0.65)` / `border-slate-100`) paired with elegant ambient drop shadows (`box-shadow: 0 10px 30px -4px rgba(15, 23, 42, 0.07), 0 4px 12px -2px rgba(15, 23, 42, 0.03)`). This creates visual grouping via subtle elevation rather than harsh lines.
5. **Zero Orange / Amber in Admin Interfaces**:
   - All interactive elements, active tab states, focus rings, switches, and badges must strictly use the signature luxury gold (`#d8b056`, `#c89b3c`, `#e4c775`).
   - Tailwind's default traffic orange/amber colors (`amber-400`, `amber-500`) are strictly prohibited in the admin portal.

---

## 7. Row-Level Mutation & Zero Full-Page Flickering Standard (Mandatory)

> ⚡ **Performance & UX Mandate**: Actions on a single row (such as toggling Active/Inactive status) must NEVER unmount the table, trigger full-page skeleton loaders, or cause UI flickering.

1. **Optimistic Local State Update**:
   - When a toggle button is clicked, immediately flip the boolean in component state (`setItems(prev => prev.map(...))`).
2. **Row-Level Loading Indicator**:
   - Track active mutations using row IDs (`togglingId === item.id`).
   - Display a sleek inline mini spinner inside that specific badge/button (`w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin`).
   - The rest of the table, headers, pagination, and filters must remain completely stable with zero movement.
3. **No Redundant Full-Page Re-fetching**:
   - Do NOT call `fetchData()` or set global `loading = true` on row-level mutations. Re-fetching is strictly reserved for initial mount, search/filter shifts, or full deletions.

---

## 8. Unified Executive Modal & Popup Design Standard (Mandatory)

> 🏛️ **Visual Consistency Mandate**: Every modal, slideover, and confirmation popup across the entire Admin Suite must use the exact same luxury architectural structure:

1. **Backdrop**:
   - `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200`
2. **Modal Surface Container**:
   - `relative w-full max-w-lg sm:max-w-xl md:max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-200`
   - Light Mode: `bg-white/98 border-[#e5dfd3] shadow-[0_25px_60px_-15px_rgba(60,44,12,0.18)] text-slate-900`
   - Dark Mode: `bg-[#100f0e]/98 border-[#292622] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] text-[#faf7f0]`
3. **Header Blueprint**:
   - Left: Rounded-2xl emblem badge with gold border & background (`w-10 h-10 rounded-2xl flex items-center justify-center bg-[#d8b056]/12 border border-[#d8b056]/28 text-[#d8b056] shrink-0`).
   - Center/Text: Clear bold Title (`text-lg sm:text-xl font-bold tracking-tight`) + helpful Subtitle (`text-xs text-slate-500 dark:text-slate-400 mt-0.5`).
   - Right: Close button `(X)` (`p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer`).
4. **Form Controls & Inputs**:
   - Labels: `block text-[11px] font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300`.
   - Fields: `w-full rounded-xl px-4 py-3 text-sm font-medium border transition-all duration-200 focus:outline-none focus:ring-2`.
   - Focus state: `focus:border-[#d8b056] focus:ring-[#d8b056]/25`.
5. **Modal Action Footer**:
   - Container: `flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-[#24221e]`.
   - Secondary / Cancel: `px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer`.
   - Primary Save / Submit: `px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-[0.99] disabled:opacity-60 transition cursor-pointer flex items-center gap-2`.
   - Danger Delete: `px-6 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-60`.

---

---

## 10. Mandatory Section Background & Eyebrow Heading Coupling Principle (Zero Abrupt Background Cuts / Zero Background Change Without Eyebrow Heading)

> 🛑 **Inviolable UI/UX Mandate**:
> **Background color MUST NEVER change anywhere on any page without an explicit Section Heading and Eyebrow (`<SectionHeading eyebrow="..." title="..." />`).**
>
> 1. **Zero Abrupt Cuts Under PageHeader or CTA Buttons**:
>    - Inner page heroes (`PageHeader`) must NEVER be sliced, chopped, or intersected mid-way by an abrupt background color transition directly underneath action buttons or country pills.
>    - Never use negative top margins (e.g. `-mt-6`, `-mt-12`, `-mt-20`) to pull a colored section over header buttons or elements.
>    - Any content section following `PageHeader` must start with generous top padding (`!pt-10 sm:!pt-16`) and begin with a dedicated `<SectionHeading eyebrow="..." title="..." />`.
>
> 3. **Strict 4-Color Sequential Rotation**:
>    - Section backgrounds must cycle in strict sequence across 4 curated subtle pastel shades:
>      - Variant 1: `#ffffff` (Light) / `#080809` (Dark) — Crisp White Canvas
>      - Variant 2: `#f4f8fc` (Light) / `#0a0e16` (Dark) — Whisper-Soft Ice Blue
>      - Variant 3: `#fcf9f1` (Light) / `#110f0a` (Dark) — Whisper-Soft Luxury Warm Gold / Ivory
>      - Variant 4: `#f2f9f5` (Light) / `#09110d` (Dark) — Whisper-Soft Mint Sage
>    - Sequences must never jump or repeat haphazardly; they strictly rotate `seq={1}`, `seq={2}`, `seq={3}`, `seq={4}`, `seq={5}` (which loops back to 1).
>    - Every single section background transition MUST be paired with its corresponding `<SectionHeading eyebrow="..." title="..." />`.

---

## 11. Git & GitHub Repository Standards (Mandatory Client Security Rules)

> 🔐 **Security & Code Hygiene Mandate**: All code commits and pushes to GitHub (`mdrashid18s/hopefairy`) must strictly adhere to enterprise-grade security and professional developer standards.

1. **Target Official Repository**:
   - Remote URL: `https://github.com/mdrashid18s/hopefairy.git`
   - Account: **MD Rashid** (`mdrashid18s`)
   - Default Branch: `main`

2. **Zero Sensitive Data / Secrets Policy (Inviolable)**:
   - NEVER commit or push actual credentials, secrets, or environment configuration files:
     - ❌ Database Passwords (`DB_PASSWORD`)
     - ❌ SMTP & Gmail App Passwords (`MAIL_PASSWORD`, app-specific passwords)
     - ❌ Payment Gateway Keys (Razorpay `RAZORPAY_KEY`, `RAZORPAY_SECRET`, Stripe secret keys)
     - ❌ Encryption keys, private tokens, Sanctum tokens, or `.pem`/`.key` files
     - ❌ Production `.env` files (`.env`, `.env.production`, `.env.local`, `.env.backup`)
   - ✅ Always maintain clean `.env.example` templates across all containers (`apis/`, `backend/`, `frontend/`) containing only empty/dummy placeholders.

3. **Human-Grade, Meaningful Commit Messages**:
   - Commits must NEVER be lazy, robotic, or generic (e.g. `update code`, `fix bugs`, `changes`).
   - Every commit must follow senior conventional formatting with clear context and bulleted explanations:
     ```
     feat(curriculum): implement 3-step Miller drilldown explorer & custom modal selectors

     - Transition curriculum syllabus explorer to permanent 3-step hierarchical drilldown (Subjects -> Topics -> Subtopics).
     - Replace native OS select elements with custom AdminCustomSelect to eliminate popup boundary overflow.
     - Integrate luxury executive course selector with two-tier typography and academic graduation badge.
     - Ensure clean responsive isolation for admin portal navigation without route highlight collisions.
     ```

4. **Strict Repository Cleanliness & Artifact Hygiene**:
   - Large binary build archives (`dist_zips/*.zip`, `*.tar.gz`) must NEVER be committed to the Git tree.
   - Transient folders (`node_modules/`, `vendor/`, `.next/`, `out/`, `build/`, `.phpunit.cache/`, `storage/logs/`) must be strictly ignored via root and container `.gitignore` files.
   - Database schemas must be versioned cleanly via Laravel database migrations and clean reference `database.sql` (without sensitive admin hashes).
