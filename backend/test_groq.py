import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv(override=True)

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY not found in .env")

model = "openai/gpt-oss-120b"

client = Groq(api_key=api_key)

try:
    print(f"Testing Groq model: {model}")

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "user",
                "content": "Hello! Introduce yourself."
            }
        ]
    )

    print("\nSUCCESS! Groq API is working.")
    print(response.choices[0].message.content)

except Exception as e:
    print("\nGROQ API ERROR:")
    print(str(e))