import { GoogleGenAI } from '@google/genai';
import { CandidateRawData, JobDescriptionAnalysis, ResumeJSON } from '../src/types';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

/**
 * Analyzes a Job Description to extract skills, keywords, responsibilities, and ATS terms
 */
export async function analyzeJobDescription(jdText: string): Promise<JobDescriptionAnalysis> {
  const ai = getGenAI();

  const prompt = `You are an expert ATS (Applicant Tracking System) and Technical Recruiter.
Analyze the following Job Description and extract structured information.

JOB DESCRIPTION:
"""
${jdText}
"""

Return a valid JSON object matching this exact TypeScript structure:
{
  "roleTitle": "Exact or inferred role title",
  "seniority": "e.g. Senior, Lead, Mid, Entry",
  "domain": "e.g. Distributed Cloud Systems, Frontend, AI/ML, DevOps",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "technologies": ["tech1", "tech2"],
  "responsibilities": ["responsibility1", "responsibility2"],
  "keywords": ["keyword1", "keyword2"],
  "atsTerminology": ["atsTerm1", "atsTerm2"]
}

Important: Return ONLY valid JSON with no markdown backticks or commentary.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  const text = response.text || '{}';
  try {
    const parsed = JSON.parse(text);
    return {
      roleTitle: parsed.roleTitle || 'Target Role',
      seniority: parsed.seniority || 'Mid/Senior',
      domain: parsed.domain || 'Software Engineering',
      requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
      preferredSkills: Array.isArray(parsed.preferredSkills) ? parsed.preferredSkills : [],
      technologies: Array.isArray(parsed.technologies) ? parsed.technologies : [],
      responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      atsTerminology: Array.isArray(parsed.atsTerminology) ? parsed.atsTerminology : [],
      rawText: jdText,
    };
  } catch (err: any) {
    throw new Error(`Failed to parse Gemini Job Description JSON: ${err.message}. Raw output: ${text.slice(0, 200)}`);
  }
}

/**
 * Generates tailored, structured resume content adhering strictly to anti-hallucination rules.
 */
export async function generateStructuredResume(
  candidate: CandidateRawData,
  jdAnalysis?: JobDescriptionAnalysis | null,
  options?: {
    temperature?: number;
    strictFactualMode?: boolean;
    maxBullets?: number;
    maxProjects?: number;
  }
): Promise<ResumeJSON> {
  const ai = getGenAI();

  const temp = options?.temperature ?? 0.2;
  const maxBullets = options?.maxBullets ?? 5;
  const maxProjects = options?.maxProjects ?? 3;

  const prompt = `You are a strict, factual Enterprise Resume Compiler and ATS Optimization Engine.

CRITICAL ANTI-HALLUCINATION RULES:
1. You must generate resume content based ONLY on the candidate's supplied data.
2. NEVER invent:
   - Companies or employers
   - Job titles or roles
   - Degrees, universities, or graduation dates
   - Dates or durations
   - Certifications or issuing bodies
   - Technologies, programming languages, or tools not mentioned or implied by the candidate's records
   - Achievements, metrics, or revenue numbers not present in the candidate's data
   - Projects, awards, or honors
3. If information is missing (e.g. no phone number, no portfolio, no certifications), leave them empty or null. DO NOT fabricate placeholders.
4. You MAY:
   - Improve sentence structure, grammar, and clarity using strong professional action verbs.
   - Categorize existing technical skills into logical groups (e.g. Languages, Frameworks, Cloud & DevOps, Databases, Tools).
   - Reorder bullets and emphasize skills that match the target Job Description, provided they are factually grounded in the candidate's background.
   - Write a concise professional summary tailored to the target role using ONLY confirmed facts.
5. Record any missing fields or notable factual adjustments in the "warnings" array.
6. List the specific Job Description keywords that were naturally utilized in "ats_keywords_used".

CANDIDATE SOURCE DATA:
Candidate ID: ${candidate.candidateId}
Name: ${candidate.name}
Email: ${candidate.email}
Phone: ${candidate.phone || 'N/A'}
Location: ${candidate.location || 'N/A'}
LinkedIn: ${candidate.linkedin || 'N/A'}
GitHub: ${candidate.github || 'N/A'}
Portfolio: ${candidate.portfolio || 'N/A'}
Raw Summary: ${candidate.summary || 'N/A'}
Raw Education: ${candidate.education || 'N/A'}
Raw Skills: ${candidate.skills || 'N/A'}
Raw Experience: ${candidate.experience || 'N/A'}
Raw Projects: ${candidate.projects || 'N/A'}
Raw Certifications: ${candidate.certifications || 'N/A'}
Raw Achievements: ${candidate.achievements || 'N/A'}

TARGET JOB DESCRIPTION / CONTEXT:
${jdAnalysis ? `
Target Role: ${jdAnalysis.roleTitle} (${jdAnalysis.seniority})
Domain: ${jdAnalysis.domain}
Required Skills: ${jdAnalysis.requiredSkills.join(', ')}
Key Technologies: ${jdAnalysis.technologies.join(', ')}
ATS Keywords: ${jdAnalysis.atsTerminology.join(', ')}
` : candidate.jobDescription || 'Standard Professional Engineering Profile'}

OUTPUT JSON FORMAT REQUIREMENTS:
Return a JSON object conforming EXACTLY to this schema:
{
  "candidate": {
    "name": "Full Name",
    "email": "Email",
    "phone": "Phone or omitted",
    "location": "Location or omitted",
    "linkedin": "LinkedIn URL or omitted",
    "github": "GitHub URL or omitted",
    "portfolio": "Portfolio URL or omitted"
  },
  "summary": "2-3 concise tailored sentences grounded strictly in source data",
  "skills": [
    {
      "category": "e.g. Languages / Frameworks / Cloud & DevOps / Databases",
      "items": ["Skill1", "Skill2"]
    }
  ],
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "location": "Location or omitted",
      "startDate": "e.g. July 2022",
      "endDate": "e.g. Present",
      "bullets": [
        "Strong action verb + factual responsibility/impact (up to ${maxBullets} bullets)"
      ]
    }
  ],
  "projects": [
    {
      "title": "Project Title",
      "technologies": ["Tech1", "Tech2"],
      "link": "URL or omitted",
      "bullets": ["Factual bullet 1", "Factual bullet 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree and Major",
      "institution": "Institution Name",
      "location": "Location or omitted",
      "gradDate": "Graduation Date or Range",
      "gpaOrHonors": "Honors / GPA if present in source",
      "highlights": []
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuer or omitted",
      "date": "Date or omitted"
    }
  ],
  "achievements": ["Achievement 1"],
  "ats_keywords_used": ["Keyword1", "Keyword2"],
  "warnings": ["Warning if any field was missing"],
  "estimatedPages": 1
}

Output ONLY valid JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: temp,
    },
  });

  const text = response.text || '{}';
  let parsed: ResumeJSON;
  try {
    parsed = JSON.parse(text);
  } catch (err: any) {
    // Structured repair attempt
    const fixedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      parsed = JSON.parse(fixedText);
    } catch {
      throw new Error(`Invalid JSON generated by Gemini: ${err.message}`);
    }
  }

  // Sanitize and validate minimum structure
  if (!parsed.candidate || !parsed.candidate.name) {
    parsed.candidate = {
      name: candidate.name || 'Candidate Name',
      email: candidate.email || '',
      phone: candidate.phone || undefined,
      location: candidate.location || undefined,
      linkedin: candidate.linkedin || undefined,
      github: candidate.github || undefined,
      portfolio: candidate.portfolio || undefined,
    };
  }

  if (!Array.isArray(parsed.skills)) parsed.skills = [];
  if (!Array.isArray(parsed.experience)) parsed.experience = [];
  if (!Array.isArray(parsed.projects)) parsed.projects = [];
  if (!Array.isArray(parsed.education)) parsed.education = [];
  if (!Array.isArray(parsed.certifications)) parsed.certifications = [];
  if (!Array.isArray(parsed.achievements)) parsed.achievements = [];
  if (!Array.isArray(parsed.ats_keywords_used)) parsed.ats_keywords_used = [];
  if (!Array.isArray(parsed.warnings)) parsed.warnings = [];

  // Limit counts to settings
  parsed.projects = parsed.projects.slice(0, maxProjects);
  parsed.experience = parsed.experience.map(exp => ({
    ...exp,
    bullets: (exp.bullets || []).slice(0, maxBullets),
  }));

  return parsed;
}

/**
 * Generates tailored LaTeX directly using the Candidate's Master Template, Strict Rules, and the JD
 */
export async function generateCandidateTailoredLatexAI(
  prompt: string
): Promise<string> {
  const ai = getGenAI();

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: {
      temperature: 0.2,
    },
  });

  let raw = response.text?.trim() || '';
  // Clean markdown code fence if AI included it
  if (raw.startsWith('```latex')) {
    raw = raw.replace(/^```latex\n?/, '').replace(/\n?```$/, '');
  } else if (raw.startsWith('```tex')) {
    raw = raw.replace(/^```tex\n?/, '').replace(/\n?```$/, '');
  } else if (raw.startsWith('```')) {
    raw = raw.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  return raw.trim();
}

/**
 * Transcribes recorded audio data (base64) using Gemini
 */
export async function transcribeAudio(audioBase64: string, mimeType: string = 'audio/webm'): Promise<string> {
  const ai = getGenAI();

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: 'Transcribe this voice recording with high accuracy. The audio may contain job descriptions, technical requirements, candidate notes, or resume instructions. Return only the clean transcript.',
          },
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
        ],
      },
    ],
  });

  return response.text?.trim() || '';
}
