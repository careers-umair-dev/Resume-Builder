# Resumify — Intern Resume Builder (MERN)

Create, customize, preview and export professional resumes. React + Tailwind + Framer Motion frontend, Express + MongoDB backend, PDFKit export.

## Run it
Requires Node 18+ and a MongoDB instance.

```bash
# 1. API
cd server && cp .env.example .env     # set MONGO_URI and a 32+ char JWT_SECRET
npm install && npm run dev            # http://localhost:5000

# 2. Web app (second terminal)
cd client && npm install && npm run dev   # http://localhost:5173 (proxies /api and /uploads to :5000)
```

Tests: `cd server && npm test` (12 API tests, no database needed) and `cd client && npm test` (19 UI tests) · lint/build: `cd client && npm run lint && npm run build`.

## How it fits together
- **One renderer for preview and export.** `server/services/pdf/` (PDFKit, six data-driven templates in `templates.js`) produces the PDF. The editor preview calls `POST /api/resumes/preview` with the unsaved draft and draws the result with pdf.js, so what you see is what you download.
- **Autosave.** `client/src/hooks/useAutosave.js` debounces edits, sends only changed top-level fields, and reverts invalid fields to their last saved value so one bad entry never blocks other edits.
- **Config-driven forms.** `client/src/constants/builder.js` defines every entry section once (fields, blanks, titles); the editor UI and validation both read it.
- **Auth.** JWT in `Authorization: Bearer`, bcrypt (cost 12), password change invalidates older tokens, rate-limited auth routes.
- **Command palette.** Press Ctrl/Cmd+K or use the search button to navigate or create a resume.
- **Print.** Print from the live PDF preview; print styles show only the A4 resume pages.

## API
`/api/auth/{register,login,me,profile,password}` · `/api/resumes` (list, create), `/stats`, `/downloads`, `/preview`, `/:id` (get, put, delete), `/:id/duplicate`, `/:id/pdf` · `/api/uploads/photo`. Details in `server/README.md`.

## Deployment notes
- Set `CLIENT_URL` on the API (comma-separated origins allowed), `TRUST_PROXY=1` behind a proxy, and `VITE_API_URL` on the client build.
- `server/uploads/` holds profile and resume photos (up to 5 MB each) on local disk. Use a persistent volume, or swap the upload controller for object storage. Replaced or removed photos are not deleted yet.
- The client is static (`npm run build` → `client/dist`) and can be hosted on Vercel/Netlify with an SPA fallback to `index.html`. The API needs a Node host with PDFKit and write access to `uploads/`.

## Honest status
Verified here: 12 server API tests, 19 client UI tests, production build, lint, and PDF output for all six templates.
Not verified end-to-end here: real MongoDB-backed user flows, printed output from a browser, fullscreen preview, and drag-and-drop by touch. Please smoke-test these before relying on them.
Not built: resume sharing links, photo cleanup, email flows (password reset).
