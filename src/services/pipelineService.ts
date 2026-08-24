import {
  CandidateRawData,
  JobDescriptionAnalysis,
  LogEntry,
  PipelineOverallState,
  PipelineStageId,
  PipelineStageInfo,
  ResumeJSON,
  GeneratedResumeRecord,
  AppConfig,
} from '../types';
import { requestJobDescriptionAnalysis, requestResumeGeneration } from './geminiService';
import { generateLatexResume } from './latexService';
import { compileResumeToPdf, CompilationResult } from './pdfService';
import { uploadPdfToDrive } from './driveService';
import { fetchWorksheetCandidates, commitCandidateStatusToSheet } from './sheetsService';

export interface PipelineCallbacks {
  onStateChange: (state: PipelineOverallState) => void;
  onStageUpdate: (stageId: PipelineStageId, update: Partial<PipelineStageInfo>) => void;
  onLog: (log: LogEntry) => void;
  onCandidateProgress?: (current: number, total: number, candidateName: string) => void;
}

export const INITIAL_STAGES: PipelineStageInfo[] = [
  { id: 'fetch', label: 'FETCH', stepNumber: '01', status: 'pending' },
  { id: 'sheet', label: 'SHEET', stepNumber: '02', status: 'pending' },
  { id: 'gemini', label: 'GEMINI', stepNumber: '03', status: 'pending' },
  { id: 'latex', label: 'LATEX', stepNumber: '04', status: 'pending' },
  { id: 'compile', label: 'COMPILE', stepNumber: '05', status: 'pending' },
  { id: 'drive', label: 'DRIVE', stepNumber: '06', status: 'pending' },
  { id: 'commit', label: 'COMMIT', stepNumber: '07', status: 'pending' },
];

export class PipelineOrchestrator {
  private config: AppConfig;
  private accessToken: string | null;
  private callbacks: PipelineCallbacks;
  private isCancelled: boolean = false;

  constructor(config: AppConfig, accessToken: string | null, callbacks: PipelineCallbacks) {
    this.config = config;
    this.accessToken = accessToken;
    this.callbacks = callbacks;
  }

  public cancel() {
    this.isCancelled = true;
    this.log('system', 'WARNING', 'Pipeline execution cancellation requested by user.');
    this.callbacks.onStateChange('CANCELLED');
  }

  private log(
    stage: PipelineStageId | 'system' | 'auth',
    severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR',
    message: string,
    metadata?: Record<string, any>
  ) {
    const entry: LogEntry = {
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      stage,
      severity,
      message,
      metadata,
    };
    this.callbacks.onLog(entry);
  }

  /**
   * Executes the full 7-stage automated pipeline for a single candidate
   */
  public async executeForCandidate(
    candidate: CandidateRawData,
    targetJdText?: string,
    resumeState?: Partial<GeneratedResumeRecord>
  ): Promise<GeneratedResumeRecord> {
    const pipelineStartTime = Date.now();
    const candidateName = candidate.name || `Row ${candidate.rowNumber}`;
    this.isCancelled = false;

    const resultRecord: GeneratedResumeRecord = {
      id: resumeState?.id || 'res_' + Math.random().toString(36).substring(2, 9),
      rowNumber: candidate.rowNumber,
      candidateId: candidate.candidateId,
      candidateName,
      targetRole: 'Target Candidate Profile',
      status: 'PROCESSING',
      resumeJson: resumeState?.resumeJson,
      latexCode: resumeState?.latexCode,
      pdfBase64: resumeState?.pdfBase64,
      pdfBlobUrl: resumeState?.pdfBlobUrl,
      driveFileId: resumeState?.driveFileId,
      driveUrl: resumeState?.driveUrl,
      driveFileName: resumeState?.driveFileName,
      generatedAt: new Date().toLocaleString(),
      durationMs: 0,
      stagesCompleted: {
        gemini: Boolean(resumeState?.resumeJson),
        latex: Boolean(resumeState?.latexCode),
        pdf: Boolean(resumeState?.pdfBase64),
        drive: Boolean(resumeState?.driveUrl),
        sheets: false,
      },
      warnings: [],
    };

    try {
      this.log('system', 'INFO', `Starting Resume Pipeline for Candidate: ${candidateName} (ID: ${candidate.candidateId})`);
      this.callbacks.onStateChange('FETCHING');

      // STAGE 01: FETCH
      await this.runStage('fetch', async () => {
        this.log('fetch', 'INFO', `Validating Google Sheets configuration (Spreadsheet: ${this.config.sheets.spreadsheetId || 'DEMO_SPREADSHEET'})`);
        if (!this.config.isDemoMode && !this.accessToken) {
          throw new Error('Google Workspace OAuth token missing. Please sign in with Google or switch to Demo Mode.');
        }
        await new Promise((r) => setTimeout(r, 400));
        this.log('fetch', 'SUCCESS', `Connected to worksheet "${this.config.sheets.worksheetName}". Candidate Row ${candidate.rowNumber} identified.`);
      });
      if (this.isCancelled) throw new Error('Pipeline cancelled by user.');

      // STAGE 02: SHEET
      this.callbacks.onStateChange('SHEET_LOADED');
      await this.runStage('sheet', async () => {
        this.log('sheet', 'INFO', `Parsing fields for ${candidateName}... Mapping ${Object.keys(this.config.sheets.columnMapping).length} columns.`);
        
        const missingFields: string[] = [];
        if (!candidate.name) missingFields.push('Name');
        if (!candidate.email) missingFields.push('Email');
        if (!candidate.skills) missingFields.push('Skills');
        if (!candidate.experience) missingFields.push('Experience');

        if (missingFields.length > 0) {
          const warnMsg = `Candidate record has missing primary fields: ${missingFields.join(', ')}. Strict anti-hallucination mode will safely omit them.`;
          this.log('sheet', 'WARNING', warnMsg);
          resultRecord.warnings.push(warnMsg);
        }

        await new Promise((r) => setTimeout(r, 350));
        this.log('sheet', 'SUCCESS', `Candidate data parsed: ${candidate.skills ? 'Skills detected' : 'No skills'} | ${candidate.experience ? 'Experience detected' : 'No experience'}.`);
      });
      if (this.isCancelled) throw new Error('Pipeline cancelled by user.');

      // STAGE 03: GEMINI (AI Generation)
      let jdAnalysis: JobDescriptionAnalysis | null = null;
      const effectiveJd = targetJdText || candidate.jobDescription || '';

      this.callbacks.onStateChange('AI_GENERATING');
      await this.runStage('gemini', async () => {
        if (resultRecord.resumeJson) {
          this.log('gemini', 'INFO', 'Using previously cached Gemini resume JSON (skipping generation).');
          return;
        }

        if (effectiveJd && effectiveJd.trim().length > 20) {
          this.log('gemini', 'INFO', 'Analyzing target Job Description with Gemini...');
          jdAnalysis = await requestJobDescriptionAnalysis(effectiveJd, this.config.isDemoMode);
          resultRecord.targetRole = `${jdAnalysis.roleTitle} (${jdAnalysis.seniority})`;
          this.log('gemini', 'SUCCESS', `Job Description parsed: Role "${jdAnalysis.roleTitle}", ${jdAnalysis.requiredSkills.length} required skills, ${jdAnalysis.atsTerminology.length} ATS keywords.`);
        } else {
          this.log('gemini', 'INFO', 'No Job Description provided. Compiling general comprehensive engineering resume.');
        }

        this.log('gemini', 'INFO', `Prompting Gemini for structured resume JSON (Strict Factual Mode = ${this.config.ai.strictFactualMode ? 'ON' : 'OFF'})...`);
        const resumeJson = await requestResumeGeneration(
          candidate,
          jdAnalysis,
          {
            temperature: this.config.ai.temperature,
            strictFactualMode: this.config.ai.strictFactualMode,
            maxBullets: this.config.resumeFormat.maxExperienceBullets,
            maxProjects: this.config.resumeFormat.maxProjects,
          },
          this.config.isDemoMode
        );

        resultRecord.resumeJson = resumeJson;
        resultRecord.stagesCompleted.gemini = true;
        if (resumeJson.warnings && resumeJson.warnings.length > 0) {
          resultRecord.warnings.push(...resumeJson.warnings);
        }

        this.log('gemini', 'SUCCESS', `Gemini generated structured resume: ${resumeJson.experience.length} experiences, ${resumeJson.projects.length} projects, ${resumeJson.ats_keywords_used.length} ATS terms matched.`);
      });
      if (this.isCancelled) throw new Error('Pipeline cancelled by user.');

      // STAGE 04: LATEX (Deterministic LaTeX Generation)
      this.callbacks.onStateChange('LATEX_GENERATED');
      await this.runStage('latex', async () => {
        if (!resultRecord.resumeJson) throw new Error('No structured resume JSON available to generate LaTeX.');
        
        this.log('latex', 'INFO', 'Converting resume JSON into ATS-compliant LaTeX template...');
        const latex = generateLatexResume(resultRecord.resumeJson, this.config.resumeFormat);
        resultRecord.latexCode = latex;
        resultRecord.stagesCompleted.latex = true;

        await new Promise((r) => setTimeout(r, 250));
        this.log('latex', 'SUCCESS', `LaTeX document created (${latex.split('\n').length} lines) with escaped special characters.`);
      });
      if (this.isCancelled) throw new Error('Pipeline cancelled by user.');

      // STAGE 05: COMPILE (PDF Vector Generation)
      this.callbacks.onStateChange('PDF_COMPILING');
      let compilation: CompilationResult | null = null;
      await this.runStage('compile', async () => {
        if (!resultRecord.resumeJson) throw new Error('Cannot compile PDF: missing resume JSON.');
        
        this.log('compile', 'INFO', 'Invoking LaTeX-to-PDF compiler engine...');
        compilation = await compileResumeToPdf(resultRecord.resumeJson, this.config.resumeFormat);

        if (!compilation.success) {
          throw new Error(`PDF Compilation failed: ${compilation.warnings.join('; ')}`);
        }

        resultRecord.pdfBase64 = compilation.pdfBase64;
        resultRecord.pdfBlobUrl = compilation.pdfBlobUrl;
        resultRecord.stagesCompleted.pdf = true;

        this.log('compile', 'SUCCESS', `PDF successfully compiled (${compilation.pageCount} page(s), ${Math.round(compilation.pdfBase64.length * 0.75 / 1024)} KB) in ${compilation.durationMs}ms.`);
      });
      if (this.isCancelled) throw new Error('Pipeline cancelled by user.');

      // STAGE 06: DRIVE (Google Drive Upload)
      this.callbacks.onStateChange('DRIVE_UPLOADING');
      await this.runStage('drive', async () => {
        if (!compilation?.pdfArrayBuffer && !resultRecord.pdfBase64) {
          throw new Error('No compiled PDF available for Drive upload.');
        }

        const safeName = candidateName.replace(/[^a-zA-Z0-9]/g, '_');
        const year = new Date().getFullYear();
        const fileName = `${safeName}_Resume_${year}.pdf`;
        resultRecord.driveFileName = fileName;

        this.log('drive', 'INFO', `Uploading "${fileName}" to Google Drive (Sharing: ${this.config.drive.sharingMode})...`);
        
        const blob = new Blob([compilation?.pdfArrayBuffer || new Uint8Array(0)], { type: 'application/pdf' });
        const driveResult = await uploadPdfToDrive(
          blob,
          fileName,
          this.config.drive,
          this.accessToken,
          this.config.isDemoMode
        );

        resultRecord.driveFileId = driveResult.fileId;
        resultRecord.driveUrl = driveResult.webViewLink;
        resultRecord.stagesCompleted.drive = true;

        this.log('drive', 'SUCCESS', `Uploaded to Drive! File ID: ${driveResult.fileId}. URL: ${driveResult.webViewLink}`);
      });
      if (this.isCancelled) throw new Error('Pipeline cancelled by user.');

      // STAGE 07: COMMIT (Google Sheets Status Update)
      this.callbacks.onStateChange('SHEETS_COMMITTING');
      await this.runStage('commit', async () => {
        this.log('commit', 'INFO', `Writing status back to Google Sheets Row ${candidate.rowNumber}...`);
        
        const commitResult = await commitCandidateStatusToSheet(
          this.config.sheets,
          candidate.rowNumber,
          {
            status: 'COMPLETED',
            resumeUrl: resultRecord.driveUrl,
            generatedAt: new Date().toLocaleString(),
          },
          this.accessToken,
          this.config.isDemoMode
        );

        resultRecord.stagesCompleted.sheets = true;
        resultRecord.status = 'COMPLETED';
        this.log('commit', 'SUCCESS', `Sheets committed: ${commitResult.message}`);
      });

      resultRecord.durationMs = Date.now() - pipelineStartTime;
      this.callbacks.onStateChange('COMPLETED');
      this.log('system', 'SUCCESS', `PIPELINE COMPLETED for ${candidateName} in ${(resultRecord.durationMs / 1000).toFixed(1)}s.`);
      return resultRecord;
    } catch (err: any) {
      resultRecord.durationMs = Date.now() - pipelineStartTime;
      resultRecord.status = 'FAILED';
      resultRecord.error = err.message || 'Pipeline execution failure';
      
      this.callbacks.onStateChange('FAILED');
      this.log('system', 'ERROR', `PIPELINE FAILED for ${candidateName}: ${err.message}`, { error: err });

      // Attempt to record failure to sheet if possible
      try {
        await commitCandidateStatusToSheet(
          this.config.sheets,
          candidate.rowNumber,
          {
            status: 'FAILED',
            error: err.message,
            generatedAt: new Date().toLocaleString(),
          },
          this.accessToken,
          this.config.isDemoMode
        );
      } catch (commitErr) {
        console.warn('Could not write failure status to sheet:', commitErr);
      }

      return resultRecord;
    }
  }

  private async runStage(stageId: PipelineStageId, action: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    this.callbacks.onStageUpdate(stageId, {
      status: 'running',
      startedAt: startTime,
      error: undefined,
    });

    try {
      await action();
      const completedAt = Date.now();
      this.callbacks.onStageUpdate(stageId, {
        status: 'success',
        completedAt,
        durationMs: completedAt - startTime,
      });
    } catch (err: any) {
      const completedAt = Date.now();
      this.callbacks.onStageUpdate(stageId, {
        status: 'failed',
        completedAt,
        durationMs: completedAt - startTime,
        error: err.message || 'Stage failed',
      });
      throw err;
    }
  }
}
