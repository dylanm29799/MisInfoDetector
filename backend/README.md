# MisInfoDetector Backend

FastAPI backend for transcript capture, fact checking, and user accounts.

## Local setup

1. Copy `.env.example` to `.env`
2. Fill in `OPENAI_API_KEY` and `JWT_SECRET`
3. Leave `DATABASE_URL` unset for local SQLite, or set it to Postgres
4. Run the app with `uvicorn app.main:app --reload`

## Railway setup

1. Create a Railway project from this repo
2. Add a Railway Postgres plugin
3. Set the service variables from `.env.example`
4. Leave `DATABASE_URL` as the Railway value, or paste it in directly
5. Deploy with the included `Dockerfile`

The backend now normalizes Railway-style `postgres://` and `postgresql://`
URLs to the SQLAlchemy `postgresql+psycopg://` format automatically.

## Database

The app creates tables on startup through SQLAlchemy metadata. That keeps the
deployment simple for Railway. If you want migrations later, we can add Alembic
next.
