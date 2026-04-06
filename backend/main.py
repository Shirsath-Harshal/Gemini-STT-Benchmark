import os
import asyncio
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(override=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure the SDK
api_key = os.environ.get("GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("WARNING: GEMINI_API_KEY not found in generic environment.")

async def transcribe_with_model(model_id: str, audio_data: bytes, mime_type: str) -> str:
    try:
        model = genai.GenerativeModel(model_id)
        # Using generate_content_async to process the audio concurrently
        response = await model.generate_content_async([
            "Provide an accurate transcript of the following audio. Output only the exact transcript.",
            {
                "mime_type": mime_type,
                "data": audio_data
            }
        ])
        return response.text.strip()
    except Exception as e:
        err_str = str(e)
        if "429" in err_str and "limit: 0" in err_str:
            return "Error 429: This model is not available in your Free Tier quota (Limit is 0)."
        elif "429" in err_str:
            return "Error 429: Rate limit exceeded. Try pacing your requests."
        # Truncate giant error stacks to be readable
        return f"Error: {err_str.split(':', 1)[0]}..." if len(err_str) > 100 else f"Error: {err_str}"

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    audio_data = await file.read()
    # The browser MediaRecorder often uses audio/webm or audio/ogg
    mime_type = file.content_type or "audio/wav"
    
    # Models to benchmark
    models = [
        "gemini-2.0-flash", 
        "gemini-2.5-flash", 
        "gemini-3.1-flash-lite-preview",
        "gemini-3-flash-preview" # Replaces the 404 gemini-3.1-flash-live
    ]
    
    # Launch concurrent API calls
    tasks = [transcribe_with_model(m, audio_data, mime_type) for m in models]
    results = await asyncio.gather(*tasks)
    
    return {
        "gemini_2_0": results[0],
        "gemini_2_5": results[1],
        "gemini_3_1_lite": results[2],
        "gemini_3_1_live": results[3]
    }
