"""Step 1 — download the audio track from a social media URL with yt-dlp.

Requires ffmpeg to be installed on the host (used to extract/convert audio).
"""
import os
import tempfile

from yt_dlp import YoutubeDL


class DownloadError(Exception):
    pass


def download_audio(url: str) -> tuple[str, str]:
    """Download the best audio for ``url`` and return (mp3_path, title).

    The file is written to a fresh temp directory; the caller is responsible
    for cleaning it up.
    """
    tmp_dir = tempfile.mkdtemp(prefix="misinfo_")
    outtmpl = os.path.join(tmp_dir, "audio.%(ext)s")

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": outtmpl,
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        # Cap absurdly long media so a bad link can't run forever / blow costs.
        "match_filter": _duration_limit(max_seconds=60 * 30),  # 30 min
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ],
    }

    # Instagram (and some TikTok) posts require authentication.
    # Pull cookies from whichever browser the user has installed, trying
    # common macOS browsers in order.
    _inject_browser_cookies(ydl_opts, url)

    try:
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
    except Exception as exc:  # yt-dlp raises many subclasses
        raise DownloadError(f"Could not download media: {exc}") from exc

    title = (info or {}).get("title") or "Untitled"
    mp3_path = os.path.join(tmp_dir, "audio.mp3")
    if not os.path.exists(mp3_path):
        # Fall back to whatever single file landed in the temp dir.
        files = [f for f in os.listdir(tmp_dir) if f.startswith("audio.")]
        if not files:
            raise DownloadError("Download produced no audio file.")
        mp3_path = os.path.join(tmp_dir, files[0])

    return mp3_path, title


_COOKIE_HOSTS = ("instagram.com", "tiktok.com", "x.com", "twitter.com")
_BROWSERS = ("safari", "chrome", "firefox", "chromium", "edge")


def _inject_browser_cookies(opts: dict, url: str) -> None:
    """Add cookiesfrombrowser if the URL is a platform that needs auth."""
    if not any(h in url for h in _COOKIE_HOSTS):
        return
    import subprocess
    for browser in _BROWSERS:
        try:
            # Check if the browser binary/app exists before telling yt-dlp to
            # use it — avoids a confusing error if the browser isn't installed.
            result = subprocess.run(
                ["mdfind", f"kMDItemCFBundleIdentifier == '*{browser}*'"],
                capture_output=True, timeout=2,
            )
            if result.returncode == 0 and result.stdout.strip():
                opts["cookiesfrombrowser"] = (browser,)
                return
        except Exception:
            continue
    # Safari is always present on macOS; fall back to it unconditionally.
    opts["cookiesfrombrowser"] = ("safari",)


def _duration_limit(max_seconds: int):
    def _filter(info_dict, *, incomplete=False):
        duration = info_dict.get("duration")
        if duration and duration > max_seconds:
            return f"Media is longer than {max_seconds // 60} minutes."
        return None

    return _filter
