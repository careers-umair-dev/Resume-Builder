# Resume Builder — Server

```bash
cp .env.example .env   # set MONGO_URI and a JWT_SECRET of at least 32 characters
npm install
npm run dev
```

Requires Node 18+ and MongoDB. Run the database-free API tests with `npm test`.

## API
| Method | Route | Notes |
|---|---|---|
| POST | /api/auth/register | name, email, password (8+, letter + number) |
| POST | /api/auth/login | returns `{ token, user }` |
| GET | /api/auth/me | Bearer token |
| PUT | /api/auth/profile | name / email / profileImage |
| PUT | /api/auth/password | currentPassword, newPassword; returns a fresh token, old tokens are invalidated |
| GET | /api/resumes/stats | dashboard counts and recently updated resumes |
| GET | /api/resumes/downloads | latest 15 PDF downloads |
| GET | /api/resumes | query: q, template, sort (updated/created/name/completion), order, page, limit |
| POST | /api/resumes | all fields optional; name defaults to "Untitled Resume" |
| GET/PUT/DELETE | /api/resumes/:id | PUT replaces any arrays you send (supports reorder) |
| POST | /api/resumes/:id/duplicate | |
| GET | /api/resumes/:id/pdf | PDF download; `?disposition=inline` for preview |
| POST | /api/resumes/preview | render an unsaved draft to PDF |
| POST | /api/uploads/photo | multipart field `photo`, JPG/PNG up to 5 MB |

Errors: `{ success: false, message, errors?: [{ field, message }] }`.
Logout is client-side (stateless JWT): drop the token.

## PDF export
PDF endpoints return an A4 PDF (`?disposition=inline` for in-browser preview, which does not count as a download).
- Renderer: `services/pdf/` — `templates.js` (data-driven specs), `render.js` (layout engine), `cursor.js` (multi-page flow), `fonts.js`, `text.js`.
- Six templates: modern-professional, minimal-executive, creative-developer (sidebar), elegant-corporate, compact-ats (monochrome, no photo), classic-professional.
- Honors customization: colors, font size, line/section spacing, margins, density, heading and photo style. Font family `auto` uses the template's own font.
- Bundled Inter / Lora / Source Code Pro (SIL OFL) in `assets/fonts`, so Vietnamese and other Latin-extended text renders correctly. Emoji and unsupported scripts are dropped.
- Entries stay together across page breaks, headings are never orphaned, page numbers appear on multi-page resumes, empty optional sections are skipped.
- A resume with no name and no content returns 400 instead of an empty PDF.
- Profile photos are read from `uploads/` (JPG/PNG).

`POST /api/uploads/photo` validates image contents (up to 5 MB) and returns `{ url: "/uploads/<userId>-<random>.<ext>" }`.
Replaced or removed photos are not deleted from disk yet.
