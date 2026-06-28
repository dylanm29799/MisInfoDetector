"""Step 2 — transcribe the downloaded audio with OpenAI's Whisper API.

Hosted transcription means no local model/GPU is required, so this runs fine
on a small server. For best accuracy we let Whisper auto-detect the language.
"""
import os

from openai import OpenAI

from ..config import get_settings

settings = get_settings()
_client = OpenAI(api_key=settings.openai_api_key)

# OpenAI's audio endpoint accepts files up to 25 MB.
MAX_BYTES = 25 * 1024 * 1024


class TranscriptionError(Exception):
    pass


def transcribe_audio(audio_path: str) -> str:
    size = os.path.getsize(audio_path)
    if size > MAX_BYTES:
        raise TranscriptionError(
            "Audio is too large to transcribe (over 25 MB). Try a shorter clip."
        )

    try:
        with open(audio_path, "rb") as f:
            result = _client.audio.transcriptions.create(
                model=settings.transcription_model,
                file=f,
                response_format="text",
                temperature=0,  # deterministic, most faithful transcript
            )
    except Exception as exc:
        raise TranscriptionError(f"Transcription failed: {exc}") from exc

    text = result if isinstance(result, str) else getattr(result, "text", "")
    text = (text or "").strip()
    if not text:
        raise TranscriptionError("Transcription returned no text.")
    return text
