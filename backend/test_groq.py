import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    print("ERROR: GROQ_API_KEY not found in .env")
    exit()

client = Groq(api_key=api_key)

try:
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "user",
                "content": "Hello Groq! Are you working?"
            }
        ]
    )

    print("\nSUCCESS! Groq API is working.")
    print(response.choices[0].message.content)

except Exception as e:
    print("\nGROQ API ERROR:")
    print(str(e))