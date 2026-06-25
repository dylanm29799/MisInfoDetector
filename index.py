import os
from yt_dlp import YoutubeDL

def download_video_audio(url, output_dir="downloads"):
    os.makedirs(output_dir, exist_ok=True)
    video_output = os.path.join(output_dir, "%(title)s.%(ext)s")

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': video_output,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'quiet': False
    }

    with YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(url, download=True)
        title = info_dict.get('title', 'audio')
        mp3_filename = f"{title}.mp3"
        mp3_path = os.path.join(output_dir, mp3_filename)
        return mp3_path

if __name__ == "__main__":
    url = input("Paste TikTok/Twitter/Instagram video URL: ")
    audio_file = download_video_audio(url)
    print(f"Audio saved to: {audio_file}")