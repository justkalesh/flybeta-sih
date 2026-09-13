# SIH 2026 Problem Statement Evaluation: MoSPI SmartSkills Intelligence (PS 26101)

This document maps the official Smart India Hackathon problem statement requirements against the current capabilities of the **FlyBeta** platform.

---

## 1. AI-Based Competency Assessment & Skill-Gap Analysis
**Requirement**: *Assess competencies, identify skill gaps, and create a comprehensive competency profile using information such as designation, department, etc.*

**How FlyBeta satisfies this**:
- **FRAC Diagnostic Assessment**: FlyBeta features a 12-question onboarding quiz mapped to the 4-quadrant MoSPI FRAC framework (Statistical, Technical, Governance, Behavioural).
- **Radar Chart Profiling**: The assessment instantly generates a dynamic radar chart visualizing the official's current competency levels.
- **Skill-Gap Synthesis**: The AI engine processes these results to pinpoint exact blind spots (e.g., strong in Data Science but weak in Digital Governance).

## 2. Competency Framework Mapping
**Requirement**: *Map competencies across Statistical, Technical, Digital Governance, and Behavioural/Managerial domains.*

**How FlyBeta satisfies this**:
- The entire platform curriculum is built on these exact four pillars. The Diagnostic quiz explicitly measures across these four domains, and the learning tracks (Cloud, AI/ML, Data Science) are tagged to address specific technical and statistical competencies.

## 3. Personalized Learning Recommendations & iGOT Integration
**Requirement**: *Recommend personalized learning pathways from iGOT Karmayogi and NSSTA's TPAC based on current competency level and job requirements.*

**How FlyBeta satisfies this**:
- **Smart Routing**: Based on the diagnostic radar chart, FlyBeta natively recommends which built-in Tracks (e.g., "Cloud Computing Level 1") the user should take.
- **iGOT Recommendations**: The Oracle (AI Assistant) acts as a mentor that can dynamically suggest external iGOT Karmayogi courses to supplement learning. 
- *(Note on Deep API Integration)*: Deep API integration with iGOT (fetching real-time course catalogues and pushing completion status) is currently simulated/planned, as actual access to iGOT APIs requires government credentials.

## 4. AI-Powered Virtual Assistants for Learner Support
**Requirement**: *Provide AI-powered virtual assistants for learner support, adaptive assessments, interactive learning modules, and virtual laboratories.*

**How FlyBeta satisfies this**:
- **The Oracle**: FlyBeta includes a globally accessible, floating Conversational AI widget powered by Gemini. It acts as a Socratic mentor, providing contextual help based on the exact page or lesson the user is viewing.
- **Virtual Labs**: FlyBeta replaces traditional static courses with Neo-Brutalist interactive lab nodes ("Flip-card" lessons) that require active participation.

## 5. AI-Powered Generation of MCQs & Quizzes / Automated Evaluation
**Requirement**: *AI-powered Intelligent Assessment Engine capable of generating objective-type questions (MCQs) and quizzes from uploaded learning materials. Instant evaluation, explanations, and personalized feedback.*

**How FlyBeta satisfies this**:
- **Code-Drishti (Generative Lab Evaluator)**: FlyBeta goes *beyond* simple MCQs. It allows officials to submit actual written solutions, architectural designs, or code snippets for evaluation. The Django backend sends the submission to Gemini alongside a strict grading rubric.
- **Instant Feedback**: The AI instantly returns a structured evaluation containing a pass/fail status, a granular score out of 100, markdown-formatted constructive feedback, and actionable next steps without hallucination. 
- *(Note on Uploading Materials)*: The specific feature allowing trainers to upload PDFs to auto-generate MCQs is currently a high-priority feature slated for the next development phase, though the underlying Gemini integration to achieve it is already fully operational in the backend.

## 6. Comprehensive Analytics Dashboard (Learner & Administrator)
**Requirement**: *Employee dashboard showing competencies, skill gaps, learning paths, and progress. Administrator dashboard showing workforce competencies, training effectiveness, and predictive analytics.*

**How FlyBeta satisfies this**:
- **Learner Dashboard (`DashboardPage.jsx`)**: Displays the user's XP, 8-tier rank progression (Novice to Legend), streak map, and progress bars for all enrolled tracks.
- **Admin Dashboard (`AdminDashboardPage.jsx`)**: A dedicated interface featuring Division Heatmaps, Cadre Analysis, and Training Effectiveness charts to help decision-makers identify systemic skill shortages across the organization.

## 7. Secure, Scalable, Web Application
**Requirement**: *Secure, scalable, cloud-ready, interoperable web platform with Role-Based Access Control (RBAC), Single Sign-On (SSO), and secure data exchange.*

**How FlyBeta satisfies this**:
- **Tech Stack**: Built on React + Vite (Frontend) and Django REST Framework (Backend), deployed on enterprise-grade cloud infrastructure (Vercel & Railway).
- **Database & Security**: Backed by PostgreSQL (Supabase) with JWT-based authentication (SimpleJWT). Features robust token rotation and strict CORS policies.
- **RBAC**: Segregates users into Guests, Registered Officials (Level 2+ access), and Administrators.

---

## 🚀 Summary of Compliance

**Fully Satisfied:**
✅ AI Competency Assessment & Skill-Gap Analysis
✅ Competency Framework Mapping (4 FRAC Domains)
✅ AI Virtual Assistant (The Oracle)
✅ Interactive Dashboards (Admin & Learner)
✅ Gamified, secure, and scalable cloud architecture
✅ Automated Evaluation with Instant Feedback (Code-Drishti)

**Partially Satisfied / Next Steps:**
⚠️ **iGOT API Integration**: We provide recommendations, but require official government API keys to pull live iGOT catalogs and push telemetry data.
⚠️ **Trainer Document Upload for MCQ Generation**: We have an advanced generative evaluator for lab submissions, but building the specific drag-and-drop UI for trainers to upload PDFs and auto-generate MCQs is the immediate next step for Phase 16.
