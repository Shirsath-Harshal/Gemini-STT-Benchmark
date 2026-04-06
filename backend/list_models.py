import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(override=True)
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

print("Available models:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        if 'flash' in m.name.lower():
            print(m.name)
