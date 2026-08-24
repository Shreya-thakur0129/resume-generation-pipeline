import React, { useState } from 'react';
import {
  Sliders,
  Database,
  CloudUpload,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { AppConfig, ColumnMapping, DriveSharingMode } from '../types';
import { fetchSpreadsheetMetadata } from '../services/sheetsService';

interface ConfigSettingsProps {
  config: AppConfig;
  onChangeConfig: (newConfig: AppConfig) => void;
  accessToken: string | null;
  userEmail: string | null;
  onSignIn: () => void;
  onRefreshWorksheetTabs: () => void;
  worksheetTabs: string[];
  isLoadingTabs: boolean;
}

export const ConfigSettings: React.FC<ConfigSettingsProps> = ({
  config,
  onChangeConfig,
  accessToken,
  userEmail,
  onSignIn,
  onRefreshWorksheetTabs,
  worksheetTabs,
  isLoadingTabs,
}) => {
  const [activeSection, setActiveSection] = useState<'workspace' | 'mapping' | 'ai' | 'resume' | 'pipeline'>('workspace');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleSheetsChange = (field: string, value: any) => {
    onChangeConfig({
      ...config,
      sheets: {
        ...config.sheets,
        [field]: value,
      },
    });
  };

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    onChangeConfig({
      ...config,
      sheets: {
        ...config.sheets,
        columnMapping: {
          ...config.sheets.columnMapping,
          [field]: value,
        },
      },
    });
  };

  const handleDriveChange = (field: string, value: any) => {
    onChangeConfig({
      ...config,
      drive: {
        ...config.drive,
        [field]: value,
      },
    });
  };

  const handleAIChange = (field: string, value: any) => {
    onChangeConfig({
      ...config,
      ai: {
        ...config.ai,
        [field]: value,
      },
    });
  };

  const handleResumeFormatChange = (field: string, value: any) => {
    onChangeConfig({
      ...config,
      resumeFormat: {
        ...config.resumeFormat,
        [field]: value,
      },
    });
  };

  const handlePipelineChange = (field: string, value: any) => {
    onChangeConfig({
      ...config,
      pipeline: {
        ...config.pipeline,
        [field]: value,
      },
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const meta = await fetchSpreadsheetMetadata(config.sheets.spreadsheetId, accessToken, config.isDemoMode);
      setTestResult({
        success: true,
        message: `Connection Verified! Found spreadsheet "${meta.title}" with ${meta.sheets.length} worksheet tab(s).`,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to connect to Google Sheets.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-[#0F1116] rounded-xl border border-[#1E2330] shadow-2xl overflow-hidden">
      {/* Sub-Navigation */}
      <div className="bg-[#131720] border-b border-[#1E2330] px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'workspace', label: 'Google Workspace', icon: Database },
          { id: 'mapping', label: 'Column Mapping', icon: Layers },
          { id: 'ai', label: 'Gemini AI Rules', icon: Sparkles },
          { id: 'resume', label: 'LaTeX & Resume Layout', icon: FileCheck2 },
          { id: 'pipeline', label: 'Execution & Pipeline', icon: Sliders },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              id={`config-subnav-${item.id}`}
              onClick={() => setActiveSection(item.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#181D28]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* SECTION 1: GOOGLE WORKSPACE */}
        {activeSection === 'workspace' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E2330] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  Google Workspace & Drive Integration
                </h3>
                <p className="text-xs text-slate-400">
                  Connect your Google Spreadsheet to read candidate rows and Google Drive to store compiled PDFs.
                </p>
              </div>
              <button
                type="button"
                id="test-connection-btn"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="bg-[#131720] hover:bg-[#181D28] text-cyan-400 border border-cyan-800/60 font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Test Connection</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                  testResult.success
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950/60 text-rose-300 border-rose-800'
                }`}
              >
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Spreadsheet ID / URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Google Spreadsheet ID or URL
                </label>
                <input
                  type="text"
                  id="spreadsheet-id-input"
                  value={config.sheets.spreadsheetId}
                  onChange={(e) => handleSheetsChange('spreadsheetId', e.target.value)}
                  placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms or Paste full Sheets URL"
                  className="w-full bg-[#0A0B0E] border border-[#1E2330] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Paste the full URL from your browser address bar or just the ID string.
                </span>
              </div>

              {/* Worksheet / Tab Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Worksheet / Tab Name</span>
                  <button
                    type="button"
                    onClick={onRefreshWorksheetTabs}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${isLoadingTabs ? 'animate-spin' : ''}`} />
                    Refresh Tabs
                  </button>
                </label>
                {worksheetTabs.length > 0 ? (
                  <select
                    id="worksheet-name-select"
                    value={config.sheets.worksheetName}
                    onChange={(e) => handleSheetsChange('worksheetName', e.target.value)}
                    className="w-full bg-[#0A0B0E] border border-[#1E2330] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    {worksheetTabs.map((tab) => (
                      <option key={tab} value={tab}>
                        {tab}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="worksheet-name-input"
                    value={config.sheets.worksheetName}
                    onChange={(e) => handleSheetsChange('worksheetName', e.target.value)}
                    placeholder="e.g. Engineering Candidates or Sheet1"
                    className="w-full bg-[#0A0B0E] border border-[#1E2330] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                )}
              </div>

              {/* Google Drive Folder ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Google Drive Target Folder ID (Optional)
                </label>
                <input
                  type="text"
                  id="drive-folder-id-input"
                  value={config.drive.folderId}
                  onChange={(e) => handleDriveChange('folderId', e.target.value)}
                  placeholder="e.g. 1a2B3c4D5e... (Leave blank for Drive root folder)"
                  className="w-full bg-[#0A0B0E] border border-[#1E2330] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Compiled PDFs will be uploaded to this Google Drive folder.
                </span>
              </div>

              {/* Drive Sharing Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Google Drive Sharing Mode
                </label>
                <select
                  id="drive-sharing-mode-select"
                  value={config.drive.sharingMode}
                  onChange={(e) => handleDriveChange('sharingMode', e.target.value as DriveSharingMode)}
                  className="w-full bg-[#0A0B0E] border border-[#1E2330] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="PRIVATE">PRIVATE (Only owner and explicit users can view)</option>
                  <option value="DOMAIN">DOMAIN (Anyone in your Google Workspace org)</option>
                  <option value="LINK_ACCESS">LINK_ACCESS (Anyone with the generated Drive link can view)</option>
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Security note: Files are private by default unless Link Access is chosen.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: COLUMN MAPPING */}
        {activeSection === 'mapping' && (
          <div className="space-y-4">
            <div className="border-b border-[#1E2330] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Spreadsheet Column Mapping
              </h3>
              <p className="text-xs text-slate-400">
                Map each resume field to the exact column header in your Google Spreadsheet.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(config.sheets.columnMapping).map(([field, mappedHeader]) => (
                <div key={field} className="bg-[#131720] p-2.5 rounded-lg border border-[#1E2330]">
                  <label className="block text-[11px] font-mono font-semibold text-cyan-300 uppercase tracking-wider mb-1">
                    {field.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="text"
                    id={`mapping-input-${field}`}
                    value={mappedHeader}
                    onChange={(e) => handleMappingChange(field as keyof ColumnMapping, e.target.value)}
                    placeholder={`Header name for ${field}`}
                    className="w-full bg-[#0A0B0E] border border-[#1E2330] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: AI RULES */}
        {activeSection === 'ai' && (
          <div className="space-y-5">
            <div className="border-b border-[#1E2330] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Gemini Model & Anti-Hallucination Controls
              </h3>
              <p className="text-xs text-slate-400">
                Strict anti-hallucination guarantees ensure factual grounding in candidate source data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gemini Model
                </label>
                <select
                  id="gemini-model-select"
                  value={config.ai.model}
                  onChange={(e) => handleAIChange('model', e.target.value)}
                  className="w-full bg-[#0A0B0E] border border-[#1E2330] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="gemini-3.6-flash">gemini-3.6-flash (Fast, Highly Accurate, Recommended)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  id="gemini-api-key-input"
                  value={config.ai.apiKey || ''}
                  onChange={(e) => handleAIChange('apiKey', e.target.value)}
                  placeholder="Paste your Gemini API Key here (stored locally on your device)"
                  className="w-full bg-[#0A0B0E] border border-[#1E2330] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Temperature (Creativity vs Determinism)</span>
                <span className="font-mono text-cyan-400">{config.ai.temperature}</span>
              </label>
              <input
                type="range"
                id="gemini-temperature-slider"
                min="0.0"
                max="1.0"
                step="0.05"
                value={config.ai.temperature}
                onChange={(e) => handleAIChange('temperature', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Lower values (0.1–0.2) prioritize strict factual accuracy and ATS compliance.
              </span>
            </div>

            {/* Strict Factual Mode Toggle */}
            <div className="bg-[#131720] rounded-lg p-4 border border-[#1E2330] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">
                    Strict Anti-Hallucination Guarantee
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="strict-factual-mode-toggle"
                      checked={config.ai.strictFactualMode}
                      onChange={(e) => handleAIChange('strictFactualMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#0A0B0E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Enforces strict schema validation preventing AI from fabricating companies, job titles, degrees, dates, metrics, or technologies not present in the candidate source data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: RESUME & LATEX RULES */}
        {activeSection === 'resume' && (
          <div className="space-y-4">
            <div className="border-b border-[#1E2330] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-cyan-400" />
                LaTeX Template & Resume Formatting
              </h3>
              <p className="text-xs text-slate-400">
                Configure deterministic LaTeX formatting, margins, and section densities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Page Length
                </label>
                <select
                  id="resume-page-target-select"
                  value={config.resumeFormat.pageTarget}
                  onChange={(e) => handleResumeFormatChange('pageTarget', e.target.value)}
                  className="w-full bg-[#0A0B0E] border border-[#1E2330] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="auto">Auto (1 page for standard, 2 for extended)</option>
                  <option value="1-page">Strict 1-Page ATS</option>
                  <option value="2-page">Extended 2-Page</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Max Bullets per Experience
                </label>
                <input
                  type="number"
                  id="resume-max-bullets-input"
                  min="2"
                  max="8"
                  value={config.resumeFormat.maxExperienceBullets}
                  onChange={(e) => handleResumeFormatChange('maxExperienceBullets', parseInt(e.target.value, 10))}
                  className="w-full bg-[#0A0B0E] border border-[#1E2330] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Max Key Projects
                </label>
                <input
                  type="number"
                  id="resume-max-projects-input"
                  min="1"
                  max="6"
                  value={config.resumeFormat.maxProjects}
                  onChange={(e) => handleResumeFormatChange('maxProjects', parseInt(e.target.value, 10))}
                  className="w-full bg-[#0A0B0E] border border-[#1E2330] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Font Family
                </label>
                <select
                  id="resume-font-select"
                  value={config.resumeFormat.font}
                  onChange={(e) => handleResumeFormatChange('font', e.target.value)}
                  className="w-full bg-[#0A0B0E] border border-[#1E2330] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="Helvetica">Helvetica / Modern Sans (ATS Recommended)</option>
                  <option value="Computer Modern">Computer Modern (Classic LaTeX)</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Charter">Charter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Margin Size
                </label>
                <select
                  id="resume-margin-select"
                  value={config.resumeFormat.marginSize}
                  onChange={(e) => handleResumeFormatChange('marginSize', e.target.value)}
                  className="w-full bg-[#0A0B0E] border border-[#1E2330] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="compact">Compact (0.5 in / 36 pt)</option>
                  <option value="standard">Standard (0.6 in / 42 pt)</option>
                  <option value="relaxed">Relaxed (0.75 in / 54 pt)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: PIPELINE EXECUTION */}
        {activeSection === 'pipeline' && (
          <div className="space-y-4">
            <div className="border-b border-[#1E2330] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Pipeline Orchestration & Error Handling
              </h3>
              <p className="text-xs text-slate-400">
                Configure batch concurrency, retry behavior, and runtime logging level.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Batch Execution Mode
                </label>
                <select
                  id="pipeline-mode-select"
                  value={config.pipeline.mode}
                  onChange={(e) => handlePipelineChange('mode', e.target.value)}
                  className="w-full bg-[#0A0B0E] border border-[#1E2330] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="sequential">Sequential (Safe, Respects Google/Gemini rate limits)</option>
                  <option value="batch">Parallel Batch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Runtime Log Verbosity
                </label>
                <select
                  id="pipeline-log-level-select"
                  value={config.pipeline.logLevel}
                  onChange={(e) => handlePipelineChange('logLevel', e.target.value)}
                  className="w-full bg-[#0A0B0E] border border-[#1E2330] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="verbose">Verbose (All stage and schema events)</option>
                  <option value="standard">Standard</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </div>

            <div className="bg-[#131720] rounded-lg p-4 border border-[#1E2330] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Stop Batch on Candidate Error</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  When enabled, encountering a fatal error on one candidate halts the remaining batch.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="stop-on-error-toggle"
                  checked={config.pipeline.stopOnError}
                  onChange={(e) => handlePipelineChange('stopOnError', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#0A0B0E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
