# FlyBeta 🚀

**FlyBeta** (MoSPI SmartSkills Intelligence) is a gamified, AI-powered competency development platform for Indian Statistical Service officers. Built for **SIH 2026**, it maps to the FRAC (Functional Roles, Activities & Competencies) framework to identify skill gaps and deliver targeted learning pathways.

Built with a striking Neo-Brutalist design system, FlyBeta makes upskilling engaging and visually stunning.

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [flybeta-sih.vercel.app](https://flybeta-sih.vercel.app) |
| **Backend API** | [flybeta.up.railway.app](https://flybeta.up.railway.app) |

## 🤖 AI Workflows & Integration

FlyBeta leverages **Google Gemini 2.5 Flash** (via Cloudflare Route429 Proxy) to deliver three core AI-driven experiences tailored for official statistical capability building:

### 1. The Oracle (Conversational AI Assistant)
A context-aware, globally accessible floating chat widget designed to resolve learner blockers in real-time.
- **How it works**: The frontend passes the user's current context (the active page, track, or specific lesson they are stuck on) to the Django `api/ai/oracle/` endpoint.
- **Prompt Engineering**: The backend injects a strict system prompt instructing the model to act as a Senior ISS Officer / Data Science Mentor. It guides the user using Socratic questioning rather than just giving away the answer, ensuring active learning.
- **UI/UX**: Features a sleek, draggable floating UI with Markdown support, syntax highlighting, and a typing indicator to maintain the platform's gamified aesthetic.

### 2. Code-Drishti (Generative Lab Evaluator)
Traditional multiple-choice quizzes are ineffective for advanced data architecture. FlyBeta implements interactive labs where users submit written solutions, data models, or code.
- **How it works**: When a user submits an interactive lab assignment, the submission is sent to the `api/ai/evaluate/` endpoint.
- **Evaluation Engine**: The backend fetches the official "Rubric" and "Solution Framework" for that specific lesson from the database. It asks Gemini to evaluate the user's submission strictly against this rubric.
- **Output**: The AI returns a structured JSON response containing:
  - `passed` (boolean): Whether the submission met the standard.
  - `score` (0-100): Granular grading.
  - `feedback` (markdown text): Specific, constructive feedback highlighting flaws or praising optimizations.
  - `next_steps`: Actionable advice for improvement.
- **Integration**: The result is instantly processed by the gamification engine, awarding XP, unlocking the next level, and updating the officer's FRAC competency matrix.

### 3. AI Skill-Gap Diagnostics (FRAC Matrix)
Upon onboarding, officers take a 12-question diagnostic test mapped to the 4-quadrant MoSPI FRAC framework.
- **How it works**: The quiz results are processed by the assessment engine to detect blind spots in statistical domains (e.g., Sampling Theory vs. DPDP Act Compliance).
- **Synthesis**: The AI synthesizes the test results to generate a personalized radar chart.
- **Routing**: Based on the identified gaps, the system intelligently recommends specific modules on the platform or routes the officer to accredited courses on iGOT Karmayogi.

## Features

- **FRAC Diagnostic Assessment**: 12-question competency quiz with real-time radar chart scoring across 4 quadrants.
- **Pre-Signup Skill Gap Analysis**: Users see results before creating an account.
- **Structured Tracks & Roadmaps**: Follow beautifully designed, step-by-step skill trees mapped to FRAC competencies.
- **Interactive Labs (Code-Drishti)**: Solve real-world coding problems with flip-card lessons evaluated by AI.
- **AI-Powered Evaluation**: Instant feedback using Google Gemini AI (via Route429 proxy).
- **Oracle Widget**: Conversational AI assistant for contextual help.
- **Admin Analytics Dashboard**: Division heatmaps, cadre analysis, and training effectiveness charts.
- **11-Step Guided Tour**: Onboarding walkthrough using driver.js across 4 pages.
- **Gamification**: Earn XP, collect coins, and maintain daily streaks as you level up.
- **Neo-Brutalist Design**: Bold, high-contrast, energetic interface with 5 switchable themes.
- **JWT-Based Authentication**: Full register / login / logout with access + refresh token rotation.
- **Async SMTP Email**: Password reset emails via Gmail SMTP in a background thread.
- **Freemium Access Control**: Level 1 free for guests; Level 2+ gated behind sign-up.
- **Mobile-Optimized**: Responsive design with hamburger nav, stacked layouts, and touch-friendly tour.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS (v4)
- **Backend**: Django 5.2, Django REST Framework
- **Database**: PostgreSQL via Supabase (Production), SQLite (Development)
- **Authentication**: JWT (djangorestframework-simplejwt) — `CustomUser` + `StudentProfile`
- **AI Integration**: Google Gemini (via Route429 Cloudflare Worker proxy)
- **Email**: Django SMTP backend via Gmail App Passwords (async threaded dispatch)
- **Hosting**: Vercel (frontend) + Railway (backend) — free tier
- **State Management**: React Context API (`AuthContext`, `ThemeContext`)

## Local Setup

### 1. Backend Setup (Django)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set up your environment variables
cp .env.example .env
# Edit .env with your credentials:
#
# Core
# GEMINI_API_KEY=route429-managed
# ROUTE429_PROXY_SECRET=your_secret
# GITHUB_TOKEN=your_token_here
# DATABASE_URL=your_postgres_connection_string
#
# SMTP Email Configuration (Required for password resets)
# EMAIL_HOST_USER=your_email@gmail.com
# EMAIL_HOST_PASSWORD=your_16_char_app_password

# Run migrations and start the server
python manage.py migrate
python manage.py runserver
```

The Django API will be available at `http://localhost:8000`.

### 2. Frontend Setup (React/Vite)

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The React application will be available at `http://localhost:5173`.

## Architecture

```
flybeta/
├── backend/          # Django REST Framework API, AI Services, Models
│   ├── accounts/     # CustomUser, JWT auth, password reset
│   ├── api/          # AI endpoints (Oracle, Architect, Reviewer)
│   ├── learn/        # Domains, Levels, Lessons, Progress
│   ├── content/      # Curriculum JSON files (3 tracks × 10 levels)
│   ├── build.sh      # Railway/Render build script
│   └── render.yaml   # Render Blueprint (Legacy)
├── frontend/         # React + Vite + Tailwind CSS application
│   ├── src/
│   │   ├── components/  # UI components (Navbar, TourGuide, Oracle, Auth)
│   │   ├── pages/       # Route pages (Dashboard, Diagnostic, Admin, Tracks)
│   │   ├── contexts/    # AuthContext, ThemeContext
│   │   └── services/    # API layer (Axios + interceptors)
│   ├── vercel.json   # Vercel SPA rewrite rules
│   └── .env.production
├── docs/             # Technical documentation
├── CONTEXT.md        # Full project context & build log
├── DESIGN.md         # Design system tokens
└── README.md         # This file
```

---
*Built with 💚 for MoSPI SmartSkills Intelligence — SIH 2026*

