import React, { useState, useEffect, useRef } from 'react';
import {
  AppConfig,
  CandidateRawData,
  GeneratedResumeRecord,
  JobDescriptionAnalysis,
  LogEntry,
  PipelineOverallState,
  PipelineStageId,
  PipelineStageInfo,
} from './types';
import { DEFAULT_COLUMN_MAPPING, SAMPLE_CANDIDATES, SAMPLE_JOB_DESCRIPTION } from './data/sampleData';
import { INITIAL_STAGES, PipelineOrchestrator } from './services/pipelineService';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/oauthService';
import { fetchSpreadsheetMetadata, fetchWorksheetCandidates } from './services/sheetsService';
import { Header } from './components/Header';
import { PipelineProgress } from './components/PipelineProgress';
import { RowTracker } from './components/RowTracker';
import { ConsolePanel } from './components/ConsolePanel';
import { ResumePreview } from './components/ResumePreview';
import { JDAnalyzer } from './components/JDAnalyzer';
import { ConfigSettings } from './components/ConfigSettings';
import { SecurityPanel } from './components/SecurityPanel';
import { CandidateModal } from './components/CandidateModal';
import { MultiCandidatePipeline } from './components/MultiCandidatePipeline';

const INITIAL_CONFIG: AppConfig = {
  isDemoMode: true, // Default to true so user gets an instant, working experience
  jobsToFetch: 140,
  sheets: {
    spreadsheetId: localStorage.getItem('spreadsheet_id') || '1DEMO_CANDIDATE_TRACKER_SHEET_2026',
    worksheetName: localStorage.getItem('worksheet_name') || 'Engineering Candidates',
    selectedRow: 2,
    columnMapping: DEFAULT_COLUMN_MAPPING,
  },
  drive: {
    folderId: localStorage.getItem('drive_folder_id') || '1DEMO_RESUME_ARCHIVE_FOLDER',
    folderName: localStorage.getItem('drive_folder_name') || 'Enterprise AI Resumes 2026',
    createCandidateFolder: false,
    sharingMode: 'LINK_ACCESS',
    namingPattern: '{name}_Resume_{year}.pdf',
  },
  ai: {
    model: 'gemini-3.6-flash',
    temperature: 0.2,
    maxRetries: 2,
    strictFactualMode: true,
    apiKey: localStorage.getItem('gemini_api_key') || '',
  },
  resumeFormat: {
    template: 'modern',
    pageTarget: 'auto',
    maxExperienceBullets: 5,
    maxProjects: 3,
    font: 'Helvetica',
    marginSize: 'compact',
    showLinkedIn: true,
    showGitHub: true,
    showPortfolio: true,
  },
  pipeline: {
    mode: 'sequential',
    stopOnError: false,
    retryCount: 2,
    logLevel: 'verbose',
  },
};

export default function App() {
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);
  const [overallState, setOverallState] = useState<PipelineOverallState>('IDLE');
  const [stages, setStages] = useState<PipelineStageInfo[]>(INITIAL_STAGES);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init_1',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      stage: 'system',
      severity: 'INFO',
      message: 'Resume Generation Pipeline v1.0.0 initialized. Ready for automated AI resume compilation.',
    },
    {
      id: 'init_2',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      stage: 'system',
      severity: 'SUCCESS',
      message: 'Demo dataset loaded (5 realistic candidate profiles & Senior Cloud Engineer JD).',
    },
  ]);

  const [candidates, setCandidates] = useState<CandidateRawData[]>(SAMPLE_CANDIDATES);
  const [records, setRecords] = useState<Record<number, GeneratedResumeRecord>>({});
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<string>('multi-candidate');
  const [currentJd, setCurrentJd] = useState<string>(SAMPLE_JOB_DESCRIPTION);
  const [jdAnalysis, setJdAnalysis] = useState<JobDescriptionAnalysis | null>(null);
  const [activeCandidateModal, setActiveCandidateModal] = useState<CandidateRawData | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<GeneratedResumeRecord | null>(null);

  const handleConfigChange = (newConfig: AppConfig) => {
    setConfig(newConfig);
    if (newConfig.ai.apiKey !== undefined) {
      localStorage.setItem('gemini_api_key', newConfig.ai.apiKey);
    }
    if (newConfig.sheets.spreadsheetId) {
      localStorage.setItem('spreadsheet_id', newConfig.sheets.spreadsheetId);
    }
    if (newConfig.sheets.worksheetName) {
      localStorage.setItem('worksheet_name', newConfig.sheets.worksheetName);
    }
    if (newConfig.drive.folderId) {
      localStorage.setItem('drive_folder_id', newConfig.drive.folderId);
    }
    if (newConfig.drive.folderName) {
      localStorage.setItem('drive_folder_name', newConfig.drive.folderName);
    }
  };

  // Authentication state
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  // Worksheet tabs
  const [worksheetTabs, setWorksheetTabs] = useState<string[]>(['Engineering Candidates', 'Archived Applications']);
  const [isLoadingTabs, setIsLoadingTabs] = useState<boolean>(false);

  // Pipeline runtime state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeCandidateName, setActiveCandidateName] = useState<string | undefined>();
  const [activeRowNumber, setActiveRowNumber] = useState<number | undefined>();
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  const orchestratorRef = useRef<PipelineOrchestrator | null>(null);

  // Initialize Firebase Auth listener
  useEffect(() => {
    initAuth(
      (user, token) => {
        setUserEmail(user.email || 'Authenticated User');
        setAccessToken(token);
        addLog('auth', 'SUCCESS', `Google Workspace account connected: ${user.email}`);
      },
      () => {
        setUserEmail(null);
        setAccessToken(null);
      }
    );
  }, []);

  // Automatically load live candidate rows when Sheets config changes in Production Mode
  useEffect(() => {
    if (!config.isDemoMode && accessToken && config.sheets.spreadsheetId && !config.sheets.spreadsheetId.startsWith('1DEMO')) {
      handleLoadLiveCandidates();
    }
  }, [config.sheets.spreadsheetId, config.sheets.worksheetName, config.isDemoMode, accessToken]);

  const addLog = (
    stage: PipelineStageId | 'system' | 'auth',
    severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR',
    message: string
  ) => {
    const newEntry: LogEntry = {
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      stage,
      severity,
      message,
    };
    setLogs((prev) => [...prev, newEntry]);
  };

  const handleSignIn = async () => {
    setIsAuthLoading(true);
    try {
      addLog('auth', 'INFO', 'Initiating Google Workspace OAuth 2.0 flow...');
      const res = await googleSignIn();
      if (res) {
        setUserEmail(res.user.email || 'Authenticated User');
        setAccessToken(res.accessToken);
        addLog('auth', 'SUCCESS', `OAuth 2.0 access token granted for ${res.user.email}`);
        
        // Auto-refresh sheet metadata
        handleRefreshWorksheetTabs(res.accessToken);
      } else {
        addLog('auth', 'INFO', 'Google Sign-in popup was closed or cancelled.');
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user')) {
        addLog('auth', 'INFO', 'Google Sign-in popup was closed.');
      } else {
        addLog('auth', 'WARNING', `Google Sign-in notice: ${err?.message || 'Authentication not completed'}`);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUserEmail(null);
    setAccessToken(null);
    addLog('auth', 'INFO', 'Signed out of Google Workspace.');
  };

  const handleToggleDemoMode = () => {
    const nextMode = !config.isDemoMode;
    setConfig((prev) => ({ ...prev, isDemoMode: nextMode }));
    if (nextMode) {
      setCandidates(SAMPLE_CANDIDATES);
      addLog('system', 'INFO', 'Switched to Demo Mode (using local simulated candidates & services).');
    } else {
      addLog('system', 'WARNING', 'Switched to Production Google Workspace Mode. Ensure Google OAuth is connected.');
      if (accessToken) {
        handleLoadLiveCandidates();
      }
    }
  };

  const handleRefreshWorksheetTabs = async (tokenOverride?: string) => {
    setIsLoadingTabs(true);
    const token = tokenOverride || accessToken;
    try {
      const meta = await fetchSpreadsheetMetadata(config.sheets.spreadsheetId, token, config.isDemoMode);
      const tabNames = meta.sheets.map((s) => s.title);
      setWorksheetTabs(tabNames);
      if (tabNames.length > 0 && !tabNames.includes(config.sheets.worksheetName)) {
        setConfig((prev) => ({
          ...prev,
          sheets: { ...prev.sheets, worksheetName: tabNames[0] },
        }));
      }
      addLog('sheet', 'SUCCESS', `Loaded ${tabNames.length} sheet tabs from "${meta.title}".`);
    } catch (err: any) {
      addLog('sheet', 'ERROR', `Failed to load worksheet tabs: ${err.message}`);
    } finally {
      setIsLoadingTabs(false);
    }
  };

  const handleLoadLiveCandidates = async () => {
    try {
      addLog('sheet', 'INFO', `Fetching candidate rows from sheet "${config.sheets.worksheetName}"...`);
      const { candidates: liveCandidates } = await fetchWorksheetCandidates(
        config.sheets,
        accessToken,
        config.isDemoMode
      );
      if (liveCandidates.length > 0) {
        setCandidates(liveCandidates);
        addLog('sheet', 'SUCCESS', `Loaded ${liveCandidates.length} candidate rows from Google Sheets.`);
      }
    } catch (err: any) {
      addLog('sheet', 'ERROR', `Could not fetch rows: ${err.message}`);
    }
  };

  const resetStageStatuses = () => {
    setStages(INITIAL_STAGES.map((s) => ({ ...s, status: 'pending', durationMs: undefined, error: undefined })));
  };

  // Run pipeline for candidate(s)
  const handleRunPipeline = async (mode: 'single' | 'selected' | 'all') => {
    let targetList: CandidateRawData[] = [];

    if (mode === 'single') {
      const candidate = candidates.find((c) => c.rowNumber === config.sheets.selectedRow) || candidates[0];
      if (candidate) targetList = [candidate];
    } else if (mode === 'selected') {
      targetList = candidates.filter((c) => selectedRows.includes(c.rowNumber));
      if (targetList.length === 0 && candidates.length > 0) {
        targetList = [candidates[0]];
      }
    } else {
      targetList = candidates;
    }

    if (targetList.length === 0) {
      addLog('system', 'WARNING', 'No candidates available to process.');
      return;
    }

    setIsRunning(true);
    setBatchProgress(targetList.length > 1 ? { current: 0, total: targetList.length } : null);

    const orchestrator = new PipelineOrchestrator(config, accessToken, {
      onStateChange: (state) => setOverallState(state),
      onStageUpdate: (stageId, update) => {
        setStages((prev) =>
          prev.map((s) => (s.id === stageId ? { ...s, ...update } : s))
        );
      },
      onLog: (entry) => {
        setLogs((prev) => [...prev, entry]);
      },
    });

    orchestratorRef.current = orchestrator;

    for (let i = 0; i < targetList.length; i++) {
      const candidate = targetList[i];
      setActiveCandidateName(candidate.name);
      setActiveRowNumber(candidate.rowNumber);
      resetStageStatuses();

      if (targetList.length > 1) {
        setBatchProgress({ current: i + 1, total: targetList.length });
      }

      const result = await orchestrator.executeForCandidate(candidate, currentJd);

      // Store record
      setRecords((prev) => ({
        ...prev,
        [candidate.rowNumber]: result,
      }));

      if (result.status === 'COMPLETED') {
        setSelectedRecord(result);
      }

      if (result.status === 'FAILED' && config.pipeline.stopOnError) {
        addLog('system', 'WARNING', `Batch execution stopped on row ${candidate.rowNumber} due to "Stop on error" setting.`);
        break;
      }

      if (i < targetList.length - 1) {
        addLog('system', 'INFO', 'Waiting 4.5 seconds to comply with Gemini Free Tier rate limits...');
        await new Promise((resolve) => setTimeout(resolve, 4500));
      }
    }

    setIsRunning(false);
    setActiveCandidateName(undefined);
    setActiveRowNumber(undefined);
    setBatchProgress(null);
  };

  const handleRunCandidateSingle = async (candidate: CandidateRawData) => {
    setConfig((prev) => ({
      ...prev,
      sheets: { ...prev.sheets, selectedRow: candidate.rowNumber },
    }));

    setIsRunning(true);
    setActiveCandidateName(candidate.name);
    setActiveRowNumber(candidate.rowNumber);
    resetStageStatuses();

    const orchestrator = new PipelineOrchestrator(config, accessToken, {
      onStateChange: (state) => setOverallState(state),
      onStageUpdate: (stageId, update) => {
        setStages((prev) =>
          prev.map((s) => (s.id === stageId ? { ...s, ...update } : s))
        );
      },
      onLog: (entry) => setLogs((prev) => [...prev, entry]),
    });

    orchestratorRef.current = orchestrator;
    const result = await orchestrator.executeForCandidate(candidate, currentJd);

    setRecords((prev) => ({
      ...prev,
      [candidate.rowNumber]: result,
    }));

    if (result.status === 'COMPLETED') {
      setSelectedRecord(result);
    }

    setIsRunning(false);
    setActiveCandidateName(undefined);
    setActiveRowNumber(undefined);
  };

  const handleRegenerate = (record: GeneratedResumeRecord) => {
    const candidate = candidates.find((c) => c.rowNumber === record.rowNumber);
    if (candidate) {
      handleRunCandidateSingle(candidate);
    }
  };

  const handleCancelPipeline = () => {
    if (orchestratorRef.current) {
      orchestratorRef.current.cancel();
    }
    setIsRunning(false);
  };

  const handleToggleSelectRow = (rowNumber: number) => {
    setSelectedRows((prev) =>
      prev.includes(rowNumber) ? prev.filter((r) => r !== rowNumber) : [...prev, rowNumber]
    );
  };

  const handleSelectAllRows = (select: boolean) => {
    if (select) {
      setSelectedRows(candidates.map((c) => c.rowNumber));
    } else {
      setSelectedRows([]);
    }
  };

  const allGeneratedRecords = Object.values(records);

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Main Navigation Header */}
      <Header
        overallState={overallState}
        isDemoMode={config.isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        onRunPipeline={handleRunPipeline}
        isRunning={isRunning}
        onCancelPipeline={handleCancelPipeline}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userEmail={userEmail}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isAuthLoading={isAuthLoading}
        candidateCount={candidates.length}
        selectedCount={selectedRows.length}
      />

      {/* 7-Stage Animated Horizontal Pipeline Indicator */}
      <PipelineProgress
        stages={stages}
        onRetryStage={(stageId) => {
          const candidate = candidates.find((c) => c.rowNumber === config.sheets.selectedRow) || candidates[0];
          if (candidate) handleRunCandidateSingle(candidate);
        }}
        isRunning={isRunning}
        activeCandidateName={activeCandidateName}
        batchProgress={batchProgress}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* Tab 0: Multi-Candidate Automation Hub */}
        {activeTab === 'multi-candidate' && (
          <MultiCandidatePipeline
            isDemoMode={config.isDemoMode}
            userEmail={userEmail}
            accessToken={accessToken}
            onLog={(entry) => setLogs((prev) => [...prev, entry])}
          />
        )}

        {/* Tab 1: Worksheet Row Tracker */}
        {activeTab === 'tracker' && (
          <RowTracker
            candidates={candidates}
            records={records}
            selectedRows={selectedRows}
            onToggleSelectRow={handleToggleSelectRow}
            onSelectAllRows={handleSelectAllRows}
            onRunCandidate={handleRunCandidateSingle}
            onViewResume={(rec) => {
              setSelectedRecord(rec);
              setActiveTab('preview');
            }}
            onInspectCandidate={(c) => setActiveCandidateModal(c)}
            isRunning={isRunning}
            activeRowNumber={activeRowNumber}
          />
        )}

        {/* Tab 2: Live Runtime Console */}
        {activeTab === 'console' && (
          <ConsolePanel
            logs={logs}
            onClearLogs={() => setLogs([])}
          />
        )}

        {/* Tab 3: Generated Resumes Preview & ATS */}
        {activeTab === 'preview' && (
          <ResumePreview
            record={selectedRecord}
            allRecords={allGeneratedRecords}
            onSelectRecord={setSelectedRecord}
            onRegenerate={handleRegenerate}
            isRunning={isRunning}
          />
        )}

        {/* Tab 4: Job Description Analyzer & Voice Input */}
        {activeTab === 'analyzer' && (
          <JDAnalyzer
            currentJd={currentJd}
            onChangeJd={setCurrentJd}
            analysis={jdAnalysis}
            onAnalysisComplete={setJdAnalysis}
            isDemoMode={config.isDemoMode}
          />
        )}

        {/* Tab 5: Configuration Settings */}
        {activeTab === 'settings' && (
          <ConfigSettings
            config={config}
            onChangeConfig={handleConfigChange}
            accessToken={accessToken}
            userEmail={userEmail}
            onSignIn={handleSignIn}
            onRefreshWorksheetTabs={() => handleRefreshWorksheetTabs()}
            worksheetTabs={worksheetTabs}
            isLoadingTabs={isLoadingTabs}
          />
        )}

        {/* Tab 6: Credentials & Security */}
        {activeTab === 'security' && (
          <SecurityPanel
            userEmail={userEmail}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            isDemoMode={config.isDemoMode}
          />
        )}
      </main>

      {/* Candidate Inspector Modal */}
      <CandidateModal
        candidate={activeCandidateModal}
        onClose={() => setActiveCandidateModal(null)}
        onRunCandidate={handleRunCandidateSingle}
        isRunning={isRunning}
      />
    </div>
  );
}
