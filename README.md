# MisInfo Detector

Paste a link to a social-media video (TikTok, Instagram, YouTube, X). The app:

1. **Downloads** the audio with `yt-dlp`.
2. **Transcribes** it with OpenAI's Whisper API.
3. **Fact-checks** the transcript with GPT-4o using **live web search**, so every
   verdict is backed by real source URLs.
4. **Stores** the result against your account and shows it in a dashboard.

The fact-checker is tuned to be strictly evidence-based and politically neutral
("facts don't have feelings"): it keeps a high bar for calling something false,
marks anything it can't verify as *unverifiable* rather than guessing, and cites
its sources.

```
MisInfoDetector/
├── backend/          FastAPI API + pipeline (download → transcribe → fact-check)
│   └── app/
│       ├── pipeline/ the three steps, linked by runner.py
│       ├── routers/  auth + checks endpoints
│       └── ...
├── frontend/         React + Vite + Tailwind UI
├── index.py          legacy standalone scripts (superseded by backend/app/pipeline)
├── transcribe.py
└── fact_check.py
```

---

## Prerequisites

- **Python 3.12+** and **Node 18+**
- **ffmpeg** (yt-dlp needs it to extract audio)
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `sudo apt install ffmpeg`
- An **OpenAI API key**

---

## Run locally

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env       # then edit .env (see below)
uvicorn app.main:app --reload --port 8000
```

Edit `backend/.env`:

| Variable          | What to put                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| `OPENAI_API_KEY`  | Your OpenAI key.                                                            |
| `JWT_SECRET`      | A long random string. Generate: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `DATABASE_URL`    | **Leave unset for local dev** — it defaults to a SQLite file (`local.db`). For Postgres, see below. |
| `FRONTEND_ORIGINS`| `http://localhost:5173` for local dev.                                      |

Tables are created automatically on startup. Visit
http://127.0.0.1:8000/docs for interactive API docs.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

In dev, Vite proxies `/api` to the backend on port 8000 — no extra config
needed. Sign up, paste a video link, and you're going.

---

## Where do I put the database connection string?

For local development you don't need one — it uses SQLite automatically.

For production, use **Postgres** and set `DATABASE_URL` in the backend's
environment. The string must use the `postgresql+psycopg://` prefix so
SQLAlchemy picks the psycopg 3 driver:

```
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DBNAME
```

> If your provider hands you a URL starting with `postgresql://` (Railway does),
> just change the prefix to `postgresql+psycopg://`. Everything after it stays
> the same.

---

## Deploy (Railway)

Two services from this one repo: the **backend** (Docker) and the **frontend**
(static build). [Render](https://render.com) works the same way if you prefer.

### Backend service

1. New Project → Deploy from repo → set the service **root directory** to
   `backend`. It will build the included `Dockerfile` (which installs ffmpeg).
2. Add the **Postgres** plugin. Railway injects a `DATABASE_URL`.
3. In the backend service **Variables**, set:
   - `OPENAI_API_KEY` — your key
   - `JWT_SECRET` — a long random string
   - `DATABASE_URL` — copy Railway's value but change the prefix to
     `postgresql+psycopg://`
   - `FRONTEND_ORIGINS` — your frontend's URL (fill in after the next step)
4. Deploy. Note the public backend URL (e.g. `https://...up.railway.app`).

### Frontend service

1. New service in the same project → root directory `frontend`.
2. Build command: `npm install && npm run build`. Start command: `npm run start`
   (serves the build on Railway's `$PORT`).
3. Set variable `VITE_API_BASE_URL` to your backend URL from above.
   (Vite inlines this at **build** time, so redeploy the frontend if it changes.)
4. Copy the frontend's public URL back into the backend's `FRONTEND_ORIGINS`
   and redeploy the backend (so CORS allows it).

That's it — open the frontend URL, sign up, and run a check.

---

## Security notes

- **Auth**: email + password; passwords hashed with bcrypt; sessions via signed
  JWTs. Each user can only read their own checks.
- **SQL injection**: all DB access goes through SQLAlchemy's ORM with bound
  parameters — no string-built SQL.
- **Prompt injection**: the transcript is treated strictly as untrusted *data*,
  fenced in a delimiter, and the model is instructed never to follow
  instructions found inside it.
- **SSRF / bad input**: submitted URLs are validated (http/https only, private
  and cloud-metadata addresses blocked) and request bodies are bounded by
  Pydantic schemas.
- **Abuse**: the check endpoint is rate-limited (10/hour per IP); media longer
  than 30 minutes or larger than 25 MB of audio is rejected.

> For higher production traffic, move rate-limiting to a shared store (the
> default limiter is in-memory and per-process).
