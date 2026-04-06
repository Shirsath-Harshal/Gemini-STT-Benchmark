import { useState, useRef } from 'react';
import axios from 'axios';

export default function AudioRecorder({ onTranscriptionResult, onError, setLoading }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        uploadAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone", err);
      onError("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadAudio(file);
    }
  };

  const uploadAudio = async (audioBlobOrFile) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', audioBlobOrFile, 'audio.webm');

    try {
      // Send to FastAPI
      const response = await axios.post('http://localhost:8000/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      onTranscriptionResult(response.data);
    } catch (err) {
      console.error("Upload error", err);
      onError("An error occurred during transcription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md mx-auto transform transition hover:scale-[1.01]">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Capture Audio</h2>
      
      <div className="flex gap-4">
        {!isRecording ? (
          <button 
            onClick={startRecording}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-medium transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-rose-300"
          >
            <span className="h-3 w-3 rounded-full bg-white animate-pulse"></span>
            Start Recording
          </button>
        ) : (
          <button 
            onClick={stopRecording}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-full font-medium transition-all shadow-md focus:ring-4 focus:ring-gray-300"
          >
            <span className="h-3 w-3 rounded-sm bg-rose-500"></span>
            Stop Recording
          </button>
        )}
      </div>

      <div className="relative flex items-center justify-center w-full">
        <div className="border-t border-gray-200 dark:border-gray-600 w-full" />
        <span className="bg-white dark:bg-gray-800 px-3 text-sm text-gray-500 absolute">OR</span>
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Upload Audio File</label>
        <input 
          type="file" 
          accept="audio/*" 
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200 transition"
        />
      </div>
    </div>
  );
}
