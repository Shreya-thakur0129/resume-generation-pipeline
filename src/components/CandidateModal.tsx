import React from 'react';
import { X, Play, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, FileCode2, ExternalLink } from 'lucide-react';
import { CandidateRawData } from '../types';

interface CandidateModalProps {
  candidate: CandidateRawData | null;
  onClose: () => void;
  onRunCandidate: (candidate: CandidateRawData) => void;
  isRunning: boolean;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({
  candidate,
  onClose,
  onRunCandidate,
  isRunning,
}) => {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F1116] border border-[#1E2330] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-[#131720] px-5 py-4 border-b border-[#1E2330] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400 font-bold">
              {candidate.name[0]}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{candidate.name}</span>
                <span className="text-xs font-mono bg-[#181D28] text-slate-400 px-2 py-0.5 rounded border border-[#1E2330]">
                  {candidate.candidateId} (Row #{candidate.rowNumber})
                </span>
              </h3>
              <p className="text-xs text-slate-400">{candidate.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#181D28] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Quick Contact Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#131720] p-3 rounded-lg border border-[#1E2330]">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Phone</span>
              <div className="text-slate-200 font-medium">{candidate.phone || '—'}</div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Location</span>
              <div className="text-slate-200 font-medium">{candidate.location || '—'}</div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Status</span>
              <div className="text-cyan-400 font-medium">{candidate.status || 'READY'}</div>
            </div>
          </div>

          {/* Professional Summary */}
          {candidate.summary && (
            <div>
              <h4 className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Professional Summary
              </h4>
              <p className="bg-[#0A0B0E] p-3 rounded-lg border border-[#1E2330] leading-relaxed text-slate-300">
                {candidate.summary}
              </p>
            </div>
          )}

          {/* Skills */}
          {candidate.skills && (
            <div>
              <h4 className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5" /> Technical Skills
              </h4>
              <pre className="bg-[#0A0B0E] p-3 rounded-lg border border-[#1E2330] font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                {candidate.skills}
              </pre>
            </div>
          )}

          {/* Experience */}
          {candidate.experience && (
            <div>
              <h4 className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Work Experience
              </h4>
              <pre className="bg-[#0A0B0E] p-3 rounded-lg border border-[#1E2330] font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                {candidate.experience}
              </pre>
            </div>
          )}

          {/* Projects */}
          {candidate.projects && (
            <div>
              <h4 className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5" /> Key Projects
              </h4>
              <pre className="bg-[#0A0B0E] p-3 rounded-lg border border-[#1E2330] font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                {candidate.projects}
              </pre>
            </div>
          )}

          {/* Education */}
          {candidate.education && (
            <div>
              <h4 className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> Education
              </h4>
              <pre className="bg-[#0A0B0E] p-3 rounded-lg border border-[#1E2330] font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                {candidate.education}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#131720] px-5 py-3 border-t border-[#1E2330] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            id="modal-run-candidate-btn"
            onClick={() => {
              onClose();
              onRunCandidate(candidate);
            }}
            disabled={isRunning}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-950/40 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Pipeline for this Candidate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
