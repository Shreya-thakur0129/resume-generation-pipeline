export type PipelineStageId = 
  | 'fetch'
  | 'sheet'
  | 'gemini'
  | 'latex'
  | 'compile'
  | 'drive'
  | 'commit';

export type StageStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

export interface PipelineStageInfo {
  id: PipelineStageId;
  label: string;
  stepNumber: string;
  status: StageStatus;
  startedAt?: number;
  completedAt?: number;
  durationMs?: number;
  detail?: string;
  error?: string;
}

export type PipelineOverallState =
  | 'IDLE'
  | 'FETCHING'
  | 'SHEET_LOADED'
  | 'AI_GENERATING'
  | 'AI_VALIDATED'
  | 'LATEX_GENERATED'
  | 'PDF_COMPILING'
  | 'PDF_READY'
  | 'DRIVE_UPLOADING'
  | 'DRIVE_COMPLETE'
  | 'SHEETS_COMMITTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface LogEntry {
  id: string;
  timestamp: string;
  stage: PipelineStageId | 'system' | 'auth';
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  message: string;
  metadata?: Record<string, any>;
}

export interface CandidateRawData {
  rowNumber: number;
  candidateId: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary?: string;
  education?: string;
  skills?: string;
  experience?: string;
  projects?: string;
  certifications?: string;
  achievements?: string;
  jobDescription?: string;
  status?: string;
  resumeUrl?: string;
  generatedAt?: string;
  error?: string;
  rawRow?: Record<string, string>;
}

export interface JobDescriptionAnalysis {
  roleTitle: string;
  seniority: string;
  domain: string;
  requiredSkills: string[];
  preferredSkills: string[];
  technologies: string[];
  responsibilities: string[];
  keywords: string[];
  atsTerminology: string[];
  rawText: string;
}

export interface ResumeJSON {
  candidate: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  skills: {
    category: string;
    items: string[];
  }[];
  experience: {
    role: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
  projects: {
    title: string;
    technologies: string[];
    link?: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    location?: string;
    gradDate?: string;
    gpaOrHonors?: string;
    highlights?: string[];
  }[];
  certifications?: {
    name: string;
    issuer?: string;
    date?: string;
  }[];
  achievements?: string[];
  ats_keywords_used: string[];
  warnings: string[];
  estimatedPages: number;
}

export interface GeneratedResumeRecord {
  id: string;
  rowNumber: number;
  candidateId: string;
  candidateName: string;
  targetRole: string;
  status: 'COMPLETED' | 'FAILED' | 'PROCESSING';
  resumeJson?: ResumeJSON;
  latexCode?: string;
  pdfBase64?: string;
  pdfBlobUrl?: string;
  driveFileId?: string;
  driveUrl?: string;
  driveFileName?: string;
  generatedAt: string;
  durationMs: number;
  stagesCompleted: {
    gemini: boolean;
    latex: boolean;
    pdf: boolean;
    drive: boolean;
    sheets: boolean;
  };
  warnings: string[];
  error?: string;
  failedStage?: PipelineStageId;
}

export interface ColumnMapping {
  candidateId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
  education: string;
  skills: string;
  experience: string;
  projects: string;
  certifications: string;
  achievements: string;
  jobDescription: string;
  status: string;
  resumeUrl: string;
  generatedAt: string;
  error: string;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  worksheetName: string;
  selectedRow: number;
  columnMapping: ColumnMapping;
}

export type DriveSharingMode = 'PRIVATE' | 'DOMAIN' | 'LINK_ACCESS';

export interface GoogleDriveConfig {
  folderId: string;
  folderName: string;
  createCandidateFolder: boolean;
  sharingMode: DriveSharingMode;
  namingPattern: string; // e.g. "{name}_Resume_{year}.pdf"
}

export interface AISettings {
  model: string;
  temperature: number;
  maxRetries: number;
  strictFactualMode: boolean;
  systemPromptAdditions?: string;
  apiKey?: string;
}

export interface ResumeFormatSettings {
  template: 'classic' | 'modern' | 'minimal' | 'executive';
  pageTarget: 'auto' | '1-page' | '2-page';
  maxExperienceBullets: number;
  maxProjects: number;
  font: 'Computer Modern' | 'Helvetica' | 'Times New Roman' | 'Charter';
  marginSize: 'compact' | 'standard' | 'relaxed';
  showLinkedIn: boolean;
  showGitHub: boolean;
  showPortfolio: boolean;
}

export interface PipelineSettings {
  mode: 'sequential' | 'batch';
  stopOnError: boolean;
  retryCount: number;
  logLevel: 'verbose' | 'standard' | 'minimal';
}

export interface CandidateExperienceConfig {
  company: string;
  dates: string;
  location: string;
  requiredBulletCount: number;
}

export interface CandidateEducationConfig {
  degree: string;
  institution: string;
  gpa?: string;
  hasNoDates: boolean;
}

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  experienceLabel: string;
  experienceLength: string;
  maxWorkdayJobs?: number;
  maxEasyAtsJobs?: number;
  maxTotalJobs?: number;
  targetRoles: string[];
  allowedJobTitles: string[];
  keywords: string[];
  locationPreference: string;
  googleSheet: string;
  googleDriveFolder: string;
  headerContactLine: string;
  allowedSummaryLines: string; // e.g. "5 to 6 lines (60 to 100 words)"
  experienceHistory: CandidateExperienceConfig[];
  education: CandidateEducationConfig;
  masterLatexTemplate: string;
  resumeRulesSummary: string[];
  currentResumeCounter?: number;
}

export interface JobSearchResult {
  id: string;
  candidateId: string;
  candidateName: string;
  companyName: string;
  jobTitle: string;
  location: string;
  applicationLink: string;
  jobDescription: string;
  atsPlatform?: 'WORKDAY' | 'EASY_ATS' | string;
  matchedAllowedRole?: string;
  isDuplicate?: boolean;
  rowNumber?: number;
  resumeFileName?: string;
  resumeDriveUrl?: string;
  latexCode?: string;
  pdfBlobUrl?: string;
  status: 'PENDING' | 'GENERATING' | 'SUCCESS' | 'FAILED';
  error?: string;
  createdAt?: string;
}

export interface AppConfig {
  isDemoMode: boolean;
  jobsToFetch: number;
  activeCandidateId?: string;
  sheets: GoogleSheetsConfig;
  drive: GoogleDriveConfig;
  ai: AISettings;
  resumeFormat: ResumeFormatSettings;
  pipeline: PipelineSettings;
}

