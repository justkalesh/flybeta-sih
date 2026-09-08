# FlyBeta 🚀

**FlyBeta** (MoSPI SmartSkills Intelligence) is a gamified, AI-powered competency development platform for Indian Statistical Service officers. Built for **SIH 2024**, it maps to the FRAC (Functional Roles, Activities & Competencies) framework to identify skill gaps and deliver targeted learning pathways.

Built with a striking Neo-Brutalist design system, FlyBeta makes upskilling engaging and visually stunning.

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [flybeta-sih.vercel.app](https://flybeta-sih.vercel.app) |
| **Backend API** | [flybeta-sih.onrender.com](https://flybeta-sih.onrender.com) |

## Features

- **FRAC Diagnostic Assessment**: 12-question competency quiz with real-time radar chart scoring across 4 quadrants.
- **Pre-Signup Skill Gap Analysis**: Users see results before creating an account.
- **Structured Tracks & Roadmaps**: Follow beautifully designed, step-by-step skill trees mapped to FRAC competencies.
- **Interactive Labs**: Solve real-world coding problems with flip-card lessons.
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
- **Hosting**: Vercel (frontend) + Render (backend) — free tier
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
│   ├── build.sh      # Render build script
│   └── render.yaml   # Render Blueprint
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

