# Trip-AVA Maintenance Guide

## Project State

- Repository: `ava-agent/trip-ava`
- Product: AVA AI digital human travel guide frontend
- Stack: React 18, TypeScript, Vite, Zustand, Tailwind CSS
- Deployment: Docker/CloudBase-style static frontend path; backend is separate.

## Before Editing

- Keep frontend API assumptions aligned with the separate `trip-ava-aigc` backend.
- Do not commit built `dist/`, filled `.env`, generated media, or local deployment credentials.
- Preserve mock mode for frontend-only development.

## Useful Commands

- Install: `npm install`
- Develop: `npm run dev`
- Test: `npm test`
- Lint: `npm run lint`
- Build: `npm run build`
- Preview: `npm run preview`

## Deployment Notes

- See `DEPLOYMENT.md` for Docker and static frontend release checks.
- Default local port in README is `13579`.
