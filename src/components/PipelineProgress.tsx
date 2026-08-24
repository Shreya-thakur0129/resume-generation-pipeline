import React from 'react';
import {
  Search,
  Table,
  Sparkles,
  Code2,
  FileCheck2,
  CloudUpload,
  Database,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { PipelineStageId, PipelineStageInfo } from '../types';

interface PipelineProgressProps {
  stages: PipelineStageInfo[];
  onRetryStage?: (stageId: PipelineStageId) => void;
  isRunning: boolean;
  activeCandidateName?: string;
  batchProgress?: { current: number; total: number } | null;
}

const STAGE_ICONS: Record<PipelineStageId, React.ComponentType<{ className?: string }>> = {
  fetch: Search,
  sheet: Table,
  gemini: Sparkles,
  latex: Code2,
  compile: FileCheck2,
  drive: CloudUpload,
  commit: Database,
};

export const PipelineProgress: React.FC<PipelineProgressProps> = ({
  stages,
  onRetryStage,
  isRunning,
  activeCandidateName,
  batchProgress,
}) => {
  return (
    <div className="bg-[#0F1116] border-b border-[#1E2330] px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto">
        {/* Top Status Subhead */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Pipeline Execution Flow
            </span>
            {activeCandidateName && (
              <span className="text-xs bg-[#161B26] text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/50 font-mono truncate max-w-[260px]">
                Target: {activeCandidateName}
              </span>
            )}
          </div>
          {batchProgress && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                Batch Progress: <strong className="text-slate-200">{batchProgress.current} / {batchProgress.total}</strong>
              </span>
              <div className="w-24 bg-[#161B26] rounded-full h-1.5 overflow-hidden border border-[#1E2330]">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                  style={{ width: `${Math.round((batchProgress.current / batchProgress.total) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* 7 Horizontal Stages */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {stages.map((stage, idx) => {
            const Icon = STAGE_ICONS[stage.id] || Sparkles;
            const isLast = idx === stages.length - 1;

            let cardStyles = 'bg-[#131720]/80 border-[#1E2330] text-slate-400 hover:border-[#2A3346]';
            let iconColor = 'text-slate-500';
            let statusBadge = null;

            if (stage.status === 'running') {
              cardStyles = 'bg-cyan-950/30 border-cyan-500/80 text-cyan-200 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-950/50';
              iconColor = 'text-cyan-400 animate-pulse';
              statusBadge = (
                <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  Running
                </span>
              );
            } else if (stage.status === 'success') {
              cardStyles = 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200';
              iconColor = 'text-emerald-400';
              statusBadge = (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {stage.durationMs !== undefined ? `${(stage.durationMs / 1000).toFixed(1)}s` : 'Done'}
                </span>
              );
            } else if (stage.status === 'failed') {
              cardStyles = 'bg-rose-950/30 border-rose-700 text-rose-200 shadow-md shadow-rose-950/50';
              iconColor = 'text-rose-400';
              statusBadge = (
                <span className="flex items-center gap-1 text-[10px] text-rose-400 font-mono">
                  <XCircle className="w-2.5 h-2.5" />
                  Failed
                </span>
              );
            } else if (stage.status === 'skipped') {
              cardStyles = 'bg-[#131720]/40 border-[#1E2330] text-slate-500 opacity-60';
              iconColor = 'text-slate-600';
              statusBadge = (
                <span className="text-[10px] text-slate-500 font-mono">
                  Skipped
                </span>
              );
            } else {
              statusBadge = (
                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  Pending
                </span>
              );
            }

            return (
              <div
                key={stage.id}
                id={`stage-card-${stage.id}`}
                className={`relative rounded-xl border p-2.5 flex flex-col justify-between transition-all ${cardStyles}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    {stage.stepNumber}
                  </span>
                  {statusBadge}
                </div>

                <div className="flex items-center gap-2 my-0.5">
                  <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
                  <span className="text-xs font-bold tracking-tight uppercase truncate">
                    {stage.label}
                  </span>
                </div>

                {stage.status === 'failed' && onRetryStage && !isRunning && (
                  <button
                    type="button"
                    onClick={() => onRetryStage(stage.id)}
                    className="mt-1.5 text-[10px] font-semibold bg-rose-900/60 hover:bg-rose-800 text-rose-200 px-2 py-0.5 rounded flex items-center justify-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Retry Stage
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
