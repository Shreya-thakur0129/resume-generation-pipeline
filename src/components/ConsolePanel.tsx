import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  Trash2,
  Copy,
  Download,
  Check,
  Search,
  Filter,
  ArrowDownCircle,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { LogEntry, PipelineStageId } from '../types';

interface ConsolePanelProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ logs, onClearLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (severityFilter !== 'ALL' && log.severity !== severityFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.message.toLowerCase().includes(term) ||
      log.stage.toLowerCase().includes(term) ||
      log.severity.toLowerCase().includes(term)
    );
  });

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.severity}] [${l.stage.toUpperCase()}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.severity}] [${l.stage.toUpperCase()}] ${l.message}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline_runtime_logs_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityStyle = (severity: LogEntry['severity']) => {
    switch (severity) {
      case 'SUCCESS':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
          badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
          textColor: 'text-emerald-200',
        };
      case 'WARNING':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
          badge: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
          textColor: 'text-amber-200',
        };
      case 'ERROR':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
          badge: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
          textColor: 'text-rose-200',
        };
      default:
        return {
          icon: <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />,
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          textColor: 'text-slate-300',
        };
    }
  };

  return (
    <div className="bg-[#0F1116] rounded-xl border border-[#1E2330] shadow-2xl flex flex-col h-[650px] overflow-hidden">
      {/* Console Header / Action Toolbar */}
      <div className="bg-[#131720] border-b border-[#1E2330] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-bold text-white tracking-tight">
            Live Runtime Console
          </span>
          <span className="text-xs font-mono bg-[#181D28] text-slate-300 px-2 py-0.5 rounded-md border border-[#1E2330]">
            {filteredLogs.length} events
          </span>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="console-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="bg-[#0A0B0E] border border-[#1E2330] rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-36 sm:w-48 placeholder:text-slate-600"
            />
          </div>

          {/* Severity Dropdown */}
          <select
            id="console-severity-filter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#0A0B0E] border border-[#1E2330] rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="INFO">INFO Only</option>
            <option value="SUCCESS">SUCCESS Only</option>
            <option value="WARNING">WARNING Only</option>
            <option value="ERROR">ERROR Only</option>
          </select>

          {/* Action Buttons */}
          <button
            type="button"
            id="console-copy-btn"
            onClick={handleCopyLogs}
            className="bg-[#181D28] hover:bg-[#202736] text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-[#1E2330] flex items-center gap-1.5 transition-colors"
            title="Copy all logs to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            id="console-download-btn"
            onClick={handleDownloadLogs}
            className="bg-[#181D28] hover:bg-[#202736] text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-[#1E2330] flex items-center gap-1.5 transition-colors"
            title="Download log file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            type="button"
            id="console-clear-btn"
            onClick={onClearLogs}
            className="bg-[#181D28] hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 text-xs px-2.5 py-1 rounded-lg border border-[#1E2330] flex items-center gap-1.5 transition-colors"
            title="Clear console"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          {/* Auto scroll toggle */}
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-xs px-2 py-1 rounded-lg border flex items-center gap-1 transition-colors ${
              autoScroll
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                : 'bg-[#131720] text-slate-500 border-[#1E2330]'
            }`}
            title="Toggle Auto Scroll"
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span className="text-[10px]">Scroll</span>
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto bg-[#0A0B0E]/95 space-y-2 select-text">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
            <Terminal className="w-8 h-8 opacity-40" />
            <p>No log events recorded. Run the pipeline to stream live diagnostics.</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const style = getSeverityStyle(log.severity);
            return (
              <div
                key={log.id}
                className="flex items-start gap-2.5 leading-relaxed hover:bg-[#131720]/80 p-1.5 rounded-lg transition-colors group"
              >
                {/* Timestamp */}
                <span className="text-slate-500 text-[11px] shrink-0 select-none">
                  [{log.timestamp}]
                </span>

                {/* Stage Badge */}
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-[#131720] border border-[#1E2330] text-cyan-400 shrink-0 select-none">
                  {log.stage}
                </span>

                {/* Severity Badge */}
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border shrink-0 select-none ${style.badge}`}>
                  {log.severity}
                </span>

                {/* Message */}
                <span className={`flex-1 break-words ${style.textColor}`}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}
        <div ref={consoleBottomRef} />
      </div>
    </div>
  );
};
