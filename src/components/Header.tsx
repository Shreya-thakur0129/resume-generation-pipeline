import React from 'react';
import {
  Play,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  RefreshCw,
  Sliders,
  Terminal,
  FileText,
  UserCheck,
  LogOut,
  FolderSync,
  Mic,
  Users,
} from 'lucide-react';
import { PipelineOverallState } from '../types';

interface HeaderProps {
  overallState: PipelineOverallState;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onRunPipeline: (mode: 'single' | 'selected' | 'all') => void;
  isRunning: boolean;
  onCancelPipeline: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userEmail: string | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isAuthLoading: boolean;
  candidateCount: number;
  selectedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  overallState,
  isDemoMode,
  onToggleDemoMode,
  onRunPipeline,
  isRunning,
  onCancelPipeline,
  activeTab,
  onSelectTab,
  userEmail,
  onSignIn,
  onSignOut,
  isAuthLoading,
  candidateCount,
  selectedCount,
}) => {
  const [runDropdownOpen, setRunDropdownOpen] = React.useState(false);

  const getStatusBadge = () => {
    switch (overallState) {
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          Pipeline Ready
        </span>;
      case 'FAILED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-950/70 text-rose-300 border border-rose-800/80">
          Pipeline Error
        </span>;
      case 'IDLE':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#131720] text-slate-400 border border-[#1E2330]">
          Idle
        </span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/80 animate-pulse">
          <RefreshCw className="w-3 h-3 animate-spin" />
          {overallState.replace(/_/g, ' ')}
        </span>;
    }
  };

  return (
    <header className="bg-[#0F1116] border-b border-[#1E2330] sticky top-0 z-40">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Branding & Version */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-950/40">
            <div className="w-full h-full bg-[#0F1116] rounded-[6px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Resume Generation Pipeline
              </h1>
              <span className="text-xs font-mono font-medium bg-[#161B26] text-cyan-400 border border-cyan-800/50 px-2 py-0.5 rounded">
                v1.0.0
              </span>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Automated AI resume compilation using Gemini and Google Workspace integrations.
            </p>
          </div>
        </div>

        {/* Right Side Actions & Authentication */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo Mode Toggle */}
          <button
            type="button"
            id="demo-mode-toggle-btn"
            onClick={onToggleDemoMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              isDemoMode
                ? 'bg-amber-950/50 text-amber-300 border-amber-700/80 shadow-sm shadow-amber-950'
                : 'bg-[#131720] text-slate-400 border-[#1E2330] hover:text-slate-200'
            }`}
            title={isDemoMode ? 'Demo Mode Active (simulated sample dataset)' : 'Switch to Demo Mode'}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isDemoMode ? 'DEMO MODE (Active)' : 'Demo Mode'}
          </button>

          {/* Google OAuth Status / Sign In */}
          {userEmail ? (
            <div className="flex items-center gap-2 bg-[#131720] border border-[#1E2330] rounded-lg px-2.5 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-xs text-slate-300 font-mono hidden md:inline truncate max-w-[140px]">
                {userEmail}
              </span>
              <button
                type="button"
                id="sign-out-btn"
                onClick={onSignOut}
                className="text-slate-400 hover:text-rose-400 transition-colors p-0.5"
                title="Sign out of Google Workspace"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="google-signin-btn"
              onClick={onSignIn}
              disabled={isAuthLoading}
              className="gsi-material-button text-xs bg-[#131720] hover:bg-[#181D28] text-slate-200 border border-[#1E2330] px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>{isAuthLoading ? 'Connecting...' : 'Connect Google'}</span>
            </button>
          )}

          {/* Primary Action Button: RUN PIPELINE */}
          {isRunning ? (
            <button
              type="button"
              id="cancel-pipeline-btn"
              onClick={onCancelPipeline}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-rose-950"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Cancel Execution
            </button>
          ) : (
            <div className="relative">
              <div className="flex rounded-lg shadow-md shadow-cyan-950/40 overflow-hidden border border-cyan-500/40">
                <button
                  type="button"
                  id="run-pipeline-primary-btn"
                  onClick={() => onRunPipeline(selectedCount > 0 ? 'selected' : 'single')}
                  className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2 flex items-center gap-2 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {selectedCount > 0
                      ? `RUN PIPELINE (${selectedCount} Selected)`
                      : 'RUN PIPELINE'}
                  </span>
                </button>
                <button
                  type="button"
                  id="run-pipeline-dropdown-btn"
                  onClick={() => setRunDropdownOpen(!runDropdownOpen)}
                  className="bg-indigo-700 hover:bg-indigo-600 text-white px-2 py-2 border-l border-indigo-500/40 flex items-center justify-center transition-colors"
                  aria-label="More run options"
                >
                  ▼
                </button>
              </div>

              {runDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#131720] border border-[#1E2330] rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <button
                    type="button"
                    onClick={() => {
                      setRunDropdownOpen(false);
                      onRunPipeline('single');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-[#181D28] flex items-center gap-2"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <div>
                      <div className="font-medium">Process Selected / Active Row</div>
                      <div className="text-[10px] text-slate-400">Run 1 candidate at current row</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRunDropdownOpen(false);
                      onRunPipeline('selected');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-[#181D28] flex items-center gap-2"
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <div>
                      <div className="font-medium">Process Checked Rows ({selectedCount})</div>
                      <div className="text-[10px] text-slate-400">Batch run selected candidates</div>
                    </div>
                  </button>
                  <div className="my-1 border-t border-[#1E2330]"></div>
                  <button
                    type="button"
                    onClick={() => {
                      setRunDropdownOpen(false);
                      onRunPipeline('all');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-[#181D28] flex items-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <div className="font-medium">Process All Candidates ({candidateCount})</div>
                      <div className="text-[10px] text-slate-400">Sequential batch run</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto no-scrollbar gap-1 border-t border-[#1E2330] bg-[#0A0B0E]/90">
        {[
          { id: 'multi-candidate', label: 'Multi-Candidate Automation', icon: Users, count: 3 },
          { id: 'tracker', label: 'Worksheet Row Tracker', icon: Layers, count: candidateCount },
          { id: 'console', label: 'Live Runtime Console', icon: Terminal },
          { id: 'preview', label: 'Generated Resumes & ATS', icon: FileText },
          { id: 'analyzer', label: 'JD & Voice Input', icon: Mic },
          { id: 'settings', label: 'Configuration Settings', icon: Sliders },
          { id: 'security', label: 'Credentials & Security', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              id={`tab-btn-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-cyan-500 text-cyan-400 bg-[#131720]/80'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#131720]/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  isActive ? 'bg-[#161B26] text-cyan-300 border border-cyan-800/60' : 'bg-[#181D28] text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
