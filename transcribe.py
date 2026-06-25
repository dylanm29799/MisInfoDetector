import whisper

def transcribe(audio_path):
    model = whisper.load_model("base")  # change to 'tiny' for faster but less accurate
    result = model.transcribe(audio_path)
    return result["text"]

if __name__ == "__main__":
    audio_file = input("Enter path to mp3 file: ")
    transcription = transcribe(audio_file)
    print("\nTranscription:\n", transcription)