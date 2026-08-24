import { CandidateRawData, JobDescriptionAnalysis, ResumeJSON } from '../types';

// Helper to call Google Gemini API directly from the client browser
async function callClientGemini(prompt: string, responseJson: boolean = false): Promise<string> {
  const apiKey = localStorage.getItem('gemini_api_key');
  const model = 'gemini-3.6-flash'; // Always target the fixed 3.6-flash model

  if (!apiKey) {
    throw new Error('Gemini API key is not configured in settings.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body: any = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.2
    }
  };

  if (responseJson) {
    body.generationConfig.responseMimeType = 'application/json';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.error?.message || `API error (${res.status})`;
    throw new Error(`Gemini client call failed: ${message}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }
  return text;
}

export async function requestJobDescriptionAnalysis(
  jdText: string,
  isDemoMode: boolean = false
): Promise<JobDescriptionAnalysis> {
  if (isDemoMode) {
    // Return realistic simulated analysis
    return {
      roleTitle: 'Senior Full Stack Cloud Engineer',
      seniority: 'Senior / Lead',
      domain: 'Distributed Cloud Architecture & SaaS',
      requiredSkills: [
        'TypeScript',
        'React',
        'Node.js',
        'AWS (Lambda, ECS, S3)',
        'PostgreSQL',
        'Docker',
        'CI/CD Pipelines',
      ],
      preferredSkills: [
        'GraphQL',
        'Apache Kafka',
        'Terraform',
        'Redis Caching',
        'Kubernetes',
        'AI/LLM Integration',
      ],
      technologies: [
        'React 18',
        'TypeScript',
        'Tailwind CSS',
        'AWS Lambda',
        'PostgreSQL',
        'Redis',
        'Docker',
        'Terraform',
      ],
      responsibilities: [
        'Architect and scale modern React/TypeScript enterprise web portals',
        'Engineer high-throughput Node.js microservices and REST/gRPC APIs',
        'Automate multi-stage CI/CD pipelines with GitHub Actions and Terraform',
        'Optimize PostgreSQL database schemas, indexing, and Redis caching layers',
      ],
      keywords: [
        'Full Stack',
        'Distributed Systems',
        'Cloud-Native',
        'Scalability',
        'High Availability',
        'Microservices',
        'Event-Driven',
      ],
      atsTerminology: [
        'TypeScript',
        'React.js',
        'Node.js',
        'AWS Cloud',
        'PostgreSQL',
        'CI/CD Automation',
        'Docker Containerization',
        'Infrastructure as Code (IaC)',
      ],
      rawText: jdText,
    };
  }

  const clientApiKey = localStorage.getItem('gemini_api_key');
  if (clientApiKey) {
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

    const text = await callClientGemini(prompt, true);
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
  }

  const res = await fetch('/api/gemini/analyze-jd', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jdText }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Gemini analysis failed (${res.status})`);
  }

  const data = await res.json();
  return data.analysis;
}

export async function requestResumeGeneration(
  candidate: CandidateRawData,
  jdAnalysis?: JobDescriptionAnalysis | null,
  options?: {
    temperature?: number;
    strictFactualMode?: boolean;
    maxBullets?: number;
    maxProjects?: number;
  },
  isDemoMode: boolean = false
): Promise<ResumeJSON> {
  if (isDemoMode) {
    // Generate realistic tailored resume without external API
    return {
      candidate: {
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location,
        linkedin: candidate.linkedin,
        github: candidate.github,
        portfolio: candidate.portfolio,
      },
      summary: `High-performing Software Engineer with extensive experience designing resilient cloud-native architectures, high-traffic React web applications, and scalable backend services. Proven track record in TypeScript, Node.js, and AWS infrastructure optimization with a strong focus on system reliability and developer velocity.`,
      skills: [
        {
          category: 'Languages & Core',
          items: ['TypeScript', 'JavaScript', 'Python', 'Go', 'SQL', 'HTML5/CSS3'],
        },
        {
          category: 'Frontend & UI',
          items: ['React 18', 'Next.js', 'Tailwind CSS', 'Redux Toolkit', 'Jest', 'Playwright'],
        },
        {
          category: 'Cloud & Infrastructure',
          items: ['AWS (Lambda, ECS, S3, RDS)', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions CI/CD'],
        },
        {
          category: 'Databases & Storage',
          items: ['PostgreSQL', 'Redis', 'MongoDB', 'DynamoDB'],
        },
      ],
      experience: [
        {
          role: 'Senior Software Engineer',
          company: 'Apex Cloud Systems',
          location: 'San Francisco, CA',
          startDate: 'July 2022',
          endDate: 'Present',
          bullets: [
            'Architected and deployed high-performance React 18/TypeScript web portal serving 450,000+ monthly active users with 99.98% uptime.',
            'Engineered 14 Node.js microservices on AWS ECS using PostgreSQL and Redis caching, cutting average API latency from 320ms to 85ms.',
            'Built automated multi-stage CI/CD pipelines via GitHub Actions and Terraform, accelerating release velocity by 60%.',
            'Mentored 4 junior engineers and spearheaded cross-team code quality standards, decreasing production bug escape rate by 35%.',
          ],
        },
        {
          role: 'Software Engineer',
          company: 'Nexus Digital Labs',
          location: 'Oakland, CA',
          startDate: 'June 2021',
          endDate: 'June 2022',
          bullets: [
            'Developed responsive customer dashboard components in React and Tailwind CSS, increasing user onboarding completion by 22%.',
            'Built RESTful backend endpoints in Node.js/Express with robust JWT authentication and role-based access control.',
            'Designed optimized SQL queries and indexing strategies for PostgreSQL, improving complex analytical query speeds by 40%.',
          ],
        },
      ],
      projects: [
        {
          title: 'Distributed Cloud File Pipeline',
          technologies: ['React', 'Node.js', 'AWS S3', 'Redis', 'Docker'],
          link: 'https://github.com/alexmorgan/cloud-pipeline',
          bullets: [
            'Engineered resilient serverless file processing pipeline uploading and converting 50GB+ daily assets with zero data loss.',
            'Implemented real-time progress updates via WebSockets and Redis pub/sub with sub-100ms client sync latency.',
          ],
        },
        {
          title: 'Enterprise Developer Portal',
          technologies: ['TypeScript', 'Next.js', 'Tailwind CSS', 'PostgreSQL'],
          link: 'https://github.com/alexmorgan/dev-portal',
          bullets: [
            'Created centralized API documentation and sandbox testing console adopted by 120+ internal engineers.',
            'Designed dynamic schema explorer and automated code snippet generator across 4 programming languages.',
          ],
        },
      ],
      education: [
        {
          degree: 'B.S. in Computer Science',
          institution: 'University of California, Berkeley',
          location: 'Berkeley, CA',
          gradDate: '2017 – 2021',
          gpaOrHonors: 'GPA 3.82 / Dean\'s Honors List',
          highlights: ['Coursework in Distributed Systems, Algorithms, and Cloud Computing'],
        },
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect – Associate',
          issuer: 'Amazon Web Services',
          date: '2023',
        },
        {
          name: 'HashiCorp Certified: Terraform Associate',
          issuer: 'HashiCorp',
          date: '2024',
        },
      ],
      achievements: [
        '1st Place Winner – Apex Cloud Hackathon 2023 for Best Cloud Innovation',
        'Author of popular open-source React UI utility with 1,200+ GitHub stars',
      ],
      ats_keywords_used: [
        'TypeScript',
        'React',
        'Node.js',
        'AWS Lambda',
        'ECS',
        'PostgreSQL',
        'Redis',
        'CI/CD Pipelines',
        'Docker',
        'Microservices',
      ],
      warnings: [],
      estimatedPages: 1,
    };
  }

  const clientApiKey = localStorage.getItem('gemini_api_key');
  const maxBullets = options?.maxBullets ?? 5;
  const maxProjects = options?.maxProjects ?? 3;

  if (clientApiKey) {
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

    const text = await callClientGemini(prompt, true);
    let parsed: ResumeJSON;
    try {
      parsed = JSON.parse(text);
    } catch (err: any) {
      const fixedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(fixedText);
    }

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

    parsed.projects = parsed.projects.slice(0, maxProjects);
    parsed.experience = parsed.experience.map(exp => ({
      ...exp,
      bullets: (exp.bullets || []).slice(0, maxBullets),
    }));

    return parsed;
  }

  const res = await fetch('/api/gemini/generate-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidate, jdAnalysis, options }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Gemini resume generation failed (${res.status})`);
  }

  const data = await res.json();
  return data.resumeJson;
}

export async function requestCandidateLatexGeneration(
  candidate: import('../types').CandidateProfile,
  job: import('../types').JobSearchResult,
  isDemoMode: boolean = false
): Promise<string> {
  const { buildEnhancedMasterPrompt } = await import('../data/candidateProfiles');
  const prompt = buildEnhancedMasterPrompt(candidate, job.jobDescription);

  if (isDemoMode) {
    const matchedTitle = job.matchedAllowedRole || candidate.allowedJobTitles[0];
    let customized = candidate.masterLatexTemplate;

    if (candidate.id === 'lohith-s') {
      customized = customized
        .replace(/\\section\{Professional Summary\}\n[^\n]+/g, `\\section{Professional Summary}\n${matchedTitle} with 5+ years of experience in designing, developing, and deploying backend services, web applications, and software solutions. Proficient in Java, Python, JavaScript, and SQL, with a strong background in building scalable REST APIs, managing databases, and automating build pipelines. Proven track record of working across the software development lifecycle to deliver clean, maintainable code and ensure high-quality software releases in Agile environments. Strong problem-solver skilled in troubleshooting complex system issues and collaborating with cross-functional engineering teams.`)
        .replace(/\{Software Engineer\}\n\{May 2025 -- Jul 2026\}/g, `{${matchedTitle}}\n{May 2025 -- Jul 2026}`)
        .replace(/\{Software Engineer\}\n\{May 2019 -- Jul 2023\}/g, `{${matchedTitle}}\n{May 2019 -- Jul 2023}`);
    } else if (candidate.id === 'smit-patel') {
      customized = customized
        .replace(/\\section\{Professional Summary\}\n[^\n]+/g, `\\section{Professional Summary}\n${matchedTitle} with 5+ years of experience leveraging data analysis, database querying, and business intelligence tools to drive process optimization and system enhancements. Proficient in SQL, Python, and Tableau, with a proven track record of translating complex business needs into clear functional specifications. Skilled in stakeholder management, requirements gathering, and coordinating user acceptance testing (UAT) to deliver successful system integrations in Agile environments.`)
        .replace(/\{Business Analyst\}\n\{Jan 2025 -- Present\}/g, `{${matchedTitle}}\n{Jan 2025 -- Present}`)
        .replace(/\{Business Analyst\}\n\{Aug 2021 -- Nov 2022\}/g, `{${matchedTitle}}\n{Aug 2021 -- Nov 2022}`)
        .replace(/\{Data Analyst\}\n\{Aug 2019 -- Jul 2021\}/g, `{${matchedTitle}}\n{Aug 2019 -- Jul 2021}`);
    } else {
      customized = customized
        .replace(/\\section\{Professional Summary\}\n[^\n]+/g, `\\section{Professional Summary}\n${matchedTitle} with 5+ years of experience building fullstack applications and AI-powered products. Proficient in JavaScript/TypeScript, React, Node.js, and PostgreSQL with a strong focus on clean, maintainable code and user-facing features. Experienced in designing and developing backend services, APIs, and scalable data models for enterprise-scale platforms. Passionate about building products that deliver real user value, with deep interest in AI-driven systems and modern system design. Collaborative team player with experience across the full development lifecycle, from feature ideation to production deployment and maintenance.`)
        .replace(/\{Software Engineer\}\n\{Feb 2025 -- Present\}/g, `{${matchedTitle}}\n{Feb 2025 -- Present}`)
        .replace(/\{Software Engineer\}\n\{Nov 2019 -- Dec 2024\}/g, `{${matchedTitle}}\n{Nov 2019 -- Dec 2024}`);
    }

    return customized;
  }

  const clientApiKey = localStorage.getItem('gemini_api_key');
  if (clientApiKey) {
    let raw = await callClientGemini(prompt, false);
    if (raw.startsWith('```latex')) {
      raw = raw.replace(/^```latex\n?/, '').replace(/\n?```$/, '');
    } else if (raw.startsWith('```tex')) {
      raw = raw.replace(/^```tex\n?/, '').replace(/\n?```$/, '');
    } else if (raw.startsWith('```')) {
      raw = raw.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    return raw.trim();
  }

  const res = await fetch('/api/gemini/generate-candidate-latex', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Gemini LaTeX generation failed (${res.status})`);
  }

  const data = await res.json();
  return data.latexCode;
}
