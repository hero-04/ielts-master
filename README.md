# 🎯 IELTS Master

> The best Computer Delivered IELTS preparation platform for Uzbek students.

![Django](https://img.shields.io/badge/Django-5.2-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![License](https://img.shields.io/badge/License-Private-red)

---

## 📖 About

IELTS Master is a comprehensive IELTS preparation platform built specifically for Uzbek students. Modeled after the official Computer Delivered IELTS (CD IELTS) experience, it covers all four sections with AI-powered feedback for Writing and Speaking.

---

## ✨ Features

### 📚 Reading
- All official IELTS question types (Multiple Choice, Matching Headings, TFNG, YNNG, etc.)
- Timed practice with instant results
- Band score calculation
- Review mode with explanations

### 🎧 Listening
- CD IELTS-style audio player
- All 4 sections with auto-advance
- Transcript available after test

### 📝 Writing (Premium - AI Powered)
- Task 1 and Task 2 practice
- AI grading based on official IELTS band descriptors
- Detailed feedback on all 4 criteria

### 🎤 Speaking (Premium - AI Powered)
- All 3 parts with voice recording
- Google Speech-to-Text transcription
- AI-powered band score and feedback

### 📖 Vocabulary
- Flashcard system with spaced repetition
- Academic Word List + IELTS topic vocabulary
- Daily word goals

---

## 💰 Pricing

| Plan | Price | Features |
|------|-------|---------|
| Free | 0 UZS | Reading + Listening + Vocabulary |
| Premium | 50,000 UZS/month | + AI Writing & Speaking feedback |
| Learning Center | 30,000 UZS/student | Bulk access for centers |

**Payment methods:** Payme, Click, Xazna

---

## 🛠️ Tech Stack

**Backend**
- Python 3.11 + Django 5.2
- Django REST Framework
- JWT Authentication
- PostgreSQL 16
- Celery + Redis

**Frontend**
- Next.js 14 + TypeScript
- Tailwind CSS
- Zustand

**AI & APIs**
- Gemini API (Writing grading)
- Google Speech-to-Text (Speaking)
- OpenAI API (fallback)

**Infrastructure**
- Oracle Cloud Free Tier
- Nginx + Gunicorn
- Ubuntu 22.04

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 16
- Redis

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/hero-04/ielts-master.git
cd ielts-master

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your settings

# Create database
createdb ielts_master

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```
ielts-master/
├── config/          # Django settings and URLs
├── users/           # Authentication and user management
├── reading/         # Reading tests and questions
├── listening/       # Listening tests and audio
├── vocabulary/      # Flashcard system
├── writing/         # Writing submissions + AI grading
├── speaking/        # Speaking submissions + AI grading
├── payments/        # Payme, Click, Xazna integration
├── frontend/        # Next.js application
└── PROJECT.md       # Full project documentation
```

---

## 🗺️ Roadmap

- [x] Phase 1 — Django backend + JWT authentication
- [x] Phase 2 — Reading section API
- [ ] Phase 3 — Listening section
- [ ] Phase 4 — Vocabulary flashcards
- [ ] Phase 5 — Deploy to Oracle Cloud
- [ ] Phase 6 — Writing AI grading
- [ ] Phase 7 — Speaking AI grading
- [ ] Phase 8 — Payment integration
- [ ] Phase 9 — Mobile app (Flutter)

---

## 👨‍💻 Developer

**Sardorbek Safarboyev**
- GitHub: [@hero-04](https://github.com/hero-04)
- Location: Tashkent, Uzbekistan

---

## 📄 License

This project is private and proprietary. All rights reserved.

© 2026 IELTS Master. Built in Tashkent, Uzbekistan 🇺🇿
