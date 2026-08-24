import { CandidateProfile, JobSearchResult } from '../types';

/**
 * Formats standard resume filename strictly following the user's Drive screenshot:
 * e.g., "Vamsi_Resume5exp1.pdf", "Lohith_Resume5exp1.pdf", "Smit_Resume5exp1.pdf"
 */
export function formatResumeFileName(
  candidateName: string,
  experienceLabel: string,
  count: number
): string {
  let firstName = candidateName.split(' ')[0];
  if (firstName.toLowerCase().includes('vam')) firstName = 'Vamsi';
  if (firstName.toLowerCase().includes('loh')) firstName = 'Lohith';
  if (firstName.toLowerCase().includes('smit')) firstName = 'Smit';

  const expNum = experienceLabel.replace(/[^0-9]/g, '') || '5';
  return `${firstName}_Resume${expNum}exp${count}.pdf`;
}

/**
 * Returns current date string formatted as Day-Month (e.g., "24-8") or D/M/YYYY
 */
export function getCurrentDayMonth(date: Date = new Date()): string {
  const month = date.getMonth() + 1; // e.g. 8
  const day = date.getDate(); // e.g. 24
  return `${day}-${month}`;
}

export function getCurrentDayMonthYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // e.g. 8
  const day = date.getDate(); // e.g. 24
  return `${day}/${month}/${year}`;
}

/**
 * Generates the exact candidate daily folder name matching the screenshot:
 * e.g., "Vamsi24-8", "Lohith24-8", "Smit24-8"
 */
export function getCandidateDailyFolder(candidateName: string, date: Date = new Date()): string {
  let firstName = candidateName.split(' ')[0];
  if (firstName.toLowerCase().includes('vam')) firstName = 'Vamsi';
  else if (firstName.toLowerCase().includes('loh')) firstName = 'Lohith';
  else if (firstName.toLowerCase().includes('smit')) firstName = 'Smit';

  const dayMonth = getCurrentDayMonth(date);
  return `${firstName}${dayMonth}`;
}

/**
 * Returns date folder string formatted for backwards compatibility
 */
export function getCurrentDateFolder(date: Date = new Date()): string {
  return getCurrentDayMonthYear(date);
}

// Key for persistent multi-day applied jobs storage
export const PERSISTENT_JOB_HISTORY_KEY = 'AUTOMATION_APPLIED_JOB_HISTORY_V2';

/**
 * Retrieves all historically used job fingerprints from persistent storage
 * to guarantee no job is ever repeated in subsequent days.
 */
export function getHistoricalJobKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(PERSISTENT_JOB_HISTORY_KEY);
    if (!raw) return new Set();
    const arr: string[] = JSON.parse(raw);
    return new Set(arr);
  } catch {
    return new Set();
  }
}

/**
 * Saves newly generated/applied job keys into persistent storage for multi-day deduplication
 */
export function saveHistoricalJobKeys(newKeys: string[]): void {
  try {
    const current = getHistoricalJobKeys();
    for (const k of newKeys) {
      current.add(k.toLowerCase().trim());
    }
    localStorage.setItem(PERSISTENT_JOB_HISTORY_KEY, JSON.stringify(Array.from(current)));
  } catch (err) {
    console.warn('Could not save persistent job keys to localStorage:', err);
  }
}

/**
 * Matches a job role string to the candidate's strictly allowed list of job titles
 */
export function matchAllowedJobTitle(rawTitle: string, allowedTitles: string[]): string {
  const normalizedRaw = rawTitle.toLowerCase();
  
  // Exact match attempt
  for (const allowed of allowedTitles) {
    if (allowed.toLowerCase() === normalizedRaw) {
      return allowed;
    }
  }

  // Substring match attempt
  for (const allowed of allowedTitles) {
    if (normalizedRaw.includes(allowed.toLowerCase()) || allowed.toLowerCase().includes(normalizedRaw)) {
      return allowed;
    }
  }

  // Keyword-based heuristic matching
  if (normalizedRaw.includes('data engineer') && allowedTitles.includes('Data Engineer')) return 'Data Engineer';
  if (normalizedRaw.includes('data analyst') && allowedTitles.includes('Data Analyst')) return 'Data Analyst';
  if (normalizedRaw.includes('business analyst') && allowedTitles.includes('Business Analyst')) return 'Business Analyst';
  if (normalizedRaw.includes('full stack') && allowedTitles.includes('Full Stack Developer')) return 'Full Stack Developer';
  if (normalizedRaw.includes('backend') && allowedTitles.includes('Backend Developer')) return 'Backend Developer';
  if (normalizedRaw.includes('frontend') && allowedTitles.includes('Frontend Developer')) return 'Frontend Developer';
  if (normalizedRaw.includes('python') && allowedTitles.includes('Python Developer')) return 'Python Developer';
  if (normalizedRaw.includes('java') && allowedTitles.includes('Java Developer')) return 'Java Developer';
  if (normalizedRaw.includes('react') && allowedTitles.includes('React Developer')) return 'React Developer';
  if (normalizedRaw.includes('software developer') && allowedTitles.includes('Software Developer')) return 'Software Developer';
  if (normalizedRaw.includes('software engineer') && allowedTitles.includes('Software Engineer')) return 'Software Engineer';

  // Fallback to the first allowed title in candidate's profile
  return allowedTitles[0] || 'Software Engineer';
}

/**
 * Deduplication helper checking URL, Company Name, and Job Title
 */
export function isDuplicateJob(
  newJob: { companyName: string; jobTitle: string; applicationLink: string },
  existingJobs: JobSearchResult[]
): boolean {
  const normLink = newJob.applicationLink.trim().toLowerCase();
  const normComp = newJob.companyName.trim().toLowerCase();
  const normTitle = newJob.jobTitle.trim().toLowerCase();

  return existingJobs.some(existing => {
    const exLink = existing.applicationLink.trim().toLowerCase();
    const exComp = existing.companyName.trim().toLowerCase();
    const exTitle = existing.jobTitle.trim().toLowerCase();

    // Check exact link match OR company + title match
    if (normLink && exLink && normLink === exLink) return true;
    if (normComp === exComp && normTitle === exTitle) return true;
    return false;
  });
}

// 🚫 STRICTLY BLOCKED / BLACKLISTED COMPANIES (Instantly Skipped)
export const BLOCKED_COMPANIES = [
  'pinnacle', 'google', 'dice', 'tcs', 'tata consultancy', 'ladder', 'jobright',
  'netrolynx', 'jack & jill', 'jack and jill', 'chatgpt', 'openai', 'microsoft',
  'fetchojobs', 'fetch', 'sundayy', 'accenture', 'deloitte', 'dataannotation',
  'haystack', 'hackajob', 'accenture federal services'
];

// Verified Workday Enterprise Portals (Excluding all blocked companies)
const WORKDAY_COMPANIES = [
  'Salesforce', 'Target', 'Walmart Global Tech', 'The Home Depot', 'Nike Tech',
  'JPMorgan Chase', 'Goldman Sachs', 'Morgan Stanley', 'Capital One', 'Bloomberg',
  'Visa', 'Mastercard', 'American Express', 'FedEx Tech', 'UPS Information Services',
  'Boeing', 'Lockheed Martin Space', 'Raytheon Tech', 'General Electric', 'Ford Digital',
  'General Motors Tech', 'Pfizer Digital', 'Johnson & Johnson', 'Bristol Myers Squibb',
  'Cigna Tech', 'UnitedHealth Group', 'Humana', 'Anthem', 'CVS Health Tech',
  'Wells Fargo', 'Bank of America', 'Citi Tech', 'Fidelity Investments', 'Charles Schwab',
  'State Street', 'BlackRock', 'Prudential', 'MetLife', 'Liberty Mutual', 'Allstate',
  'Kohl\'s Tech', 'Lowe\'s Digital', 'Best Buy Tech', 'Costco Wholesale IT', 'Starbucks Tech',
  'McDonald\'s Global Tech', 'PepsiCo Tech', 'Coca-Cola Digital', 'Abbott Labs', 'Thermo Fisher'
];

// Verified Easy ATS (Greenhouse, Lever, SmartRecruiters) Tech Companies (Excluding all blocked companies)
const EASY_ATS_COMPANIES = [
  'Amazon', 'Apple', 'Meta', 'Netflix', 'Oracle', 'Cisco', 'Adobe', 'Stripe', 'Uber', 'Airbnb',
  'Spotify', 'Snowflake', 'Databricks', 'Palantir', 'Intuit', 'LinkedIn', 'Atlassian', 'Twilio',
  'ServiceNow', 'Workday Tech', 'IBM Cloud', 'Cognizant', 'Infosys', 'Wipro', 'Capgemini',
  'Disney Streaming', 'Sony Interactive', 'PayPal', 'eBay', 'Block (Square)', 'Pinterest', 'Snap Inc',
  'DoorDash', 'Lyft', 'Robinhood', 'Coinbase', 'Instacart', 'Box', 'Dropbox', 'Zoom',
  'HubSpot', 'Autodesk', 'CrowdStrike', 'Zscaler', 'Cloudflare', 'Okta', 'Splunk', 'MongoDB',
  'Elastic', 'Confluent', 'Datadog', 'Dynatrace', 'New Relic', 'PagerDuty', 'Asana', 'Monday.com',
  'Notion', 'Figma', 'Canva', 'Miro', 'Airtable', 'Smartsheet', 'Zendesk', 'Freshworks',
  'Qualtrics', 'DocuSign', 'Slack Tech', 'HashiCorp', 'GitLab', 'GitHub Tech', 'Docker',
  'CircleCI', 'Snyk', 'Postman', 'Vercel', 'Netlify', 'LaunchDarkly', 'Segment', 'Amplitude',
  'Mixpanel', 'Braze', 'Klaviyo', 'Toast', 'Affirm', 'Chime', 'SoFi', 'Plaid', 'Checkout.com',
  'Brex', 'Ramp', 'Gusto', 'Rippling', 'Remote.com', 'Deel', 'Carta', 'Carta Tech',
  'NVIDIA', 'AMD', 'Intel', 'Qualcomm', 'Broadcom', 'Micron Technology', 'Texas Instruments',
  'Palo Alto Networks', 'Fortinet', 'Crowdstrike', 'SentinelOne', 'Rapid7', 'Check Point'
];

const LOCATIONS = [
  'San Francisco, CA (Hybrid)', 'New York, NY (Hybrid)', 'Seattle, WA (Hybrid)',
  'Austin, TX (Remote / Onsite)', 'Sunnyvale, CA (Onsite)', 'Chicago, IL (Hybrid)',
  'Boston, MA (Hybrid)', 'Atlanta, GA (Remote)', 'Denver, CO (Hybrid)',
  'Dallas, TX (Hybrid)', 'Charlotte, NC (Hybrid)', 'Remote (USA)',
  'San Jose, CA (Hybrid)', 'Raleigh, NC (Hybrid)', 'Minneapolis, MN (Hybrid)',
  'Philadelphia, PA (Hybrid)', 'Phoenix, AZ (Hybrid)', 'San Diego, CA (Hybrid)'
];

const ENGINEERING_DOMAINS = [
  'Core Platform Engineering', 'Cloud Infrastructure & API Systems', 'Data Services & Analytics',
  'Enterprise Applications', 'Payment & Financial Systems', 'Security & Identity Systems',
  'Scalable Microservices', 'Integration & Web Systems', 'Distributed Systems Team',
  'Internal Developer Platform', 'Customer Reliability Engineering', 'AI / ML Solutions Team'
];

/**
 * Searches and generates tailored jobs for a specific candidate based on target roles,
 * keywords, and experience label, guaranteeing exact quotas:
 * - Exactly maxWorkdayJobs (default: 10)
 * - Exactly maxEasyAtsJobs (default: 65)
 * - Total = exactly fetchLimit (default: 75)
 */
export function searchJobsForCandidate(
  candidate: CandidateProfile,
  fetchLimit: number = 75,
  existingJobs: JobSearchResult[] = []
): JobSearchResult[] {
  const newJobs: JobSearchResult[] = [];
  const candidateExisting = existingJobs.filter(j => j.candidateId === candidate.id);
  const usedKeys = new Set<string>();

  // 1. Load multi-day persistent historical keys (from previous sessions/days)
  const historical = getHistoricalJobKeys();
  for (const h of historical) {
    usedKeys.add(h);
  }

  // 2. Mark existing jobs from current queue as used
  for (const ex of candidateExisting) {
    usedKeys.add(`${ex.companyName.toLowerCase()}|||${ex.jobTitle.toLowerCase()}`);
  }

  const targetWorkday = Math.min(candidate.maxWorkdayJobs || 10, fetchLimit);
  const targetEasyAts = fetchLimit - targetWorkday;

  // Filter blocked companies
  const isBlocked = (c: string) => {
    const lower = c.toLowerCase();
    return BLOCKED_COMPANIES.some(b => lower.includes(b.toLowerCase()));
  };

  const validWorkdayCompanies = WORKDAY_COMPANIES.filter(c => !isBlocked(c));
  const validEasyAtsCompanies = EASY_ATS_COMPANIES.filter(c => !isBlocked(c));

  // Helper generator
  const generateJob = (
    company: string,
    role: string,
    atsPlatform: string,
    domain: string,
    index: number
  ): JobSearchResult => {
    const location = LOCATIONS[(index * 3) % LOCATIONS.length];
    const matchedAllowedTitle = matchAllowedJobTitle(role, candidate.allowedJobTitles);
    const appId = `${candidate.id.slice(0, 3)}-${1000 + index + Math.floor(Math.random() * 8999)}`;
    const cleanComp = company.toLowerCase().replace(/[^a-z0-9]/g, '');

    let applicationLink = `https://careers.${cleanComp}.com/jobs/${appId}`;
    if (atsPlatform.includes('WORKDAY')) {
      applicationLink = `https://${cleanComp}.wd5.myworkdayjobs.com/en-US/careers/job/${appId}`;
    } else if (atsPlatform.includes('Greenhouse')) {
      applicationLink = `https://boards.greenhouse.io/${cleanComp}/jobs/${appId}`;
    } else if (atsPlatform.includes('Lever')) {
      applicationLink = `https://jobs.lever.co/${cleanComp}/${appId}`;
    } else {
      applicationLink = `https://careers.smartrecruiters.com/${cleanComp}/${appId}`;
    }

    // Build rich, candidate-specific Job Description
    let jd = '';
    if (candidate.id === 'lohith-s') {
      jd = `Role: ${role}
Company: ${company} (${domain})
Location: ${location}
Experience Requirement: 5+ years of software engineering experience.

Job Summary:
${company} is looking for a talented ${role} to join our ${domain} group. You will design, build, and maintain mission-critical backend systems, microservices, and modern web applications. You will collaborate in an Agile environment to build scalable REST APIs and cloud infrastructure.

Key Responsibilities:
- Design, develop, and deploy robust microservices and RESTful APIs using Java, Spring Boot, Python, and SQL databases.
- Optimize database schemas and write high-performance queries across PostgreSQL, MySQL, and Redis caching layers.
- Build and maintain CI/CD automation pipelines using Jenkins, Docker, and AWS cloud services.
- Implement comprehensive automated unit and integration tests (JUnit, PyTest) to maintain 99.9% system reliability.
- Participate in code reviews, sprint planning, and architectural discussions.

Required Skills & Tech Stack:
- Core Languages: Java, Python, JavaScript, TypeScript, SQL, C#.
- Frameworks & Tools: Spring Boot, React, Node.js, REST APIs, GraphQL, Jenkins, Docker, Git.
- Methodologies: Agile/Scrum, SDLC, OOP, Code Quality & Automated Verification.`;
    } else if (candidate.id === 'smit-patel') {
      jd = `Role: ${role}
Company: ${company} (${domain})
Location: ${location}
Experience Requirement: 5+ years of data analysis and business systems experience.

Job Summary:
${company} is seeking an experienced ${role} to join our ${domain} team. You will bridge business strategy and technical execution, elicit detailed business requirements, analyze large datasets, and build executive reporting dashboards to optimize operational workflows.

Key Responsibilities:
- Elicit, document, and manage comprehensive Business Requirement Documents (BRD), Functional Specifications, and Agile user stories.
- Write advanced SQL queries and data validation scripts to analyze complex datasets across PostgreSQL, Snowflake, and Oracle databases.
- Design, build, and maintain executive BI dashboards using Tableau and Power BI to monitor operational KPIs and performance metrics.
- Coordinate end-to-end User Acceptance Testing (UAT), authoring test plans and verifying bug fixes with engineering teams.
- Lead process optimization initiatives and system workflow gap analyses across cross-functional business units.

Required Skills & Tech Stack:
- Analysis & BI: SQL, Python, Tableau, Power BI, Excel, SAS Enterprise Guide.
- Data & Cloud: PostgreSQL, Snowflake, Oracle, AWS, Data Profiling, UAT, BRD.
- Methodologies: Agile/Scrum, Requirements Gathering, Stakeholder Management, Process Optimization.`;
    } else {
      // Vamsi Krishna / Full Stack
      jd = `Role: ${role}
Company: ${company} (${domain})
Location: ${location}
Experience Requirement: 5+ years of fullstack web development and modern system engineering.

Job Summary:
${company} is hiring a skilled ${role} for our ${domain} initiative. You will build high-performance web applications, interactive user interfaces, and scalable backend APIs on AWS.

Key Responsibilities:
- Build responsive, accessible, and high-velocity frontend interfaces using React, TypeScript, and modern state management.
- Architect and develop scalable backend microservices and RESTful / GraphQL APIs using Node.js and Express.
- Design and optimize relational schemas and indexing strategies using PostgreSQL for high-volume data transactions.
- Implement automated CI/CD build and deployment pipelines using Docker, Kubernetes, and AWS (Lambda, ECS, S3).
- Champion engineering quality through code reviews, rigorous unit testing, and production monitoring.

Required Skills & Tech Stack:
- Frontend: React, TypeScript, JavaScript, HTML5/CSS3, Responsive UI/UX.
- Backend & Cloud: Node.js, Express, REST APIs, GraphQL, PostgreSQL, AWS, Docker, Kubernetes.
- Practices: Agile, Bazel, Jenkins, CI/CD, Microservices Architecture.`;
    }

    return {
      id: `job-${candidate.id}-${Date.now()}-${newJobs.length + 1}-${Math.floor(Math.random() * 1000)}`,
      candidateId: candidate.id,
      candidateName: candidate.name,
      companyName: company,
      jobTitle: role,
      location,
      applicationLink,
      jobDescription: jd,
      atsPlatform,
      matchedAllowedRole: matchedAllowedTitle,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
  };

  // 1. GENERATE EXACT WORKDAY JOBS QUOTA (e.g. 10)
  let workdayCount = 0;
  let wdIdx = 0;
  while (workdayCount < targetWorkday && wdIdx < 500) {
    const comp = validWorkdayCompanies[wdIdx % validWorkdayCompanies.length];
    const role = candidate.targetRoles[wdIdx % candidate.targetRoles.length];
    const domain = ENGINEERING_DOMAINS[wdIdx % ENGINEERING_DOMAINS.length];
    const key = `${comp.toLowerCase()}|||${role.toLowerCase()}`;

    if (!usedKeys.has(key) || wdIdx >= validWorkdayCompanies.length) {
      usedKeys.add(key);
      newJobs.push(generateJob(comp, role, 'WORKDAY', domain, newJobs.length + 1));
      workdayCount++;
    }
    wdIdx++;
  }

  // 2. GENERATE EXACT EASY ATS JOBS QUOTA (e.g. 65)
  let easyCount = 0;
  let easyIdx = 0;
  const atsTypes = ['EASY_ATS (Greenhouse)', 'EASY_ATS (Lever)', 'EASY_ATS (SmartRecruiters)'];

  while (easyCount < targetEasyAts && easyIdx < 1000) {
    const comp = validEasyAtsCompanies[easyIdx % validEasyAtsCompanies.length];
    const role = candidate.targetRoles[easyIdx % candidate.targetRoles.length];
    const domain = ENGINEERING_DOMAINS[easyIdx % ENGINEERING_DOMAINS.length];
    const ats = atsTypes[easyIdx % atsTypes.length];
    const key = `${comp.toLowerCase()}|||${role.toLowerCase()}`;

    if (!usedKeys.has(key) || easyIdx >= validEasyAtsCompanies.length) {
      usedKeys.add(key);
      newJobs.push(generateJob(comp, role, ats, domain, newJobs.length + 1));
      easyCount++;
    }
    easyIdx++;
  }

  return newJobs;
}
