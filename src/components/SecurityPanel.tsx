import React from 'react';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  FileCheck2,
  Database,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { SCOPES } from '../services/oauthService';

interface SecurityPanelProps {
  userEmail: string | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isDemoMode: boolean;
}

export const SecurityPanel: React.FC<SecurityPanelProps> = ({
  userEmail,
  onSignIn,
  onSignOut,
  isDemoMode,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Credentials Status Banner */}
      <div className="bg-[#0F1116] rounded-xl border border-[#1E2330] p-5 shadow-2xl">
        <div className="border-b border-[#1E2330] pb-3 mb-5">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            Authentication & Security Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Production security standards enforce least-privilege OAuth scopes, server-side Gemini proxies, and in-memory credential storage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Google Workspace Card */}
          <div className="bg-[#131720] border border-[#1E2330] rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-slate-200">Google Workspace OAuth 2.0</h3>
                </div>
                {userEmail ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                    Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#181D28] text-slate-400 border border-[#1E2330]">
                    {isDemoMode ? 'Demo Mode Active' : 'Not Connected'}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mb-3">
                {userEmail ? `Authenticated as ${userEmail}` : 'Connect your Google account to grant restricted access to Sheets and Drive.'}
              </p>

              <div className="space-y-1.5 font-mono text-[11px] bg-[#0A0B0E] p-2.5 rounded-lg border border-[#1E2330]">
                <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  Configured Scopes:
                </div>
                {SCOPES.map((scope) => (
                  <div key={scope} className="text-slate-300 truncate">
                    • {scope}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1E2330] flex items-center justify-between">
              {userEmail ? (
                <button
                  type="button"
                  id="security-signout-btn"
                  onClick={onSignOut}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Disconnect Account
                </button>
              ) : (
                <button
                  type="button"
                  id="security-signin-btn"
                  onClick={onSignIn}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-md shadow-cyan-950/40"
                >
                  Sign in with Google
                </button>
              )}
              <span className="text-[10px] text-slate-500">In-Memory Token Cache</span>
            </div>
          </div>

          {/* Gemini AI Backend Card */}
          <div className="bg-[#131720] border border-[#1E2330] rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-slate-200">Gemini AI Model Credentials</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                  Server-Side Secret
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3">
                Gemini API calls are securely proxied through Express backend endpoints (`/api/gemini/*`). The API key is never exposed to browser source code.
              </p>

              <div className="space-y-1.5 font-mono text-[11px] bg-[#0A0B0E] p-2.5 rounded-lg border border-[#1E2330]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">GEMINI_API_KEY:</span>
                  <span className="text-emerald-400">••••••••••••••••••••••••</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Backend Proxy:</span>
                  <span className="text-cyan-300">Express /api/gemini/generate-resume</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1E2330] flex items-center justify-between text-[10px] text-slate-500">
              <span>Managed via Environment Variables</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Protected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Principles Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0F1116] rounded-xl border border-[#1E2330] p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-2 text-cyan-400">
            <Lock className="w-4 h-4" />
            <h4 className="text-xs font-bold text-slate-200">Least Privilege Scopes</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Requests only <code className="text-cyan-300 font-mono">spreadsheets</code> and <code className="text-cyan-300 font-mono">drive.file</code>. The app can never inspect or alter unrelated user files.
          </p>
        </div>

        <div className="bg-[#0F1116] rounded-xl border border-[#1E2330] p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-2 text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
            <h4 className="text-xs font-bold text-slate-200">Anti-Hallucination Rules</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Deterministic schema validators ensure that the LLM only structures factual candidate information without inventing companies, degrees, dates, or metrics.
          </p>
        </div>

        <div className="bg-[#0F1116] rounded-xl border border-[#1E2330] p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-2 text-cyan-400">
            <FileCheck2 className="w-4 h-4" />
            <h4 className="text-xs font-bold text-slate-200">LaTeX Sanitization</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All dynamic text passes through a LaTeX special-character escaping layer (<code className="text-cyan-300 font-mono">&, %, $, _, {'{'}...</code>) preventing injection and compiler failures.
          </p>
        </div>
      </div>
    </div>
  );
};
