# GradPilot AI

**Unified Student Engagement Ecosystem for Education and Financing Choices**

GradPilot AI is an AI-first web platform for Indian students planning higher education in India or abroad. It helps students move from university discovery to application planning and education loan readiness through one personalized ecosystem.

The platform is built around the journey:

**Awareness → Engagement → Trust → Loan Conversion**

---

## Problem

Students planning graduate or postgraduate studies often face a fragmented journey across:

- Country and university discovery
- Admission planning
- ROI and cost comparison
- Application timelines
- Visa and document preparation
- Education loan discovery and eligibility

GradPilot AI brings these steps into one connected platform.

---

## Solution

GradPilot AI creates a **Student Digital Twin** and uses it across multiple AI-powered modules to generate personalized recommendations, predictions, financial insights, timelines, and loan-readiness scores.

The goal is to help students make better study decisions while enabling qualified education loan conversion.

---

## Key Features

### Student Digital Twin
Stores the student’s academic, financial, and study preferences, including CGPA, target course, preferred countries, budget, loan requirement, co-applicant status, and journey stage.

### AI Career Navigator
Recommends best-fit countries, universities, and courses based on profile fit, affordability, visa friendliness, career demand, and ROI.

### ROI Calculator
Estimates total study cost, expected salary, EMI, repayment amount, break-even period, and financial risk.

### Admission Predictor
Classifies universities as **Safe**, **Match**, or **Ambitious** using academic profile, test readiness, course alignment, and university competitiveness.

### Application Timeline
Generates a personalized roadmap for tests, SOP/LORs, applications, loan documents, visa preparation, and final decision-making.

### Decision Intelligence Hub
Combines admission probability, ROI, affordability, country fit, loan readiness, opportunity, and risk into one final decision score.

### Conversational AI Mentor
A profile-aware mentor that answers student questions about countries, universities, ROI, admissions, timelines, documents, and loans.

### Loan Engine
Estimates loan eligibility, EMI, approval confidence, document readiness, dynamic loan offers, and application flow.

### Growth Engine
Demonstrates AI-led acquisition, nudges, content ideas, referrals, lifecycle agents, and zero-human-intervention growth loops.

### Application Tracker
Tracks application readiness, document progress, loan progress, visa readiness, blockers, and upcoming tasks.

### Analytics Dashboard
Shows engagement score, conversion score, loan lead quality, business impact, funnel analytics, and module usage.

---

## Tech Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Frontend:** React, Tailwind CSS
- **UI:** shadcn/ui, Lucide React
- **Charts:** Recharts
- **State Management:** Zustand
- **Backend:** Next.js API Routes
- **Logic Layer:** Modular TypeScript-based scoring and recommendation engines

---

## Architecture

```txt
Student Digital Twin
        ↓
AI Recommendation Engines
        ↓
Decision Intelligence Layer
        ↓
Loan Conversion Engine
        ↓
Growth + Analytics Layer
```

## Core logic modules:

```lib/recommendation-engine.ts```
```lib/roi-engine.ts```
```lib/admission-engine.ts```
```lib/timeline-engine.ts```
```lib/decision-engine.ts```
```lib/mentor-engine.ts```
```lib/loan-engine.ts```
```lib/growth-engine.ts```
```lib/application-tracker-engine.ts```
```lib/analytics-engine.ts```

## Running Locally

1. Clone the repository
```git clone https://github.com/YOUR_USERNAME/gradpilot-ai.git```
```cd gradpilot-ai```
2. Install dependencies
```npm install```
3. Start the development server
```npm run dev```
4. Open the app
```http://localhost:3000```

## Demo Login
Email: ```nilay@gradpilot.ai```
Password: ```gradpilot123```


# GradPilot AI is designed to convert student engagement into qualified education loan leads.

It supports conversion by:

- Engaging students early in their study journey
- Building trust through AI-powered decision tools
- Helping students understand affordability and ROI
- Estimating loan eligibility before application
- Preparing students with document checklists
- Routing high-intent students toward loan offers

This repo includes functional frontend screens, backend API routes, simulated intelligence engines, and a complete end-to-end student journey.
This is a working hackathon prototype with simulated intelligence and mock data. It is designed to demonstrate the full product flow without requiring paid external APIs.


GradPilot AI
Built with love 💜 by Team_Scoobaa.
