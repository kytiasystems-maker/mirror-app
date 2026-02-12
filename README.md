# DailyCalmAI

Small demo app: React frontend + Express backend. The backend serves the production build from `frontend/build` and exposes a few demo API endpoints used by the frontend.

## What changed

- Frontend API calls were switched from absolute `http://localhost:5000/...` to relative `/api/...`. This lets the production build be served from the same origin as the API. For development you can either run the production backend or enable a dev proxy (instructions below).

## Run locally (PowerShell)

### Backend (serves production build)

Open a terminal in the `backend` folder and run:

```powershell
cd "c:\Users\HP\Desktop\Daily calm AI\backend"
npm install
npm start
```

Then open [http://localhost:5000](http://localhost:5000) in your browser.

### Frontend development (hot reload)

Open a terminal in the `frontend` folder and run:

```powershell
cd "c:\Users\HP\Desktop\Daily calm AI\frontend"
npm install
npm start
```

By default the CRA dev server runs on [http://localhost:3000](http://localhost:3000). Because the frontend now uses relative `/api/...` calls, the dev server won't reach the backend automatically unless you enable a proxy. Two options:

- Recommended: add this line to `frontend/package.json`:


```json
"proxy": "http://localhost:5000"
```

Then `npm start` will proxy `/api` requests to the backend.

- Alternatively, run `npm run build` in `frontend` and let the backend serve the production build (see backend steps above).

## Notes

- Activity is stored in-memory on the backend. For persistence, add a database or file-based storage.
- If you rebuild the frontend (`npm run build`), update `frontend/build` before starting the backend in production.

---

🔧 OpenAI integration (Reflections)

- To enable real AI-generated reflections for premium users, set the environment variable:

  - `OPENAI_API_KEY` (required)
  - `OPENAI_MODEL` (optional, default: `gpt-3.5-turbo`)

- After setting the key, restart the backend in `backend/` with:

```powershell
npm install
node index.js
```

- The backend uses a short timeout (8s) and simple retry logic when calling OpenAI; on failure it falls back to friendly templates so the app remains responsive.

🧪 Testing locally

- A dev premium user is preconfigured for convenience: anon id `uuid` is marked as premium in the backend `users` Map. Use header `X-ANON-ID: uuid` from the frontend (localStorage `anon_id` also defaults to `uuid`) to test premium reflections.

- Non-premium users receive a deterministic but slightly varied fallback reflection each day (stored in `backend/data/reflections.json`).

📝 Reflection endpoint

- `POST /api/ai/reflection` expects JSON `{ "mood": "tired|sad|okay|happy" }` and a header `X-ANON-ID`.
- Daily throttle: one reflection per anon id per day (returns 429 if exceeded).

If you'd like, I can also add an admin toggle endpoint to flip a dev user to premium for testing or add more varied templates/locales.
