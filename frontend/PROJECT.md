# IELTS Master — Full Project Documentation

## 🎯 Project Vision
A comprehensive IELTS preparation platform for Uzbek students, modeled after the official Computer Delivered IELTS (CD IELTS) experience. The platform covers all four IELTS sections with AI-powered feedback for Writing and Speaking. Built to be sold to individual students and IELTS learning centers across Uzbekistan.

---

## 👥 User Types
1. **Guest** — can browse the platform, see limited content
2. **Free Student** — full access to Reading and Listening, limited Writing/Speaking
3. **Premium Student** — full AI feedback on Writing and Speaking
4. **Learning Center Admin** — manages multiple student accounts under one subscription
5. **Super Admin** — platform owner, manages everything

---

## 💰 Pricing Model
- **Free tier:** Reading + Listening + Vocabulary (unlimited)
- **Premium individual:** 50,000 UZS/month
- **Learning center bulk:** 30,000 UZS/student/month (minimum 10 students)
- **Payment methods:** Payme, Click, Xazna (Uzbek payment gateways)

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (React) with TypeScript
- **Styling:** Tailwind CSS
- **State management:** Zustand
- **HTTP client:** Axios

### Backend
- **Framework:** Django 5 + Django REST Framework
- **Language:** Python 3.12
- **Authentication:** JWT (djangorestframework-simplejwt)
- **Task queue:** Celery + Redis (for AI processing)

### Database
- **Primary:** PostgreSQL 16
- **Cache:** Redis

### AI & APIs
- **Writing grading:** Gemini API (primary), OpenAI API (fallback)
- **Speaking STT:** Google Speech-to-Text API
- **Speaking grading:** Gemini API

### Infrastructure
- **Server:** Oracle Cloud Free Tier (Ubuntu 22.04)
- **Web server:** Nginx
- **Process manager:** Gunicorn + Systemd
- **Future mobile:** Flutter (iOS + Android)

---

## 📚 Platform Sections

### 1. READING (Build First)
- Passages modeled after Cambridge IELTS books (original content)
- Question types:
  - Multiple Choice (single and multiple answers)
  - Matching Headings
  - Matching Information
  - True / False / Not Given
  - Yes / No / Not Given
  - Summary Completion
  - Sentence Completion
  - Short Answer Questions
- Timer (20 minutes per passage, 60 minutes full test)
- Instant results with explanations
- Band score calculation
- Review mode (see correct answers with highlighted text)
- 3 passages per full Reading test (Academic)

### 2. LISTENING (Build Second)
- Audio player with CD IELTS-style interface
- Question types:
  - Multiple Choice
  - Form/Note/Table Completion
  - Matching
  - Plan/Map/Diagram Labelling
- 4 sections per full Listening test
- Auto-advance between sections
- Transcript available after test
- Band score calculation

### 3. VOCABULARY (Build Third)
- Flashcard system (spaced repetition)
- Word categories: Academic Word List, IELTS topic vocabulary
- Topics: Environment, Technology, Health, Education, Society, etc.
- Daily word goals
- Progress tracking

### 4. WRITING (Build Fourth — Premium)
- Task 1: Academic (graphs, charts, diagrams) and General (letters)
- Task 2: Essay (all types — opinion, discussion, problem-solution, etc.)
- AI grading based on official IELTS band descriptors:
  - Task Achievement / Task Response
  - Coherence and Cohesion
  - Lexical Resource
  - Grammatical Range and Accuracy
- Sample answers from Simon, Pauline, Tahasani (for reference training)
- Detailed feedback per criterion
- Band score per task and overall

### 5. SPEAKING (Build Fifth — Premium)
- Part 1: Personal questions
- Part 2: Cue card (with 1-minute preparation timer)
- Part 3: Discussion questions
- Voice recording in browser (WebRTC)
- Google Speech-to-Text transcription
- AI grading based on IELTS Speaking band descriptors:
  - Fluency and Coherence
  - Lexical Resource
  - Grammatical Range and Accuracy
  - Pronunciation
- Sample answers for each topic
- Model answers from official Cambridge materials

---

## 🗄️ Database Schema (Core Tables)

### Users
```
users
- id, email, password_hash, full_name
- user_type (guest/free/premium/center_admin/super_admin)
- subscription_end_date, created_at
- learning_center_id (nullable)
```

### Content
```
reading_tests
- id, title, difficulty, passage_a, passage_b, passage_c, created_at

reading_questions
- id, test_id, passage (A/B/C), question_type, question_text
- correct_answer, explanation, order_number

listening_tests
- id, title, difficulty, audio_url, transcript, created_at

listening_questions
- id, test_id, section (1-4), question_type, question_text
- correct_answer, order_number

vocabulary_words
- id, word, definition, example_sentence, topic, difficulty
- audio_url (pronunciation)
```

### Results
```
test_attempts
- id, user_id, test_type (reading/listening/writing/speaking)
- test_id, started_at, completed_at, band_score, raw_score

reading_answers
- id, attempt_id, question_id, user_answer, is_correct

writing_submissions
- id, user_id, task_type (1/2), prompt, user_essay
- ai_feedback (JSON), band_score, submitted_at

speaking_submissions
- id, user_id, part (1/2/3), topic, audio_url
- transcript, ai_feedback (JSON), band_score, submitted_at
```

### Payments
```
subscriptions
- id, user_id, plan_type, amount, currency (UZS)
- payment_method (payme/click/xazna)
- started_at, ends_at, status (active/expired/cancelled)

learning_centers
- id, name, contact_person, phone, email
- student_limit, price_per_student, contract_start, contract_end
```

---

## 🎨 Design Principles
- Clean, modern UI — better than sanokulov.uz
- Mobile-first responsive design
- Dark mode support
- CD IELTS-style test interface (feels like the real exam)
- Uzbek and English language toggle
- Fast loading (optimized for Uzbekistan internet speeds)

---

## 🚀 Build Order

### Phase 1 — Foundation (Weeks 1-2)
- [ ] Django project setup with PostgreSQL
- [ ] Next.js frontend setup
- [ ] User authentication (register, login, JWT)
- [ ] Admin panel for content upload
- [ ] Basic UI components

### Phase 2 — Reading (Weeks 3-4)
- [ ] Reading test interface (CD IELTS style)
- [ ] All question types implemented
- [ ] Timer functionality
- [ ] Results and band score calculation
- [ ] Review mode

### Phase 3 — Listening (Weeks 5-6)
- [ ] Audio player component
- [ ] Listening test interface
- [ ] All question types
- [ ] Results and band score

### Phase 4 — Vocabulary (Week 7)
- [ ] Flashcard system
- [ ] Spaced repetition algorithm
- [ ] Topic categories

### Phase 5 — Deploy & Test (Week 8)
- [ ] Deploy to Oracle Cloud
- [ ] Nginx + Gunicorn setup
- [ ] Domain setup
- [ ] Load testing
- [ ] Bug fixes

### Phase 6 — Writing AI (Weeks 9-10)
- [ ] Gemini API integration
- [ ] Writing submission interface
- [ ] AI grading pipeline
- [ ] Feedback display

### Phase 7 — Speaking AI (Weeks 11-12)
- [ ] Voice recording interface
- [ ] Google STT integration
- [ ] AI grading pipeline
- [ ] Feedback display

### Phase 8 — Payments (Week 13)
- [ ] Payme integration
- [ ] Click integration
- [ ] Xazna integration
- [ ] Subscription management
- [ ] Learning center bulk billing

### Phase 9 — Polish & Scale (Week 14+)
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Mobile app (Flutter)
- [ ] Marketing landing page

---

## 📁 Project Structure

```
ielts-master/
├── backend/                  # Django project
│   ├── config/               # Settings, URLs, WSGI
│   ├── users/                # Auth, profiles, subscriptions
│   ├── reading/              # Reading tests and questions
│   ├── listening/            # Listening tests
│   ├── vocabulary/           # Flashcards
│   ├── writing/              # Writing submissions + AI
│   ├── speaking/             # Speaking submissions + AI
│   ├── payments/             # Payme, Click, Xazna
│   └── requirements.txt
├── frontend/                 # Next.js project
│   ├── app/                  # Pages and layouts
│   ├── components/           # Reusable UI components
│   ├── lib/                  # API clients, utilities
│   └── public/               # Static assets
└── PROJECT.md                # This file
```

---

## 🔑 Environment Variables Needed
```
# Django
SECRET_KEY=
DATABASE_URL=
REDIS_URL=

# AI APIs
GEMINI_API_KEY=
OPENAI_API_KEY=
GOOGLE_SPEECH_API_KEY=

# Payments
PAYME_MERCHANT_ID=
CLICK_MERCHANT_ID=
XAZNA_API_KEY=

# Storage (for audio files)
AWS_S3_BUCKET= (or Oracle Object Storage)
```

---

## 📞 Business Model Summary
- Target: Uzbek IELTS students and learning centers
- USP: Best CD IELTS simulation + AI feedback in Uzbekistan
- Revenue: Individual subscriptions + Learning center contracts
- Team needed: 1 developer (you), 1 support technician, 1 sales manager
- Future: Mobile app, expand to other Central Asian countries
