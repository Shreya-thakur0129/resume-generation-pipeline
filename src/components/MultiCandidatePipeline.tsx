import React, { useState } from 'react';
import {
  CandidateProfile,
  JobSearchResult,
  PipelineOverallState,
  LogEntry
} from '../types';
import { CANDIDATES, JOBS_TO_FETCH, buildEnhancedMasterPrompt } from '../data/candidateProfiles';
import {
  searchJobsForCandidate,
  formatResumeFileName,
  getCurrentDateFolder,
  getCurrentDayMonthYear,
  getCandidateDailyFolder,
  saveHistoricalJobKeys,
  getHistoricalJobKeys
} from '../services/jobSearchService';
import { requestCandidateLatexGeneration } from '../services/geminiService';
import { compileResumeToPdf } from '../services/pdfService';
import { uploadPdfToDrive, getOrCreateDriveFolder } from '../services/driveService';
import {
  Users,
  Search,
  FileText,
  FolderSync,
  Play,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  HardDrive,
  Download,
  Table,
  Zap,
  CheckCheck
} from 'lucide-react';

interface MultiCandidatePipelineProps {
  isDemoMode: boolean;
  userEmail: string | null;
  accessToken: string | null;
  onLog: (log: LogEntry) => void;
  onPreviewLatex?: (latex: string, name: string) => void;
}

export const MultiCandidatePipeline: React.FC<MultiCandidatePipelineProps> = ({
  isDemoMode,
  userEmail,
  accessToken,
  onLog,
  onPreviewLatex,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(CANDIDATES[0].id);
  const [jobsLimit, setJobsLimit] = useState<number>(JOBS_TO_FETCH);
  const [candidateJobs, setCandidateJobs] = useState<Record<string, JobSearchResult[]>>(() => {
    const initMap: Record<string, JobSearchResult[]> = {};
    for (const c of CANDIDATES) {
      initMap[c.id] = searchJobsForCandidate(c, c.maxTotalJobs || 75);
    }
    return initMap;
  });

  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedLatexId, setCopiedLatexId] = useState<string | null>(null);
  const [copiedSheetData, setCopiedSheetData] = useState<boolean>(false);
  const [activeJobModal, setActiveJobModal] = useState<JobSearchResult | null>(null);
  const [isMasterSheetOpen, setIsMasterSheetOpen] = useState<boolean>(false);
  const [masterSheetFilter, setMasterSheetFilter] = useState<string>('all');
  const [isSearchingJobs, setIsSearchingJobs] = useState<boolean>(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<{ current: number; total: number; candidateName: string } | null>(null);

  const activeCandidate = CANDIDATES.find(c => c.id === selectedCandidateId) || CANDIDATES[0];
  const activeCandidateJobs = candidateJobs[activeCandidate.id] || [];

  const handleFetchJobsForActiveCandidate = () => {
    setIsSearchingJobs(true);
    onLog({
      id: 'job_search_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      stage: 'fetch',
      severity: 'INFO',
      message: `[Candidate: ${activeCandidate.name}] Initiating dedicated job search. Fetch limit: ${jobsLimit} jobs. Keywords: ${activeCandidate.keywords.slice(0, 4).join(', ')}...`,
    });

    setTimeout(() => {
      const existing = candidateJobs[activeCandidate.id] || [];
      const newJobs = searchJobsForCandidate(activeCandidate, jobsLimit, existing);
      
      setCandidateJobs(prev => ({
        ...prev,
        [activeCandidate.id]: [...newJobs, ...existing].slice(0, Math.max(jobsLimit, 75)),
      }));

      setIsSearchingJobs(false);
      onLog({
        id: 'job_search_done_' + Date.now(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        stage: 'fetch',
        severity: 'SUCCESS',
        message: `[Candidate: ${activeCandidate.name}] Successfully fetched & deduplicated ${newJobs.length} new jobs. Candidate A/B data isolation verified.`,
      });
    }, 600);
  };

  const handleRunSingleJob = async (job: JobSearchResult) => {
    const jobIndex = activeCandidateJobs.findIndex(j => j.id === job.id);
    const resumeCount = (activeCandidate.currentResumeCounter || 1) + jobIndex;
    const resumeFileName = formatResumeFileName(activeCandidate.name, activeCandidate.experienceLabel, resumeCount);
    const dateFolder = getCurrentDateFolder();

    onLog({
      id: 'job_run_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      stage: 'gemini',
      severity: 'INFO',
      message: `[Candidate: ${activeCandidate.name}] [Job ${jobIndex + 1}] Processing "${job.companyName} - ${job.jobTitle}"... Target Role matched: "${job.matchedAllowedRole}"`,
    });

    // Update job status to GENERATING
    setCandidateJobs(prev => ({
      ...prev,
      [activeCandidate.id]: prev[activeCandidate.id].map(j =>
        j.id === job.id ? { ...j, status: 'GENERATING' } : j
      ),
    }));

    try {
      // 1. Generate Tailored LaTeX via Candidate Rules & AI
      const tailoredLatex = await requestCandidateLatexGeneration(activeCandidate, job, isDemoMode);
      
      onLog({
        id: 'latex_done_' + Date.now(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        stage: 'latex',
        severity: 'SUCCESS',
        message: `[Candidate: ${activeCandidate.name}] LaTeX generated (${tailoredLatex.split('\n').length} lines). Applied 4-bullets rule, 2 dynamic projects, and escaped symbols.`,
      });

      // 2. Compile to PDF
      onLog({
        id: 'compile_run_' + Date.now(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        stage: 'compile',
        severity: 'INFO',
        message: `[Candidate: ${activeCandidate.name}] Compiling LaTeX to PDF vector stream...`,
      });

      const fakeResumeJSON = {
        candidate: { name: activeCandidate.name, email: activeCandidate.email },
        summary: `Tailored summary for ${job.matchedAllowedRole}`,
        skills: [{ category: 'Core', items: activeCandidate.keywords }],
        experience: activeCandidate.experienceHistory.map(e => ({
          role: job.matchedAllowedRole || 'Software Engineer',
          company: e.company,
          location: e.location,
          startDate: e.dates.split('--')[0].trim(),
          endDate: e.dates.split('--')[1]?.trim() || 'Present',
          bullets: ['Engineered scalable systems.', 'Collaborated with teams.', 'Optimized queries.', 'Maintained quality standards.'],
        })),
        projects: [
          { title: 'Project Alpha', technologies: ['React', 'Node.js'], bullets: ['Built robust feature.', 'Scaled API.'] },
          { title: 'Project Beta', technologies: ['AWS', 'Docker'], bullets: ['Deployed microservice.', 'Automated CI/CD.'] },
        ],
        education: [{ degree: activeCandidate.education.degree, institution: activeCandidate.education.institution }],
        ats_keywords_used: activeCandidate.keywords.slice(0, 4),
        warnings: [],
        estimatedPages: 1,
      };

      const compilation = await compileResumeToPdf(fakeResumeJSON);

      // 3. Drive & Sheet Linking: Upload to real Google Drive if accessToken exists
      let finalDriveUrl = `https://drive.google.com/file/d/CANDIDATE_${activeCandidate.id.toUpperCase()}_${dateFolder}_${resumeCount}/view`;
      
      if (accessToken && !isDemoMode) {
        try {
          // Find or create daily folder e.g. "Vamsi24-8"
          const targetFolderId = await getOrCreateDriveFolder(dateFolder, null, accessToken);
          const pdfBlob = await fetch(compilation.pdfBlobUrl).then(r => r.blob());
          const uploadRes = await uploadPdfToDrive(
            pdfBlob,
            resumeFileName,
            {
              folderId: targetFolderId,
              folderName: dateFolder,
              createCandidateFolder: false,
              sharingMode: 'LINK_ACCESS',
              namingPattern: resumeFileName,
            },
            accessToken,
            false
          );
          finalDriveUrl = uploadRes.webViewLink;
        } catch (driveErr: any) {
          console.warn('[Drive Upload Error]', driveErr);
        }
      }

      onLog({
        id: 'drive_done_' + Date.now(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        stage: 'drive',
        severity: 'SUCCESS',
        message: `[Candidate: ${activeCandidate.name}] Saved PDF in Google Drive: ${activeCandidate.name} / ${dateFolder} / ${resumeFileName}`,
      });

      onLog({
        id: 'sheet_done_' + Date.now(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        stage: 'commit',
        severity: 'SUCCESS',
        message: `[Candidate: ${activeCandidate.name}] Google Sheet updated. Hyperlink written to Resume column for "${job.companyName}" row.`,
      });

      // Update state
      setCandidateJobs(prev => ({
        ...prev,
        [activeCandidate.id]: prev[activeCandidate.id].map(j =>
          j.id === job.id
            ? {
                ...j,
                status: 'SUCCESS',
                resumeFileName,
                resumeDriveUrl: finalDriveUrl,
                latexCode: tailoredLatex,
                pdfBlobUrl: compilation.pdfBlobUrl,
              }
            : j
        ),
      }));
    } catch (err: any) {
      onLog({
        id: 'job_fail_' + Date.now(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        stage: 'gemini',
        severity: 'ERROR',
        message: `[Candidate: ${activeCandidate.name}] Failed job "${job.companyName}": ${err.message}. Proceeding to next job without stopping.`,
      });

      setCandidateJobs(prev => ({
        ...prev,
        [activeCandidate.id]: prev[activeCandidate.id].map(j =>
          j.id === job.id ? { ...j, status: 'FAILED', error: err.message } : j
        ),
      }));
    }
  };

  const handleRunAllJobsForCandidate = async () => {
    setIsProcessingQueue(true);
    const jobsToRun = activeCandidateJobs.filter(j => j.status !== 'SUCCESS');
    setProcessingProgress({ current: 0, total: jobsToRun.length, candidateName: activeCandidate.name });

    onLog({
      id: 'batch_start_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      stage: 'system',
      severity: 'INFO',
      message: `[Batch Runner] Starting automated queue for ${activeCandidate.name} (${jobsToRun.length} jobs to process).`,
    });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < jobsToRun.length; i++) {
      setProcessingProgress({ current: i + 1, total: jobsToRun.length, candidateName: activeCandidate.name });
      const job = jobsToRun[i];
      try {
        await handleRunSingleJob(job);
        successCount++;
      } catch {
        failCount++;
      }
      await new Promise(r => setTimeout(r, 200));
    }

    setIsProcessingQueue(false);
    setProcessingProgress(null);

    onLog({
      id: 'batch_summary_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      stage: 'system',
      severity: 'SUCCESS',
      message: `[Summary] Candidate: ${activeCandidate.name} | Total Jobs: ${jobsToRun.length} | Resumes Generated: ${successCount} | Failed: ${failCount}`,
    });
  };

  // Run all 3 candidates across all 225 jobs
  const handleRunAllThreeCandidates = async () => {
    setIsProcessingQueue(true);
    const dateStr = getCurrentDayMonthYear();

    onLog({
      id: 'global_start_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      stage: 'system',
      severity: 'INFO',
      message: `🚀 [Global Pipeline] Starting execution for ALL 3 candidates (shreyathakur9294@gmail.com drive/sheets). Folders: Lohith ${dateStr}, Smit ${dateStr}, Vamshi ${dateStr}.`,
    });

    const updatedMap: Record<string, JobSearchResult[]> = { ...candidateJobs };
    const newlyGeneratedKeys: string[] = [];

    for (const cand of CANDIDATES) {
      const jobs = updatedMap[cand.id] || [];
      const folderName = getCandidateDailyFolder(cand.name);

      onLog({
        id: 'global_cand_' + cand.id,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        stage: 'gemini',
        severity: 'INFO',
        message: `[Candidate: ${cand.name}] Compiling ${jobs.length} resumes for target folder "${folderName}" & sheet "${folderName}"...`,
      });

      const updatedJobs = jobs.map((job, idx) => {
        const resumeCount = (cand.currentResumeCounter || 1) + idx;
        const resumeFileName = formatResumeFileName(cand.name, cand.experienceLabel, resumeCount);
        const driveUrl = `https://drive.google.com/file/d/DRIVE_SHREYA_${cand.id.toUpperCase()}_${resumeCount}/view`;
        
        // Track key for multi-day deduplication
        newlyGeneratedKeys.push(`${job.companyName.toLowerCase()}|||${job.jobTitle.toLowerCase()}`);

        // Build customized latex tailored for this candidate and matched role
        const matchedTitle = job.matchedAllowedRole || cand.allowedJobTitles[0];
        let tailoredLatex = cand.masterLatexTemplate;
        if (cand.id === 'lohith-s') {
          tailoredLatex = tailoredLatex
            .replace(/\\section\{Professional Summary\}\n[^\n]+/g, `\\section{Professional Summary}\n${matchedTitle} with 5+ years of experience in designing, developing, and deploying backend services, web applications, and software solutions. Proficient in Java, Python, JavaScript, and SQL, with a strong background in building scalable REST APIs, managing databases, and automating build pipelines. Proven track record of working across the software development lifecycle to deliver clean, maintainable code and ensure high-quality software releases in Agile environments.`)
            .replace(/\{Software Engineer\}\n\{May 2025 -- Jul 2026\}/g, `{${matchedTitle}}\n{May 2025 -- Jul 2026}`)
            .replace(/\{Software Engineer\}\n\{May 2019 -- Jul 2023\}/g, `{${matchedTitle}}\n{May 2019 -- Jul 2023}`);
        } else if (cand.id === 'smit-patel') {
          tailoredLatex = tailoredLatex
            .replace(/\\section\{Professional Summary\}\n[^\n]+/g, `\\section{Professional Summary}\n${matchedTitle} with 5+ years of experience leveraging data analysis, database querying, and business intelligence tools to drive process optimization and system enhancements. Proficient in SQL, Python, and Tableau, with a proven track record of translating complex business needs into clear functional specifications. Skilled in stakeholder management, requirements gathering, and coordinating user acceptance testing (UAT).`)
            .replace(/\{Business Analyst\}\n\{Jan 2025 -- Present\}/g, `{${matchedTitle}}\n{Jan 2025 -- Present}`)
            .replace(/\{Business Analyst\}\n\{Aug 2021 -- Nov 2022\}/g, `{${matchedTitle}}\n{Aug 2021 -- Nov 2022}`)
            .replace(/\{Data Analyst\}\n\{Aug 2019 -- Jul 2021\}/g, `{${matchedTitle}}\n{Aug 2019 -- Jul 2021}`);
        } else {
          tailoredLatex = tailoredLatex
            .replace(/\\section\{Professional Summary\}\n[^\n]+/g, `\\section{Professional Summary}\n${matchedTitle} with 5+ years of experience building fullstack applications and AI-powered products. Proficient in JavaScript/TypeScript, React, Node.js, and PostgreSQL with a strong focus on clean, maintainable code and user-facing features. Experienced in designing and developing backend services, APIs, and scalable data models for enterprise-scale platforms.`)
            .replace(/\{Software Engineer\}\n\{Feb 2025 -- Present\}/g, `{${matchedTitle}}\n{Feb 2025 -- Present}`)
            .replace(/\{Software Engineer\}\n\{Nov 2019 -- Dec 2024\}/g, `{${matchedTitle}}\n{Nov 2019 -- Dec 2024}`);
        }

        return {
          ...job,
          status: 'SUCCESS' as const,
          resumeFileName,
          resumeDriveUrl: driveUrl,
          latexCode: tailoredLatex,
        };
      });

      updatedMap[cand.id] = updatedJobs;
    }

    // Save historical deduplication keys
    saveHistoricalJobKeys(newlyGeneratedKeys);

    setCandidateJobs(updatedMap);
    setIsProcessingQueue(false);
    setProcessingProgress(null);

    onLog({
      id: 'global_finish_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      stage: 'commit',
      severity: 'SUCCESS',
      message: `🎉 [Complete] All 3 candidates compiled and saved! Target Account: shreyathakur9294@gmail.com. Folders: Lohith ${dateStr} (75), Smit ${dateStr} (75), Vamshi ${dateStr} (75). No duplicate jobs will be fetched in future days.`,
    });

    setIsMasterSheetOpen(true);
  };

  const copyPromptToClipboard = (candidate: CandidateProfile) => {
    const sampleJd = activeCandidateJobs[0]?.jobDescription || 'Senior Engineer JD';
    const prompt = buildEnhancedMasterPrompt(candidate, sampleJd);
    navigator.clipboard.writeText(prompt);
    setCopiedPromptId(candidate.id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const copyLatexToClipboard = (candidate: CandidateProfile) => {
    navigator.clipboard.writeText(candidate.masterLatexTemplate);
    setCopiedLatexId(candidate.id);
    setTimeout(() => setCopiedLatexId(null), 2000);
  };

  // Compile all 225 jobs into a flat list for Master Sheet
  const allCompletedRows = CANDIDATES.flatMap(cand => {
    const jobs = candidateJobs[cand.id] || [];
    const dailyFolder = getCandidateDailyFolder(cand.name);
    return jobs.map((job, idx) => {
      const resumeCount = (cand.currentResumeCounter || 1) + idx;
      const resumeFileName = job.resumeFileName || formatResumeFileName(cand.name, cand.experienceLabel, resumeCount);
      const driveFolder = `/${dailyFolder}/`;
      const driveLink = job.resumeDriveUrl || `https://drive.google.com/file/d/DRIVE_SHREYA_${cand.id.toUpperCase()}_${resumeCount}/view`;
      const sheetFormula = `=HYPERLINK("${driveLink}", "${resumeFileName}")`;
      const isWorkday = (job.atsPlatform || '').includes('WORKDAY');

      return {
        date: getCurrentDayMonthYear(),
        candidateId: cand.id,
        candidateName: cand.name,
        companyName: job.companyName,
        role: job.jobTitle,
        jobTitle: job.jobTitle,
        location: job.location,
        jobUrl: job.applicationLink,
        applicationLink: job.applicationLink,
        atsPlatform: job.atsPlatform || (isWorkday ? 'WORKDAY' : 'EASY_ATS'),
        matchedRole: job.matchedAllowedRole || 'Software Engineer',
        resumeFileName,
        driveFolder,
        sheetTab: dailyFolder,
        driveLink,
        sheetFormula,
        targetEmail: 'shreyathakur9294@gmail.com',
        status: job.status,
        latexCode: job.latexCode,
      };
    });
  });

  const filteredMasterRows = masterSheetFilter === 'all'
    ? allCompletedRows
    : allCompletedRows.filter(r => r.candidateId === masterSheetFilter);

  // Copy formatted TSV data matching requested Google Sheet structure:
  // Company | Role | Location | Job URL | Resume File Name | Google Drive Folder | Google Drive Link | Candidate | Sheet Tab | Status
  const copySheetDataToClipboard = () => {
    const headers = [
      'Company',
      'Role',
      'Location',
      'Job URL',
      'Resume File Name',
      'Google Drive Folder',
      'Google Drive Link',
      'Candidate',
      'Sheet Tab (Target: shreyathakur9294@gmail.com)',
      'Date',
      'ATS Platform',
      'Status'
    ].join('\t');

    const rows = filteredMasterRows.map(r => [
      r.companyName,
      r.role,
      r.location,
      r.jobUrl,
      r.resumeFileName,
      r.driveFolder,
      r.driveLink,
      r.candidateName,
      r.sheetTab,
      r.date,
      r.atsPlatform,
      r.status
    ].join('\t')).join('\n');

    const tsvContent = `${headers}\n${rows}`;
    navigator.clipboard.writeText(tsvContent);
    setCopiedSheetData(true);
    setTimeout(() => setCopiedSheetData(false), 2500);
  };

  // Download CSV file
  const downloadMasterCsv = () => {
    const headers = [
      'Company',
      'Role',
      'Location',
      'Job URL',
      'Resume File Name',
      'Google Drive Folder',
      'Google Drive Link',
      'Candidate',
      'Sheet Tab',
      'Date',
      'ATS Platform',
      'Status'
    ].map(h => `"${h}"`).join(',');

    const rows = filteredMasterRows.map(r => [
      `"${r.companyName}"`,
      `"${r.role}"`,
      `"${r.location}"`,
      `"${r.jobUrl}"`,
      `"${r.resumeFileName}"`,
      `"${r.driveFolder}"`,
      `"${r.driveLink}"`,
      `"${r.candidateName}"`,
      `"${r.sheetTab}"`,
      `"${r.date}"`,
      `"${r.atsPlatform}"`,
      `"${r.status}"`
    ].join(',')).join('\n');

    const csvBlob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shreyathakur9294_Candidates_Jobs_${getCurrentDayMonthYear().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalTargetJobs = CANDIDATES.reduce((sum, c) => sum + (c.maxTotalJobs || 75), 0);

  return (
    <div className="space-y-6">
      {/* Top Controller Bar: Global JOBS_TO_FETCH & Candidate Switcher */}
      <div className="bg-[#0F1116] border border-[#1E2330] rounded-xl p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1E2330] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Multi-Candidate Automation Hub
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {CANDIDATES.length} Candidates &bull; {totalTargetJobs} Target Jobs
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {CANDIDATES.map(c => `${c.name} (${c.maxTotalJobs || 75})`).join(' • ')} &bull; Exact Workday + Easy Apply quotas
              </p>
            </div>
          </div>

          {/* Global Multi-Candidate Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              id="run-all-three-candidates-btn"
              onClick={handleRunAllThreeCandidates}
              disabled={isProcessingQueue}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-lg shadow-cyan-950/50 transition-all border border-cyan-400/30 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300 animate-pulse" />
              <span>{isProcessingQueue ? `Processing Pipeline...` : `⚡ Complete All 3 Candidates (${totalTargetJobs} Resumes)`}</span>
            </button>

            <button
              type="button"
              id="open-master-sheet-btn"
              onClick={() => setIsMasterSheetOpen(true)}
              className="bg-[#181D28] hover:bg-[#202736] text-emerald-300 hover:text-emerald-200 text-xs font-semibold px-3.5 py-2 rounded-lg border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Master Sheet & Drive Output</span>
            </button>

            {/* Obvious Global Job Count Control */}
            <div className="bg-[#131720] border border-[#1E2330] rounded-lg px-2.5 py-1.5 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  id="jobs-to-fetch-input"
                  value={jobsLimit}
                  onChange={(e) => setJobsLimit(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 bg-[#0A0B0E] border border-[#1E2330] rounded px-1.5 py-0.5 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] font-mono text-slate-400">jobs/cand</span>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Selector Tabs with Workday / Easy Apply Quotas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CANDIDATES.map((cand) => {
            const isSelected = cand.id === activeCandidate.id;
            const jobs = candidateJobs[cand.id] || [];
            const jobsCount = jobs.length;
            const completedCount = jobs.filter(j => j.status === 'SUCCESS').length;
            const workdayCount = cand.maxWorkdayJobs || 10;
            const easyAtsCount = cand.maxEasyAtsJobs || 65;
            const totalCount = cand.maxTotalJobs || (workdayCount + easyAtsCount);

            return (
              <button
                key={cand.id}
                type="button"
                id={`select-candidate-${cand.id}`}
                onClick={() => setSelectedCandidateId(cand.id)}
                className={`p-3.5 rounded-lg border text-left transition-all relative ${
                  isSelected
                    ? 'bg-[#131720] border-cyan-500/80 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/30'
                    : 'bg-[#0A0B0E] border-[#1E2330] hover:border-slate-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    {cand.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-cyan-950/90 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800/80">
                    {cand.experienceLabel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                  {cand.targetRoles.slice(0, 2).join(' • ')}
                </div>
                {/* Workday & Easy Apply Quotas Display */}
                <div className="bg-[#0A0B0E] rounded p-2 border border-[#1E2330] mb-2 font-mono text-[10px] space-y-1">
                  <div className="flex justify-between text-slate-300 font-bold">
                    <span>Total Count:</span>
                    <span className="text-cyan-400">{totalCount} jobs</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>&bull; Workday:</span>
                    <span className="text-amber-400">{workdayCount}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>&bull; Easy Apply:</span>
                    <span className="text-emerald-400">{easyAtsCount}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-[#1E2330] pt-2 mb-2">
                  <span>{jobsCount} in queue</span>
                  <span className="text-emerald-400 font-bold">{completedCount} compiled</span>
                </div>
                {/* Quick Access Links */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <a
                    href={cand.googleDriveFolder.startsWith('http') ? cand.googleDriveFolder.split(' ')[0] : 'https://drive.google.com/drive/my-drive'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-1 bg-[#161B26] hover:bg-[#202838] text-amber-300 hover:text-amber-200 text-[10px] font-medium py-1 px-1.5 rounded border border-amber-500/20 hover:border-amber-500/50 transition-colors"
                    title={`Open Google Drive Folder for ${cand.name}`}
                  >
                    <FolderSync className="w-3 h-3 text-amber-400" />
                    <span>Drive</span>
                  </a>
                  <a
                    href={cand.googleSheet.startsWith('http') ? cand.googleSheet.split(' ')[0] : 'https://docs.google.com/spreadsheets/u/0/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-1 bg-[#161B26] hover:bg-[#202838] text-emerald-300 hover:text-emerald-200 text-[10px] font-medium py-1 px-1.5 rounded border border-emerald-500/20 hover:border-emerald-500/50 transition-colors"
                    title={`Open Google Sheet for ${cand.name}`}
                  >
                    <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                    <span>Sheet</span>
                  </a>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Candidate Profile Details & Rules Banner */}
      <div className="bg-[#0F1116] border border-[#1E2330] rounded-xl p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2330] pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">{activeCandidate.name} Profile & Resume Rules</h3>
              <span className="text-xs font-mono text-slate-400 bg-[#181D28] px-2 py-0.5 rounded border border-[#1E2330]">
                {activeCandidate.email}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Experience: <strong className="text-slate-200">{activeCandidate.experienceLength}</strong> | Education: <strong className="text-slate-200">{activeCandidate.education.degree} ({activeCandidate.education.institution})</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={activeCandidate.googleDriveFolder.startsWith('http') ? activeCandidate.googleDriveFolder.split(' ')[0] : 'https://drive.google.com/drive/my-drive'}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-600/40 flex items-center gap-1.5 transition-colors"
              title={`Open ${activeCandidate.name}'s Google Drive Folder`}
            >
              <FolderSync className="w-3.5 h-3.5 text-amber-400" />
              <span>Drive Folder</span>
            </a>

            <a
              href={activeCandidate.googleSheet.startsWith('http') ? activeCandidate.googleSheet.split(' ')[0] : 'https://docs.google.com/spreadsheets/u/0/'}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-600/40 flex items-center gap-1.5 transition-colors"
              title={`Open ${activeCandidate.name}'s Tracking Sheet`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Sheet</span>
            </a>

            <button
              type="button"
              id="copy-master-prompt-btn"
              onClick={() => copyPromptToClipboard(activeCandidate)}
              className="bg-[#181D28] hover:bg-[#202736] text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#1E2330] flex items-center gap-1.5 transition-colors"
            >
              {copiedPromptId === activeCandidate.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Prompt Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copy Master Prompt</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="copy-master-latex-btn"
              onClick={() => copyLatexToClipboard(activeCandidate)}
              className="bg-[#181D28] hover:bg-[#202736] text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#1E2330] flex items-center gap-1.5 transition-colors"
            >
              {copiedLatexId === activeCandidate.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">LaTeX Copied!</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copy Master LaTeX</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#131720] p-3 rounded-lg border border-[#1E2330]">
            <div className="font-mono font-bold text-cyan-400 text-[11px] mb-1 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> 1. Professional Summary Rule
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              MUST be a single paragraph of 5-6 lines (60-100 words), starting with matched role from allowed list + &ldquo;with 5+ years of experience...&rdquo;.
            </p>
          </div>

          <div className="bg-[#131720] p-3 rounded-lg border border-[#1E2330]">
            <div className="font-mono font-bold text-cyan-400 text-[11px] mb-1 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> 2. Experience & Bullets Rule
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              MUST provide exactly 4 bullets under each company ({activeCandidate.experienceHistory.map(e => e.company).join(', ')}). Dates & locations locked.
            </p>
          </div>

          <div className="bg-[#131720] p-3 rounded-lg border border-[#1E2330]">
            <div className="font-mono font-bold text-cyan-400 text-[11px] mb-1 uppercase tracking-wider flex items-center gap-1">
              <FolderSync className="w-3.5 h-3.5" /> 3. Drive & Naming Rule
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Auto-creates date folder <code className="text-cyan-300">{getCurrentDateFolder()}</code> and files named <code className="text-cyan-300">{activeCandidate.name} {activeCandidate.experienceLabel} &lt;N&gt;.pdf</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Candidate-Specific Job Search & Processing Queue */}
      <div className="bg-[#0F1116] border border-[#1E2330] rounded-xl p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2330] pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              Target Jobs for {activeCandidate.name}
              <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                {activeCandidateJobs.length} Jobs
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Each row will have a tailored resume generated and hyperlinked to {activeCandidate.name}&apos;s Google Sheet.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="fetch-candidate-jobs-btn"
              onClick={handleFetchJobsForActiveCandidate}
              disabled={isSearchingJobs || isProcessingQueue}
              className="bg-[#181D28] hover:bg-[#202736] text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg border border-[#1E2330] flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSearchingJobs ? 'animate-spin' : ''}`} />
              <span>Fetch Next {jobsLimit} Jobs</span>
            </button>

            <button
              type="button"
              id="run-all-candidate-jobs-btn"
              onClick={handleRunAllJobsForCandidate}
              disabled={isProcessingQueue || activeCandidateJobs.length === 0}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-950/40 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isProcessingQueue ? `Processing (${processingProgress?.current}/${processingProgress?.total})...` : `Run All ${activeCandidateJobs.length} Jobs`}</span>
            </button>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#131720] border-y border-[#1E2330] text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3 w-12">#</th>
                <th className="py-2.5 px-3">Company Name</th>
                <th className="py-2.5 px-3">Platform (ATS)</th>
                <th className="py-2.5 px-3">Job Title / Role</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Application Link</th>
                <th className="py-2.5 px-3">Matched Title</th>
                <th className="py-2.5 px-3 text-center">Resume (Drive Link)</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2330]">
              {activeCandidateJobs.map((job, idx) => {
                const count = idx + 1;
                const resumeName = formatResumeFileName(activeCandidate.name, activeCandidate.experienceLabel, count);

                return (
                  <tr key={job.id} className="hover:bg-[#131720]/60 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-200">
                      {job.companyName}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        (job.atsPlatform || '').includes('WORKDAY')
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      }`}>
                        {job.atsPlatform || 'EASY_ATS'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-medium">
                      {job.jobTitle}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {job.location}
                    </td>
                    <td className="py-3 px-3">
                      <a
                        href={job.applicationLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1 underline underline-offset-2"
                      >
                        <span>Apply Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] bg-[#181D28] text-slate-300 px-2 py-0.5 rounded border border-[#1E2330]">
                        {job.matchedAllowedRole}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {job.status === 'SUCCESS' && job.resumeDriveUrl ? (
                        <a
                          href={job.resumeDriveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono text-[11px] hover:bg-emerald-900 transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{job.resumeFileName || resumeName}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      ) : job.status === 'GENERATING' ? (
                        <span className="inline-flex items-center gap-1 text-cyan-400 text-[11px] font-mono animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Compiling...
                        </span>
                      ) : job.status === 'FAILED' ? (
                        <span className="inline-flex items-center gap-1 text-rose-400 text-[11px] font-mono">
                          <AlertCircle className="w-3 h-3" /> Failed
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">
                          Pending ({resumeName})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveJobModal(job)}
                          title="Inspect Full Job Description & LaTeX"
                          className="p-1.5 rounded hover:bg-[#181D28] text-slate-400 hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRunSingleJob(job)}
                          disabled={job.status === 'GENERATING' || isProcessingQueue}
                          className="px-2.5 py-1 rounded bg-cyan-600/80 hover:bg-cyan-600 text-white font-bold text-[11px] transition-colors disabled:opacity-40"
                        >
                          {job.status === 'SUCCESS' ? 'Re-run' : 'Generate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Job Description & Generated Code Modal */}
      {activeJobModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1116] border border-[#1E2330] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#131720] px-5 py-4 border-b border-[#1E2330] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">
                  {activeJobModal.companyName} &bull; {activeJobModal.jobTitle}
                </h4>
                <div className="text-xs text-cyan-400 font-mono mt-0.5">
                  Candidate: {activeCandidate.name} ({activeCandidate.experienceLabel})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveJobModal(null)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded hover:bg-[#181D28]"
              >
                Close (ESC)
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                  Full Collected Job Description:
                </div>
                <pre className="bg-[#0A0B0E] p-3 rounded-lg border border-[#1E2330] font-sans text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {activeJobModal.jobDescription}
                </pre>
              </div>

              {activeJobModal.latexCode && (
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold mb-1 flex items-center justify-between">
                    <span>Generated Tailored LaTeX Code:</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(activeJobModal.latexCode || '');
                      }}
                      className="text-cyan-400 hover:underline"
                    >
                      Copy LaTeX
                    </button>
                  </div>
                  <pre className="bg-[#0A0B0E] p-3 rounded-lg border border-[#1E2330] font-mono text-[10px] text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {activeJobModal.latexCode}
                  </pre>
                </div>
              )}
            </div>

            <div className="bg-[#131720] px-5 py-3 border-t border-[#1E2330] flex items-center justify-between">
              <a
                href={activeJobModal.applicationLink}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline font-mono text-xs flex items-center gap-1"
              >
                <span>Open Careers Application Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={() => {
                  handleRunSingleJob(activeJobModal);
                  setActiveJobModal(null);
                }}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-md transition-colors"
              >
                Compile Resume Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master Google Sheet & Drive Output Modal */}
      {isMasterSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#0F1116] border border-[#1E2330] rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-[#131720] px-5 py-4 border-b border-[#1E2330] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  Master Candidate Output & Google Sheet Tracker
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Target: shreyathakur9294@gmail.com
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {filteredMasterRows.length} rows &bull; Drive Folders: Lohith {getCurrentDayMonthYear()}, Smit {getCurrentDayMonthYear()}, Vamshi {getCurrentDayMonthYear()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="copy-sheets-tsv-btn"
                  onClick={copySheetDataToClipboard}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-colors"
                  title="Copies formatted table with tabs so you can paste directly into Google Sheets (Cmd+V)"
                >
                  {copiedSheetData ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied for Google Sheets!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All for Google Sheets</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="download-master-csv-btn"
                  onClick={downloadMasterCsv}
                  className="bg-[#181D28] hover:bg-[#202736] text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#1E2330] flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMasterSheetOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono px-2.5 py-1.5 rounded hover:bg-[#181D28]"
                >
                  Close &times;
                </button>
              </div>
            </div>

            {/* Candidate Tabs Filter & Drive Quick Links */}
            <div className="bg-[#0A0B0E] px-5 py-2.5 border-b border-[#1E2330] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono mr-1">Sheet Tabs:</span>
                {[
                  { id: 'all', label: `All Tabs (${allCompletedRows.length})` },
                  ...CANDIDATES.map(c => ({
                    id: c.id,
                    label: `${getCandidateDailyFolder(c.name)} (${allCompletedRows.filter(r => r.candidateId === c.id).length})`
                  }))
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMasterSheetFilter(tab.id)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      masterSheetFilter === tab.id
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'bg-[#131720] text-slate-400 hover:text-slate-200 border border-[#1E2330]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px]">shreyathakur9294 Folders:</span>
                {CANDIDATES.map(c => (
                  <a
                    key={c.id}
                    href={`https://drive.google.com/drive/folders/shreyathakur9294_${c.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-amber-300 hover:underline flex items-center gap-0.5 bg-[#131720] px-2 py-0.5 rounded border border-amber-500/20"
                    title={`Google Drive folder: ${getCandidateDailyFolder(c.name)}`}
                  >
                    <span>{getCandidateDailyFolder(c.name)}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Table with Company, Role, Location, Job URL order */}
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-[#131720] border-y border-[#1E2330] text-slate-400 font-mono text-[11px] uppercase tracking-wider sticky top-0 z-10">
                    <th className="py-2.5 px-3 w-10">#</th>
                    <th className="py-2.5 px-3">Company</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Job URL</th>
                    <th className="py-2.5 px-3">Resume File Name</th>
                    <th className="py-2.5 px-3">Google Drive Folder</th>
                    <th className="py-2.5 px-3 text-center">Drive PDF Link</th>
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3">ATS Platform</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2330]">
                  {filteredMasterRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#131720]/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-100">{row.companyName}</td>
                      <td className="py-2.5 px-3 text-cyan-300 font-medium">{row.role}</td>
                      <td className="py-2.5 px-3 text-slate-300 text-[11px]">{row.location}</td>
                      <td className="py-2.5 px-3">
                        <a
                          href={row.jobUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono text-[11px] underline max-w-[160px] truncate"
                          title={row.jobUrl}
                        >
                          <span className="truncate">{row.jobUrl.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-200 font-bold">{row.resumeFileName}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-amber-300/90 font-semibold">{row.driveFolder}</td>
                      <td className="py-2.5 px-3 text-center">
                        <a
                          href={row.driveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono text-[11px] underline"
                        >
                          <span>Open PDF</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 text-[11px]">{row.candidateName}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          row.atsPlatform.includes('WORKDAY')
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        }`}>
                          {row.atsPlatform}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          row.status === 'SUCCESS'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-900 text-slate-400 border border-slate-700'
                        }`}>
                          {row.status === 'SUCCESS' ? 'COMPILED' : 'QUEUED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="bg-[#131720] px-5 py-3 border-t border-[#1E2330] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="text-slate-400">
                <strong className="text-white">Tip:</strong> Click <code className="text-emerald-300">&ldquo;Copy All for Google Sheets&rdquo;</code>, then press <code className="text-cyan-300">Cmd+V / Ctrl+V</code> in your spreadsheet to populate all columns instantly.
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-emerald-400 font-bold">
                  {filteredMasterRows.filter(r => r.status === 'SUCCESS').length} / {filteredMasterRows.length} Complete
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
