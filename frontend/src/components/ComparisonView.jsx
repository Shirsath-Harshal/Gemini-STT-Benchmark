import { useMemo } from 'react';
import * as Diff from 'diff';

function DiffedText({ oldText, newText }) {
  const diffs = useMemo(() => {
    return Diff.diffWords(oldText || "", newText || "");
  }, [oldText, newText]);

  return (
    <div className="leading-relaxed text-gray-800 dark:text-gray-200">
      {diffs.map((part, index) => {
        let colorClass = "";
        
        // MATCHED WORDS (both in reference and transcription) -> GREEN
        if (!part.added && !part.removed) {
          colorClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-medium px-1 rounded";
        } 
        // MISMATCHED HEADERS (extra words hallucinated or wrong substitutions) -> RED
        else if (part.added) {
          colorClass = "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 px-1 rounded";
        } 
        // MISSED WORDS (in reference but model didn't catch them) -> RED AND CROSSED OUT
        else if (part.removed) {
          colorClass = "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 line-through px-1 rounded opacity-75";
        }

        return (
          <span key={index} className={colorClass}>
            {part.value}
          </span>
        );
      })}
    </div>
  );
}

function calculateAccuracy(referenceText, generatedText) {
  if (!referenceText || !generatedText || generatedText.startsWith("Error")) return null;
  
  const diffs = Diff.diffWords(referenceText.toLowerCase(), generatedText.toLowerCase());
  let correctWords = 0;
  let totalRefWords = 0;
  let generatedWordsLength = generatedText.trim().split(/\s+/).filter(w=>w).length;
  
  diffs.forEach(part => {
    const wordCount = part.value.trim().split(/\s+/).filter(w=>w).length;
    if (!part.added && !part.removed) {
      correctWords += wordCount;
      totalRefWords += wordCount;
    } else if (part.removed) {
      totalRefWords += wordCount;
    }
  });

  if (totalRefWords === 0) return 0;
  
  // Penalize both missing words (recall) and extra words (precision)
  // We use maximum of reference length or generated length as denominator
  const denominator = Math.max(totalRefWords, generatedWordsLength);
  const accuracy = (correctWords / denominator) * 100;
  return Math.round(Math.max(0, accuracy));
}

function AccuracyBadge({ score }) {
  if (score === null) return null;
  
  let color = "bg-green-100 text-green-800 border-green-200";
  if (score < 50) color = "bg-red-100 text-red-800 border-red-200";
  else if (score < 80) color = "bg-yellow-100 text-yellow-800 border-yellow-200";

  return (
    <div className={`ml-auto px-3 py-1 rounded-full text-sm font-bold border ${color}`}>
      {score}% Accuracy
    </div>
  );
}

export default function ComparisonView({ results, referenceText }) {
  if (!results) return null;

  const text2_0 = results.gemini_2_0;
  const text2_5 = results.gemini_2_5;
  const text3_1_lite = results.gemini_3_1_lite;
  const text3_1_live = results.gemini_3_1_live;

  const score1 = calculateAccuracy(referenceText, text2_0);
  const score2 = calculateAccuracy(referenceText, text2_5);
  const score3 = calculateAccuracy(referenceText, text3_1_lite);
  const score4 = calculateAccuracy(referenceText, text3_1_live);

  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full max-w-[95rem] mx-auto">
      {/* 2.0 Flash */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col">
        <div className="flex items-center gap-3 mb-4 border-b pb-4 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Gemini 2.0 Flash</h3>
          <AccuracyBadge score={score1} />
        </div>
        <p className="text-sm text-gray-500 mb-2">{referenceText ? "Diff against Reference" : (text2_0?.startsWith("Error") ? "Raw Transcription (Baseline errored)" : "Baseline Transcription")}</p>
        <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap flex-grow">
          {referenceText ? 
            (text2_0?.startsWith("Error") ? <span className="text-rose-500 font-semibold">{text2_0}</span> : <DiffedText oldText={referenceText} newText={text2_0} />) :
            (text2_0 || <span className="text-gray-400 italic">No output</span>)
          }
        </div>
      </div>

      {/* 2.5 Flash */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col">
        <div className="flex items-center gap-3 mb-4 border-b pb-4 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">2</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Gemini 2.5 Flash</h3>
          <AccuracyBadge score={score2} />
        </div>
        <p className="text-sm text-gray-500 mb-2">{referenceText ? "Diff against Reference" : (text2_0?.startsWith("Error") ? "Raw Transcription (Baseline errored)" : "Diff against 2.0 Flash")}</p>
        <div className="whitespace-pre-wrap flex-grow text-gray-800 dark:text-gray-200 leading-relaxed">
          {text2_5?.startsWith("Error") ? (
            <span className="text-rose-500 font-semibold">{text2_5}</span>
          ) : (!referenceText && text2_0?.startsWith("Error")) ? (
            text2_5 || <span className="text-gray-400 italic">No output</span>
          ) : (
            <DiffedText oldText={referenceText || text2_0} newText={text2_5} />
          )}
        </div>
      </div>

      {/* 3.1 Flash Lite */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col">
        <div className="flex items-center gap-3 mb-4 border-b pb-4 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">3</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Gemini 3.1 Flash Lite</h3>
          <AccuracyBadge score={score3} />
        </div>
        <p className="text-sm text-gray-500 mb-2">{referenceText ? "Diff against Reference" : (text2_5?.startsWith("Error") ? "Raw Transcription (Baseline errored)" : "Diff against 2.5 Flash")}</p>
        <div className="whitespace-pre-wrap flex-grow text-gray-800 dark:text-gray-200 leading-relaxed">
          {text3_1_lite?.startsWith("Error") ? (
            <span className="text-rose-500 font-semibold">{text3_1_lite}</span>
          ) : (!referenceText && text2_5?.startsWith("Error")) ? (
            text3_1_lite || <span className="text-gray-400 italic">No output</span>
          ) : (
            <DiffedText oldText={referenceText || text2_5} newText={text3_1_lite} />
          )}
        </div>
      </div>

      {/* 3.1 Flash Live */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-blue-200 dark:border-blue-800 relative shadow-blue-500/10 flex flex-col">
        <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-bl-xl rounded-tr-xl">Live</div>
        <div className="flex items-center gap-3 mb-4 border-b pb-4 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">4</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Gemini 3.1 Flash Live</h3>
          <AccuracyBadge score={score4} />
        </div>
        <p className="text-sm text-gray-500 mb-2">{referenceText ? "Diff against Reference" : (text3_1_lite?.startsWith("Error") ? "Raw Transcription (Baseline errored)" : "Diff against 3.1 Lite")}</p>
        <div className="whitespace-pre-wrap flex-grow text-gray-800 dark:text-gray-200 leading-relaxed">
          {text3_1_live?.startsWith("Error") ? (
            <span className="text-rose-500 font-semibold">{text3_1_live}</span>
          ) : (!referenceText && text3_1_lite?.startsWith("Error")) ? (
            text3_1_live || <span className="text-gray-400 italic">No output</span>
          ) : (
            <DiffedText oldText={referenceText || text3_1_lite} newText={text3_1_live} />
          )}
        </div>
      </div>
    </div>
  );
}
