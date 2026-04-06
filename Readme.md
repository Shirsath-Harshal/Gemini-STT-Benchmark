# 🎙️ Gemini Speech-to-Text Benchmark App

A high-performance benchmarking tool to compare transcription accuracy and speed across the Gemini 3.1 model family. This app features real-time audio capture and word-by-word diffing to highlight model discrepancies.

## 🌟 Key Features
* **Three-Way Comparison:** Compare `gemini-1.5-flash`, `gemini-3.1-flash`, and the new `gemini-3.1-flash-live`.
* **Concurrent Processing:** Uses Python `asyncio` to fetch results from all models simultaneously.
* **Visual Diffing:** Word-level highlighting (additions/deletions) using the `diff` npm library.
* **Live Capture:** Built-in `MediaRecorder` integration for instant microphone testing.

---

## 🛠️ Setup & Installation

### 1. Prerequisites
* **Python 3.10+** (Ensure "Add to PATH" is checked during install)
* **Node.js (LTS)**
* **Gemini API Key:** Obtain from [Google AI Studio](https://aistudio.google.com/)

### 2. Backend Configuration (FastAPI)
1.  Navigate to the backend directory:
    ```powershell
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```powershell
    python -m venv venv
    .\venv\Scripts\activate
    ```
3.  Install dependencies:
    ```powershell
    pip install -r requirements.txt
    ```
4.  Configure Environment Variables:
    Create a `.env` file in the `backend` folder:
    ```text
    GOOGLE_API_KEY=your_actual_api_key_here
    ```

### 3. Frontend Configuration (React + Vite)
1.  Open a new terminal and navigate to the frontend directory:
    ```powershell
    cd frontend
    ```
2.  Install packages:
    ```powershell
    npm install
    ```

---

## 🚀 Running the Application

To run the project, you must start **both** servers in separate terminal windows.

### Start Backend
```powershell
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload
