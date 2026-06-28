"""Links the three steps into one pipeline: URL -> transcript -> fact-check."""
import os
import shutil
from dataclasses import dataclass

from .download import DownloadError, download_audio
from .fact_check import FactCheckError, fact_check
from .transcribe import TranscriptionError, transcribe_audio


class PipelineError(Exception):
    """User-facing pipeline failure with a safe message."""


@dataclass
class PipelineResult:
    title: str
    transcript: str
    result: dict  # structured fact-check output


def run_pipeline(url: str) -> PipelineResult:
    audio_path: str | None = None
    try:
        audio_path, title = download_audio(url)
        transcript = transcribe_audio(audio_path)
        result = fact_check(transcript)
        return PipelineResult(title=title, transcript=transcript, result=result)
    except (DownloadError, TranscriptionError, FactCheckError) as exc:
        raise PipelineError(str(exc)) from exc
    finally:
        # Always clean up the temp download directory.
        if audio_path:
            tmp_dir = os.path.dirname(audio_path)
            shutil.rmtree(tmp_dir, ignore_errors=True)
