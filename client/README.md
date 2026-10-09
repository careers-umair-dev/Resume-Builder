# Resume Builder — Client

```bash
cp .env.example .env   # optional in dev
npm install
npm run dev            # http://localhost:5173 (proxies /api and /uploads to http://localhost:5000)
```
Start the server first (`cd ../server && npm run dev`).

Implemented: landing page, login/register (validation + server field errors), persistent sessions, protected routes,
dark mode, toasts, 404 / unauthorized / network-error states, lazy-loaded routes.
Dashboard: stats, search, sort, template filter, grid/list view, pagination, create, rename, duplicate, delete (confirm), PDF preview and download, notifications.

Builder (`/resumes/:id/edit`) — split editor + server-rendered PDF preview, config-driven section forms
(`constants/builder.js`), drag-and-drop (dnd-kit), undo/redo, debounced autosave (`hooks/useAutosave.js`), photo upload.

Live preview renders the real server PDF with pdf.js (`components/preview/`, `hooks/usePdfDocument.js`) with zoom, fit and fullscreen;
template picker with live thumbnails; Design tab (`components/builder/DesignPanel.jsx`) with presets and reset.
Use Ctrl/Cmd+K or the search button to open the command palette for navigation and resume creation. The live preview's print action prints only the A4 resume pages.
