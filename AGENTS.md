# Triage-Sync Agent Instructions

## Architecture Rules
- Use Next.js App Router and strict TypeScript.
- Do not use unnecessary state-management libraries (Zustand, Redux) unless standard React context is insufficient.
- The UI should be primarily Server Components, passing data down to Client Components for interactivity.
- Use `firebase/firestore` and `firebase/storage` via the provided config in `src/lib/firebase/config.ts`.
- Gemini configuration is in `src/lib/gemini/config.ts`. Do not use raw model strings across the app.
- SBAR = Situation, Background, Assessment, Recommendation.

## Environment & Secrets
- NEVER commit `.env.local` or any API keys.
- If credentials are missing, log a clear console error or render a boundary, do not crash the Node process outright.

## Safety & Validation
- Validate all Gemini responses using Zod before updating Firestore.
- NEVER invent patient facts, allergies, medications, or vitals.
- Any action with `requiresHumanApproval` MUST NOT execute until explicitly confirmed by a user (mocked as clinician).

## Testing & Validation
- Ensure `npm run lint`, `npm run test`, and `npm run build` pass before completing a task.
- Ensure the 3D heart lattice (Three.js) has textual equivalents and respects `prefers-reduced-motion`.

## Commands
- **Install deps**: `npm install`
- **Dev server**: `npm run dev`
- **Lint**: `npm run lint`
- **Test**: `npm run test`
- **Build**: `npm run build`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
