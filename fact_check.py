import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

if not os.environ.get("OPENAI_API_KEY"):
    raise RuntimeError(
        "OPENAI_API_KEY is not set. Add it to a .env file in the project root, "
        "e.g.\n\nOPENAI_API_KEY=sk-...\n"
    )

client = OpenAI()

def check_misinformation(transcript):
    prompt = f"""
You are an AI fact-checker. Below is a transcript from a social media video:

\"\"\"
{transcript}
\"\"\"

Please:
1. Identify any misinformation or false claims.
2. Explain why they are incorrect or misleading.
3. Provide factual corrections or better sources if possible.
4. Please dont be too liberal with your corrections, only correct if you are very sure that the information is incorrect.
"""

    response = client.chat.completions.create(
        model="gpt-4o",  # or "gpt-3.5-turbo"
        messages=[
            {"role": "system", "content": "You are an expert fact-checker."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1000,
        temperature=0
    )
    return response.choices[0].message.content

if __name__ == "__main__":
    transcript = input("Paste transcript text here:\n")
    result = check_misinformation(transcript)
    print("\n--- Fact Check Result ---\n")
    print(result)
