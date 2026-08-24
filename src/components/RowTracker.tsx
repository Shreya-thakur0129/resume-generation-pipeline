import React, { useState } from 'react';
import {
  Table,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  FileText,
  ExternalLink,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  Download,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { CandidateRawData, GeneratedResumeRecord } from '../types';

interface RowTrackerProps {
  candidates: CandidateRawData[];
  records: Record<number, GeneratedResumeRecord>;
  selectedRows: number[];
  onToggleSelectRow: (rowNumber: number) => void;
  onSelectAllRows: (select: boolean) => void;
  onRunCandidate: (candidate: CandidateRawData) => void;
  onViewResume: (record: GeneratedResumeRecord) => void;
  onInspectCandidate: (candidate: CandidateRawData) => void;
  isRunning: boolean;
  activeRowNumber?: number;
}

export const RowTracker: React.FC<RowTrackerProps> = ({
  candidates,
  records,
  selectedRows,
  onToggleSelectRow,
  onSelectAllRows,
  onRunCandidate,
  onViewResume,
  onInspectCandidate,
  isRunning,
  activeRowNumber,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredCandidates = candidates.filter((c) => {
    const record = records[c.rowNumber];
    const effectiveStatus = record?.status || c.status || 'READY';
    
    if (statusFilter !== 'ALL' && effectiveStatus !== statusFilter) return false;
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.candidateId.toLowerCase().includes(term) ||
      (c.skills && c.skills.toLowerCase().includes(term))
    );
  });

  const allSelected =
    filteredCandidates.length > 0 &&
    filteredCandidates.every((c) => selectedRows.includes(c.rowNumber));

  return (
    <div className="bg-[#0F1116] rounded-xl border border-[#1E2330] shadow-2xl overflow-hidden">
      {/* Table Header Controls */}
      <div className="bg-[#131720] border-b border-[#1E2330] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-bold text-white tracking-tight">
            Worksheet Candidate Rows
          </span>
          <span className="text-xs font-mono bg-[#181D28] text-slate-300 px-2 py-0.5 rounded-md border border-[#1E2330]">
            {filteredCandidates.length} of {candidates.length} rows
          </span>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="tracker-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate name, email, skills..."
              className="bg-[#0A0B0E] border border-[#1E2330] rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-48 sm:w-64 placeholder:text-slate-600"
            />
          </div>

          <select
            id="tracker-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0A0B0E] border border-[#1E2330] rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="READY">Ready / Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#0A0B0E]/60 border-b border-[#1E2330] text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3 w-10 text-center">
                <button
                  type="button"
                  id="select-all-rows-btn"
                  onClick={() => onSelectAllRows(!allSelected)}
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-2.5 px-3 w-16">Row</th>
              <th className="py-2.5 px-4 min-w-[200px]">Candidate Details</th>
              <th className="py-2.5 px-4 min-w-[150px]">Target Role / Domain</th>
              <th className="py-2.5 px-3 w-28">Status</th>
              <th className="py-2.5 px-3 text-center min-w-[180px]">Pipeline Stages</th>
              <th className="py-2.5 px-3 w-32">Generated At</th>
              <th className="py-2.5 px-4 text-right min-w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2330] font-sans">
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No candidates match the current filters. Check configuration or import spreadsheet.
                </td>
              </tr>
            ) : (
              filteredCandidates.map((candidate) => {
                const record = records[candidate.rowNumber];
                const isSelected = selectedRows.includes(candidate.rowNumber);
                const isCurrentActive = activeRowNumber === candidate.rowNumber;
                const status = record?.status || candidate.status || 'READY';

                let statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#131720] text-slate-400 border border-[#1E2330]">
                    <Clock className="w-2.5 h-2.5" /> Ready
                  </span>
                );

                if (isCurrentActive && isRunning) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-700 animate-pulse">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Processing
                    </span>
                  );
                } else if (status === 'COMPLETED') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Completed
                    </span>
                  );
                } else if (status === 'FAILED') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-800">
                      <XCircle className="w-2.5 h-2.5" /> Failed
                    </span>
                  );
                }

                // Stage indicators
                const stages = [
                  { label: 'Gemini', ok: record?.stagesCompleted?.gemini || status === 'COMPLETED' },
                  { label: 'LaTeX', ok: record?.stagesCompleted?.latex || status === 'COMPLETED' },
                  { label: 'PDF', ok: record?.stagesCompleted?.pdf || status === 'COMPLETED' },
                  { label: 'Drive', ok: record?.stagesCompleted?.drive || status === 'COMPLETED' },
                  { label: 'Sheets', ok: record?.stagesCompleted?.sheets || status === 'COMPLETED' },
                ];

                return (
                  <tr
                    key={candidate.rowNumber}
                    id={`candidate-row-${candidate.rowNumber}`}
                    className={`hover:bg-[#131720]/70 transition-colors ${
                      isCurrentActive ? 'bg-cyan-950/20' : isSelected ? 'bg-[#131720]/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleSelectRow(candidate.rowNumber)}
                        className="text-slate-400 hover:text-cyan-400"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Row # */}
                    <td className="py-3 px-3 font-mono text-slate-500 font-semibold">
                      #{candidate.rowNumber}
                    </td>

                    {/* Candidate Details */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <span>{candidate.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-[#131720] px-1.5 py-0.2 rounded border border-[#1E2330]">
                          {candidate.candidateId}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">{candidate.email}</div>
                      {candidate.location && (
                        <div className="text-slate-500 text-[10px]">{candidate.location}</div>
                      )}
                    </td>

                    {/* Target Role */}
                    <td className="py-3 px-4">
                      <div className="text-slate-300 text-[11px] font-medium truncate max-w-[200px]">
                        {record?.targetRole || (candidate.jobDescription ? 'Target Cloud Engineer' : 'General Engineering')}
                      </div>
                      {candidate.skills && (
                        <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                          {candidate.skills.split('\n')[0]}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">{statusBadge}</td>

                    {/* Stages Indicators */}
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1.5 font-mono text-[10px]">
                        {stages.map((s, i) => (
                          <span
                            key={i}
                            className={`px-1.5 py-0.5 rounded border ${
                              s.ok
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                                : 'bg-[#131720] text-slate-600 border-[#1E2330]'
                            }`}
                            title={`${s.label}: ${s.ok ? 'Completed' : 'Pending'}`}
                          >
                            {s.label[0]}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Generated Timestamp */}
                    <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                      {record?.generatedAt || candidate.generatedAt || '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onInspectCandidate(candidate)}
                          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#181D28] transition-colors"
                          title="Inspect raw data & mapped fields"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {record?.status === 'COMPLETED' ? (
                          <button
                            type="button"
                            onClick={() => onViewResume(record)}
                            className="bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            title="View Resume Preview & ATS Score"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onRunCandidate(candidate)}
                            disabled={isRunning}
                            className="bg-[#181D28] hover:bg-cyan-600 text-slate-200 hover:text-white px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-40 border border-[#1E2330]"
                            title="Run pipeline for this candidate"
                          >
                            <Play className="w-3 h-3" />
                            <span>Run</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
