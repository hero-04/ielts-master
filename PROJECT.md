# IELTS Master — Project Documentation

Internal technical reference. Last reviewed: October 2026.

## 🎯 Project Vision

An IELTS preparation platform for Uzbek students, modeled on the Computer Delivered IELTS (CD IELTS) exam interface. Covers Reading, Listening, Writing, Speaking, and Vocabulary. Originally scoped around Cambridge IELTS book content — that plan is blocked (see **Content Licensing** below) and the platform is currently being rebuilt around original or properly licensed content.

---

## 👥 User Types

Defined in `users.User` (`user_type` field) — the model and role structure exist, but subscription enforcement and billing are not wired up yet (see Known Issues).

1. **Guest** — unauthenticated browsing
2. **Free Student** — default role on registration
3. **Premium Student** — intended full-access tier; no gating logic currently enforces this distinction
4. **Learning Center Admin** — intended bulk-account manager role
5. **Super Admin** — Django staff/superuser

---

## 🏗️ Tech Stack

### Backend
- **Framework:** Django 5.2 + Django REST Framework
- **Language:** Python 3.12
- **Auth:** JWT via `djangorestframework-simplejwt` (access token 60 min, refresh 7 days, rotation + blacklist on refresh)
- **Database:** PostgreSQL on Neon (free tier, permanent; compute auto-suspends after 5 min idle). SQLite is the local dev fallback when `DATABASE_URL` is unset. Nightly `pg_dump` via GitHub Actions (`.github/workflows/db-backup.yml`, needs `DATABASE_URL` repo secret); manual `scripts/backup_db.sh`.
- **Media/file storage:** Cloudinary (`django-cloudinary-storage`) when `CLOUDINARY_CLOUD_NAME` is set, falls back to local `MEDIA_ROOT` otherwise
- **Static files:** WhiteNoise
- **Apps:** `users`, `reading`, `listening`, `vocabulary`, `writing`, `speaking`, `payments`, `content` (import/export commands only, no models)

### Frontend
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **State management:** Zustand (`frontend/store/useAuthStore.ts`)
- **HTTP client:** Axios

### Not currently implemented (present in earlier planning docs, not in the codebase)
- No Celery / Redis — no async task queue exists in `INSTALLED_APPS`
- No AI grading integration — no Gemini, OpenAI, or Google Speech-to-Text calls anywhere in the backend
- No mobile app

---

## 📚 Module Status

### Reading — built
- Question types (see `reading.models.ReadingQuestion.QuestionType`): multiple choice (single + multiple answer), true/false/not given, yes/no/not given, matching headings, matching information, short answer, sentence completion, summary completion (inline blank), form completion, table completion (multi-blank)
- Text highlighting and adjustable font size on the question/passage panel
- Timer with `localStorage` persistence (survives refresh/navigation away)
- Attempt + answer persistence (`ReadingAttempt`, `ReadingAnswer`), band score and raw score stored per attempt
- Review mode via `/reading/results/[id]`

### Listening — built
- Same question type set as Reading, plus listening-specific types: diagram labelling, drag & drop, selection grid, matching
- In-browser audio playback
- Multi-blank inline inputs for completion-type questions
- Answers persisted to `localStorage` during the attempt; attempt/answer/band score persistence mirrors Reading

### Writing — built
- Task 1 and Task 2 prompts (`WritingPrompt`, distinguished by `task_type`)
- Task 1 supports an image prompt via `prompt_image` (an external URL field — there is no file upload endpoint)
- Timer with `localStorage` persistence
- Adjustable font size
- Sample answer modal (Band 8+ reference answers stored per prompt)
- Realistic exam-style instruction formatting (time limit, minimum word count, task box)
- Submissions are stored (`WritingSubmission`, tracks word count) — **no AI grading or feedback exists**; submissions are saved but not scored

### Speaking — built (practice UI only)
- Part 1 / Part 2 / Part 3 structure (`SpeakingQuestion.Part`)
- Content is fully original, not derived from Cambridge or any third-party materials
- No submission/attempt model exists yet — there is nowhere to persist a recording, transcript, or score. Practice is currently presentation-only (question + sample answer), not a graded exam flow

### Vocabulary — built
- Word list tied to a book-number field (`cambridge_book` on `VocabularyWord` — see Known Issues on the field name)
- Organized by topic (Environment, Technology, Health, Education, Society, Science, Business, Culture) and difficulty

---

## ⚠️ Content Licensing

**Cambridge University Press explicitly denied permission to use Cambridge IELTS book content on this platform, including on free tiers** (support ticket 3476747, response received June 2026).

As of July 2026:
- All Cambridge branding, book titles, and book-specific test content have been removed from the frontend (landing page, module menus, test headers, results, my-tests, my-writings).
- Cambridge-sourced passages, prompts, audio, and questions have been removed from the database.
- Module menus are driven by `/api/<module>/books/` and show an empty state only when the database has no content.
- Backend models, views, and API endpoints were **not** altered — the schema still supports adding tests (the ability to add new content is intact, only the Cambridge content itself and its branding were removed).
- The grouping field is `book_number` (1–20) on all content models — a generic set number, not a reference to any publisher.

The platform ships with no test content. Content is loaded per deployment with the JSON import pipeline (see **Content Import** below). Whatever is imported is the operator's responsibility — the codebase itself contains no third-party material.

---

## 📥 Content Import

`python manage.py import_content <file.json> [--replace] [--dry-run]` loads reading/listening/writing/speaking/vocabulary content; `export_content` dumps it back out. Full format spec and an example in `content/README.md` and `content/examples/sample_test.json`. Each module exposes `GET /api/<module>/books/` (distinct book numbers + counts), which the frontend menus use, so content appears in the UI the moment it is imported.

---

## 🔒 Security

- Auth endpoints are rate-limited via DRF `ScopedRateThrottle`:
  - `/api/auth/login/` — 5 requests/minute per IP (anonymous)
  - `/api/auth/register/` — 10 requests/hour per IP (anonymous)
- Global DRF throttle defaults: 100 requests/day (anonymous), 1000 requests/day (authenticated)
- JWT refresh tokens rotate and are blacklisted after use (`ROTATE_REFRESH_TOKENS`, `BLACKLIST_AFTER_ROTATION`)
- CORS is restricted to `localhost:3000` in dev plus `FRONTEND_URL` (comma-separated) in production
- `DEBUG` defaults to **False**; `SECRET_KEY` is required when `DEBUG=False` (startup fails otherwise); `ALLOWED_HOSTS` comes from env (Render's hostname is added automatically)
- With `DEBUG=False`: HTTPS redirect, secure cookies, HSTS (30 days), nosniff, `X-Frame-Options: DENY`, `SECURE_PROXY_SSL_HEADER` for Render/Cloudflare
- Public registration is a switch: `REGISTRATION_OPEN` (default False → `/api/auth/register/` returns 403; `/api/auth/config/` tells the frontend, which hides the Sign-up link)

---

## 🚧 Known Issues / Tech Debt

- **Content:** Nothing ships with the repo; load tests with `import_content` (see Content Import).
- **Payments:** Not implemented. `payments` app has `Subscription` and `LearningCenter` models defined, but `payments/views.py` is empty and there are no Payme/Click/Xazna integrations or URLs registered. Subscription tiers exist as a data model but nothing enforces or sells them.
- **AI grading:** Not implemented for Writing or Speaking, despite being part of the original vision. No AI provider is integrated anywhere in the backend.
- **Speaking persistence:** No model exists to store a speaking attempt, recording, transcript, or score.
- **Database:** Neon free tier — 1 GB storage, 100 compute-hours/month. Fine for a private platform; watch the usage page once relatives are on it.
- **Cloudflare:** Not yet in front of the app (no custom domain). Add when a domain is bought: DNS proxy + WAF rate rule on `/api/auth/`.

---

## 🚀 Deployment

- **Frontend:** Vercel — [ielts-master-red.vercel.app](https://ielts-master-red.vercel.app)
- **Backend:** Render — [ielts-master-zxlv.onrender.com](https://ielts-master-zxlv.onrender.com). Build command `./build.sh` (installs, collectstatic, migrate); start command from `Procfile`.
- **Database:** PostgreSQL on Neon (eu-central-1), free tier
- **Media storage:** Cloudinary
- **Static files:** served by WhiteNoise from the Django app itself

---

## 📁 Project Structure

```
ielts-master/
├── config/                   # Django settings, root URLs, WSGI
├── users/                    # Auth, custom User model, JWT views
├── reading/                  # Reading tests, questions, attempts
├── listening/                # Listening tests, questions, attempts
├── vocabulary/                # Vocabulary words
├── writing/                   # Writing prompts + submissions (no AI grading)
├── speaking/                  # Speaking tests + questions (no submission model yet)
├── payments/                  # Subscription/LearningCenter models only — no views/integration
├── content/                   # import_content / export_content commands, JSON format docs + example
├── scripts/backup_db.sh       # manual pg_dump
├── .github/workflows/         # nightly DB backup
├── build.sh                   # Render build command
├── requirements.txt
├── frontend/                  # Next.js project
│   ├── app/                   # Pages and layouts (App Router)
│   ├── components/            # Reusable UI components
│   ├── store/                 # Zustand stores
│   ├── lib/                   # API client, utilities
│   └── public/                # Static assets
└── PROJECT.md                 # This file
```

Note: the app is a single Django project at the repo root (not nested under a `backend/` directory as earlier drafts of this doc assumed).

---

## 🔑 Environment Variables (actual, from `config/settings.py`)

```
# Django
SECRET_KEY=
DEBUG=
DATABASE_URL=            # Postgres connection string; falls back to local sqlite3 if unset

ALLOWED_HOSTS=           # comma-separated; Render hostname auto-added
REGISTRATION_OPEN=       # True/False — public sign-up switch

# CORS
FRONTEND_URL=            # comma-separated origins added to CORS_ALLOWED_ORIGINS

# Media storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Not currently read by the codebase, despite appearing in some earlier planning docs/`.env.example`: `REDIS_URL`, `CELERY_BROKER_URL`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_APPLICATION_CREDENTIALS`, Payme/Click/Xazna keys. These map to features that aren't built yet (see Known Issues).

---

## 📞 Business Model

Originally planned as a public paid platform for individual Uzbek IELTS students plus learning-center contracts (see the old Pricing Model draft this section replaces). That plan assumed Cambridge book content, which is no longer available (see Content Licensing).

**Current thinking:** leaning toward private/closed distribution to individual learning centers (direct relationships, custom content per center) rather than a public launch, until either original content is built out or a proper licensing arrangement is in place. Public pricing tiers, payment integration, and open registration are on hold pending that decision — no committed pricing model right now.
