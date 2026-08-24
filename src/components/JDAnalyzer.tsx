import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Upload,
  FileText,
  CheckCircle2,
  ListFilter,
  Tag,
  Briefcase,
  Layers,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { JobDescriptionAnalysis } from '../types';
import { requestJobDescriptionAnalysis } from '../services/geminiService';
import { VoiceAudioRecorder, transcribeAudioVoice } from '../services/audioService';

interface JDAnalyzerProps {
  currentJd: string;
  onChangeJd: (jd: string) => void;
  analysis: JobDescriptionAnalysis | null;
  onAnalysisComplete: (analysis: JobDescriptionAnalysis) => void;
  isDemoMode: boolean;
}

export const JDAnalyzer: React.FC<JDAnalyzerProps> = ({
  currentJd,
  onChangeJd,
  analysis,
  onAnalysisComplete,
  isDemoMode,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<VoiceAudioRecorder | null>(null);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartRecording = async () => {
    try {
      setErrorMessage(null);
      const recorder = new VoiceAudioRecorder();
      await recorder.startRecording();
      recorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to start microphone recording.');
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current) return;
    clearInterval(timerRef.current);
    setIsRecording(false);
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const { audioBase64, mimeType } = await recorderRef.current.stopRecording();
      const transcript = await transcribeAudioVoice(audioBase64, mimeType, isDemoMode);
      
      const newJd = currentJd ? `${currentJd}\n\n[Voice Notes]: ${transcript}` : transcript;
      onChangeJd(newJd);

      // Trigger analysis automatically
      const result = await requestJobDescriptionAnalysis(newJd, isDemoMode);
      onAnalysisComplete(result);
    } catch (err: any) {
      setErrorMessage(`Voice transcription error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        onChangeJd(content);
      }
    };
    reader.readAsText(file);
  };

  const handleRunAnalysis = async () => {
    if (!currentJd.trim()) {
      setErrorMessage('Please enter or paste a Job Description first.');
      return;
    }
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const result = await requestJobDescriptionAnalysis(currentJd, isDemoMode);
      onAnalysisComplete(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze Job Description.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Voice Recorder Box */}
      <div className="bg-[#0F1116] rounded-xl border border-[#1E2330] p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              Target Job Description & ATS Intelligence
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Paste target JD, upload text document, or dictate requirements with microphone for Gemini AI speech-to-text.
            </p>
          </div>

          {/* Action controls */}
          <div className="flex items-center gap-2">
            {/* Microphone Dictate Button */}
            {isRecording ? (
              <button
                type="button"
                id="voice-dictate-stop-btn"
                onClick={handleStopRecording}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-rose-950/60 animate-pulse"
              >
                <MicOff className="w-3.5 h-3.5" />
                <span>Stop Recording ({recordingSeconds}s)</span>
              </button>
            ) : (
              <button
                type="button"
                id="voice-dictate-start-btn"
                onClick={handleStartRecording}
                className="bg-[#131720] hover:bg-[#181D28] text-cyan-300 border border-cyan-800/60 font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
                title="Dictate requirements with Microphone"
              >
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                <span>Voice Input</span>
              </button>
            )}

            {/* File Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md"
              className="hidden"
            />
            <button
              type="button"
              id="upload-jd-file-btn"
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#131720] hover:bg-[#181D28] text-slate-300 border border-[#1E2330] font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload .txt</span>
            </button>

            {/* Analyze Button */}
            <button
              type="button"
              id="analyze-jd-btn"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !currentJd.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-cyan-950/40"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Analyze with Gemini</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs px-3.5 py-2 rounded-lg mb-3">
            {errorMessage}
          </div>
        )}

        {/* Text Area */}
        <textarea
          id="jd-input-textarea"
          value={currentJd}
          onChange={(e) => onChangeJd(e.target.value)}
          placeholder="Paste complete Job Description text here (including role title, responsibilities, required technical skills, qualifications)..."
          rows={7}
          className="w-full bg-[#0A0B0E] border border-[#1E2330] rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed placeholder:text-slate-600 resize-y"
        />
      </div>

      {/* Structured Gemini Extraction Results */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Role & Seniority Card */}
          <div className="bg-[#0F1116] rounded-xl border border-[#1E2330] p-4 shadow-xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
              Role Specification
            </span>
            <h4 className="text-sm font-bold text-white">{analysis.roleTitle}</h4>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                {analysis.seniority}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-[#131720] text-slate-300 border border-[#1E2330] truncate">
                {analysis.domain}
              </span>
            </div>
          </div>

          {/* Required Skills Card */}
          <div className="bg-[#0F1116] rounded-xl border border-[#1E2330] p-4 shadow-xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1 flex items-center justify-between">
              <span>Required Skills</span>
              <span className="text-cyan-400 font-mono">({analysis.requiredSkills.length})</span>
            </span>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
              {analysis.requiredSkills.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-950/70 text-indigo-300 border border-indigo-800/80">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Key Technologies Card */}
          <div className="bg-[#0F1116] rounded-xl border border-[#1E2330] p-4 shadow-xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1 flex items-center justify-between">
              <span>Key Technologies</span>
              <span className="text-cyan-400 font-mono">({analysis.technologies.length})</span>
            </span>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
              {analysis.technologies.map((t, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/70 text-cyan-300 border border-cyan-800/80">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ATS Terminology Card */}
          <div className="bg-[#0F1116] rounded-xl border border-[#1E2330] p-4 shadow-xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1 flex items-center justify-between">
              <span>ATS Terminology</span>
              <span className="text-emerald-400 font-mono">({analysis.atsTerminology.length})</span>
            </span>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
              {analysis.atsTerminology.map((k, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-800/80">
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
