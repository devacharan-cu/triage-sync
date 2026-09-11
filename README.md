# TRIAGE-SYNC

"Triage-Sync turns chaotic emergency handovers into structured clinical intelligence — and catches conflicts before they become mistakes."

## Overview

TRIAGE-SYNC is an emergency-department tactical intake command center designed for a simulated mass-casualty scenario. 
It processes multimodal inputs (paramedic audio, handwritten medical histories, medication images) and extracts structured evidence-linked clinical intelligence. 
It features a conflict engine to detect contradictions and a missed-signal engine to highlight relevant historical context for the current triage picture.

**Disclaimer:** This is a hackathon demonstration using synthetic/de-identified patient data and simulated hospital resources. Do not use for real clinical diagnosis or treatment.

## Architecture

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Three.js, React Three Fiber.
- **Backend:** Next.js Route Handlers, Zod, Firebase (Firestore & Storage).
- **AI:** Google GenAI SDK (Gemini 2.5 Flash / Pro).
- **Testing:** Vitest, Playwright.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   Copy `.env.example` to `.env.local` and add your Firebase config and Gemini API key.
4. Run the development server: `npm run dev`

## Testing

Run unit tests with Vitest:
```bash
npm run test
```

## Security

- Do not commit `.env.local` or any API keys.
- Use only synthetic/de-identified patient data.
