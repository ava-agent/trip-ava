# Trip-AVA Deployment Notes

## Current Status

- Repository: `ava-agent/trip-ava`
- App type: Vite static frontend
- Deployment materials: `Dockerfile`, `nginx.conf`
- Backend dependency: `trip-ava-aigc`

## Local Validation

```bash
npm install
npm test
npm run lint
npm run build
```

## Deployment Checklist

- Set `VITE_API_BASE_URL` for the target backend.
- Keep `VITE_USE_MOCK_API=true` for isolated frontend QA; set it to `false` only when backend is ready.
- Verify chat, voice input, mock mode, and responsive layout before publishing.
- Build Docker image with `docker build -t trip-ava .` and smoke test the container on port `13579`.
