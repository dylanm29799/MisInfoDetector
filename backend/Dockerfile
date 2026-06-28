# Backend image. Includes ffmpeg, which yt-dlp needs to extract audio.
FROM python:3.12-slim

# ffmpeg for audio extraction; build tools not needed thanks to wheels.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Railway/most platforms set $PORT. Default to 8000 locally.
ENV PORT=8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
