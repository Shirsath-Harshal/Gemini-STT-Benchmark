import { useState } from 'react';
import AudioRecorder from './components/AudioRecorder';
import ComparisonView from './components/ComparisonView';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [referenceText, setReferenceText] = useState("");

  const handleResult = (data) => {
    setResults(data);
    setError(null);
  };

  const handleError = (errMsg) => {
    setError(errMsg);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 selection:bg-rose-200 dark:selection:bg-rose-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-rose-500/30">
              G
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              Gemini STT Benchmark
            </h1>
          </div>
          <div className="text-sm text-gray-500 font-medium bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            Compare Models
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            Evaluate Speech-to-Text Accuracy
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Record from your microphone or upload an audio file to simultaneously benchmark Gemini 2.0 Flash, Gemini 2.5 Flash, Gemini 3.1 Flash Lite, and Gemini 3.1 Flash Live.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ground Truth Text (Optional)</label>
          <textarea 
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none transition-shadow"
            rows="2"
            placeholder="Type exactly what you expect the audio to say to compute precise accuracy scores..."
            value={referenceText}
            onChange={e => setReferenceText(e.target.value)}
          />
        </div>

        <AudioRecorder 
          onTranscriptionResult={handleResult} 
          onError={handleError}
          setLoading={setLoading}
        />

        {error && (
          <div className="mt-8 max-w-md mx-auto bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-center justify-center">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-16 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">
              Processing audio concurrently across 3 models...
            </p>
          </div>
        )}

        {!loading && <ComparisonView results={results} referenceText={referenceText} />}

      </main>
    </div>
  );
}

export default App;
