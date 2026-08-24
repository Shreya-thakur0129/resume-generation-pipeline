import { CandidateProfile } from '../types';

// ============================================================================
// MAIN CONFIGURATION: WORKDAY, EASY APPLY & GLOBAL JOB FETCH LIMITS
// ============================================================================
// Change these variables to control how many jobs to search/fetch across candidates.
// Formula: total count = Workday count + Easy Apply count
export const DEFAULT_MAX_WORKDAY_JOBS = 10;
export const DEFAULT_MAX_EASY_ATS_JOBS = 65;
export const JOBS_TO_FETCH = DEFAULT_MAX_WORKDAY_JOBS + DEFAULT_MAX_EASY_ATS_JOBS; // 75 (or 140 when scaled)

// Explicit Candidate Quota Definitions:
// 1. Lohith S:    Workday = 10, Easy Apply = 65, Total Count = 75
// 2. Smit Patel:   Workday = 10, Easy Apply = 65, Total Count = 75
// 3. Vamsi Krishna: Workday = 10, Easy Apply = 65, Total Count = 75
export const CANDIDATE_JOB_LIMITS: Record<string, { workday: number; easyAts: number; total: number }> = {
  'Lohith S': { workday: 10, easyAts: 75, total: 85 },
  'Smit Patel': { workday: 30, easyAts: 130, total: 160 },
  'Vamsi Krishna': { workday: 10, easyAts: 65, total: 75 },
};

// ============================================================================
// CANDIDATE 1: LOHITH S (Software Engineering / Backend / Full Stack)
// ============================================================================
export const LOHITH_MASTER_LATEX = `\\documentclass[a4paper,10pt]{article}
\\usepackage[a4paper,margin=0.7in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{xcolor}
\\usepackage{tabularx}

\\definecolor{midnightnavy}{HTML}{1B3155}
\\definecolor{skyblue}{HTML}{8FC7D6}
\\definecolor{companyblue}{HTML}{6EC6E8}
\\definecolor{textgray}{HTML}{333333}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

\\titleformat{\\section}
{\\large\\bfseries\\color{midnightnavy}}
{}
{0em}
{}[\\titlerule]

\\setlist[itemize]{leftmargin=*,noitemsep,topsep=2pt}

\\newcommand{\\resumeItem}[1]{
    \\item \\small #1
}

\\newcommand{\\resumeSubheading}[4]{
    \\noindent\\begin{tabularx}{\\textwidth}{@{} X r @{}}
        \\textbf{#1} & \\textbf{#2} \\\\
    \\end{tabularx}
    \\noindent{\\itshape\\color{companyblue}#3}
    \\hspace{2pt}| \\hspace{2pt}
    #4
    \\vspace{2pt}
}

\\begin{document}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Header
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\\begin{center}
{\\LARGE \\textbf{LOHITH S}}\\\\[4pt]
lohiths249@gmail.com \\;|\\; (980) 549-3579 \\;|\\; Open to Relocate
\\end{center}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Professional Summary
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\\section{Professional Summary}
Software Engineer with 5+ years of experience in designing, developing, and deploying backend services, web applications, and software solutions. Proficient in Java, Python, JavaScript, and SQL, with a strong background in building scalable REST APIs, managing databases, and automating build pipelines. Proven track record of working across the software development lifecycle to deliver clean, maintainable code and ensure high-quality software releases in Agile environments. Strong problem-solver skilled in troubleshooting complex system issues and collaborating with cross-functional engineering teams.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Technical Skills
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\\section{Technical Skills}
\\begin{itemize}[leftmargin=14pt,itemsep=1pt,topsep=2pt]
\\item \\textbf{Languages:} Java, Python, JavaScript, TypeScript, SQL, C#
\\item \\textbf{Frameworks \\& Web:} Spring Boot, React, Node.js, Express, Flask, REST APIs, GraphQL
\\item \\textbf{Databases:} PostgreSQL, MySQL, MongoDB, Redis, SQL Server
\\item \\textbf{DevOps \\& Tools:} Git, GitHub, Docker, AWS, Jenkins, CI/CD Pipelines
\\item \\textbf{Methodologies:} Agile, Scrum, Software Development Life Cycle (SDLC), Object-Oriented Programming (OOP)
\\item \\textbf{Software Quality:} Unit Testing, JUnit, PyTest, Automated Verification, Code Review
\\end{itemize}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Professional Experience
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\\section{Professional Experience}

\\resumeSubheading
{Software Engineer}
{May 2025 -- Jul 2026}
{Accenture}
{USA}
\\begin{itemize}[leftmargin=14pt,itemsep=2pt,topsep=2pt]
\\resumeItem{Design and develop scalable backend microservices and REST APIs using Java and Spring Boot to support business-critical systems.}
\\resumeItem{Write clean, efficient, and testable code, implementing automated unit tests using JUnit to ensure software reliability and performance.}
\\resumeItem{Integrate applications with Jenkins CI/CD pipelines, automating build and deployment workflows to facilitate continuous integration.}
\\resumeItem{Collaborate with product owners, designers, and developers in an Agile environment to define features and resolve software bugs.}
\\end{itemize}

\\vspace{2pt}

\\resumeSubheading
{Software Engineer}
{May 2019 -- Jul 2023}
{Deloitte}
{India}
\\begin{itemize}[leftmargin=14pt,itemsep=2pt,topsep=2pt]
\\resumeItem{Developed and optimized interactive web applications using JavaScript, React, and Node.js, enhancing overall frontend performance.}
\\resumeItem{Designed database schemas and wrote optimized SQL queries in PostgreSQL to handle complex transactional operations efficiently.}
\\resumeItem{Engineered automated verification frameworks using Selenium and Python, reducing manual verification overhead and improving software quality.}
\\resumeItem{Utilized Git for version control and actively participated in code reviews to maintain high coding standards and best practices.}
\\end{itemize}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Technical Projects
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\\section{Technical Projects}

\\textbf{E-Commerce API Service}
\\begin{itemize}[leftmargin=14pt,itemsep=2pt,topsep=2pt]
\\resumeItem{Developed a scalable RESTful API for an e-commerce platform using Node.js, Express, and MongoDB, handling checkout operations.}
\\resumeItem{Integrated Redis caching to optimize database queries, improving API response times by 40\\% under concurrent concurrent loads.}
\\end{itemize}

\\textbf{CI/CD Build Pipeline Automation}
\\begin{itemize}[leftmargin=14pt,itemsep=2pt,topsep=2pt]
\\resumeItem{Built a robust CI/CD pipeline template using GitHub Actions, Docker, and Python, automating code compilation and containerization.}
\\resumeItem{Configured automated security scans and deployment status reporting, ensuring secure and reliable code integrations.}
\\end{itemize}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Education
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\\section{Education}

\\textbf{Master of Computer Science} \\\\
{\\itshape\\color{companyblue}University of Central Missouri} \\hfill GPA: 3.5

\\end{document}`;

// ============================================================================
// CANDIDATE 2: SMIT PATEL (Business Analyst / Data Analyst)
// ============================================================================
export const SMIT_MASTER_LATEX = `\\documentclass[10pt,letterpaper]{article}
\\usepackage[
    ignoreheadfoot,
    top=0.45in,
    bottom=0.45in,
    left=0.55in,
    right=0.55in
]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[dvipsnames]{xcolor}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage{ragged2e}

\\definecolor{midnightnavy}{HTML}{1B3155}
\\definecolor{skyblue}{HTML}{8FC7D6}
\\definecolor{companyblue}{HTML}{6EC6E8}
\\definecolor{textgray}{HTML}{333333}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\tabcolsep}{0pt}
\\renewcommand{\\familydefault}{\\rmdefault}

\\titleformat{\\section}
{\\normalsize\\bfseries\\color{midnightnavy}}
{}
{0em}
{}
[\\vspace{-0.15em}\\color{skyblue}\\titlerule]

\\titlespacing{\\section}
{0pt}
{8pt}
{4pt}

\\newcommand{\\resumeItem}[1]{
    \\item \\small #1
}

\\newcommand{\\resumeSubheading}[4]{
    \\begin{tabularx}{\\textwidth}{X r}
        \\textbf{#1} & \\textbf{#2} \\\\
    \\end{tabularx}
    {\\itshape\\color{companyblue}#3}
    \\hspace{2pt}| \\hspace{2pt}
    #4
    \\vspace{2pt}
}

\\begin{document}

%================ HEADER =================%
\\begin{center}
{\\fontsize{24}{26}\\selectfont\\bfseries\\color{midnightnavy} Smit Patel}
\\vspace{3pt}
{\\small\\color{textgray}
svpatel1048@gmail.com | +1 (331) 236-5272 | Open to Relocate}
\\end{center}

%==================== PROFESSIONAL SUMMARY ====================
\\section{Professional Summary}
Business Analyst with 5+ years of experience leveraging data analysis, database querying, and business intelligence tools to drive process optimization and system enhancements. Proficient in SQL, Python, and Tableau, with a proven track record of translating complex business needs into clear functional specifications. Skilled in stakeholder management, requirements gathering, and coordinating user acceptance testing (UAT) to deliver successful system integrations in Agile environments.

%==================== TECHNICAL SKILLS ====================
\\section{Technical Skills}
\\begin{itemize}[leftmargin=14pt,itemsep=1pt,topsep=2pt]
\\item \\textbf{Languages:} Python, R, SQL, SAS
\\item \\textbf{Data Analytics \\& BI:} Tableau, Power BI, Excel, SAS Enterprise Guide
\\item \\textbf{Machine Learning \\& Stats:} Scikit-learn, TensorFlow, PyTorch, A/B Testing, Regression, Clustering
\\item \\textbf{Databases:} PostgreSQL, MySQL, MongoDB, Snowflake, Oracle
\\item \\textbf{Cloud \\& Infrastructure:} AWS, Docker, Git, CI/CD
\\item \\textbf{APIs \\& Web:} REST APIs, Flask, FastAPI
\\item \\textbf{Methodologies:} Agile, Scrum, SDLC, Data Governance, Predictive Modeling
\\item \\textbf{Business Skills:} Requirements Gathering, Stakeholder Management, Process Optimization
\\end{itemize}

%==================== PROFESSIONAL EXPERIENCE ====================
\\section{Professional Experience}

\\resumeSubheading
{Business Analyst}
{Jan 2025 -- Present}
{HCL Tech}
{USA}
\\begin{itemize}[leftmargin=14pt,itemsep=2pt,topsep=2pt]
\\resumeItem{Collaborate with business partners and technical development teams to elicit, analyze, and document comprehensive business requirements (BRD) and user stories.}
\\resumeItem{Conduct system workflow mapping and gap analysis to optimize operations, translating complex requirements into developer-ready technical specifications.}
\\resumeItem{Develop data profiling reports and run database impact assessments in SQL to support application features and data integrity.}
\\resumeItem{Coordinate user acceptance testing (UAT) cycles, authoring detailed test cases and validating bug resolutions in Agile sprints.}
\\end{itemize}

\\vspace{2pt}

\\resumeSubheading
{Business Analyst}
{Aug 2021 -- Nov 2022}
{Mphasis}
{India}
\\begin{itemize}[leftmargin=14pt,itemsep=2pt,topsep=2pt]
\\resumeItem{Designed and implemented interactive dashboards in Tableau and Power BI to monitor business processes, reducing reporting times by 35\\%.}
\\resumeItem{Wrote complex SQL queries to extract, merge, and clean operational data from multiple legacy systems, generating reports for senior management.}
\\resumeItem{Documented API payload specifications and integration mapping documents to guide developer implementation workflows.}
\\resumeItem{Participated in Agile Scrum rituals, assisting with backlog refinement, task estimation, and daily stand-ups to drive project delivery.}
\\end{itemize}

\\vspace{2pt}

\\resumeSubheading
{Data Analyst}
{Aug 2019 -- Jul 2021}
{Centene}
{India}
\\begin{itemize}[leftmargin=14pt,itemsep=2pt,topsep=2pt]
\\resumeItem{Conducted data mining and statistical analysis in Python and Excel to uncover trends and identify operational bottlenecks.}
\\resumeItem{Created data validation and data quality monitoring scripts in SQL to ensure consistency and precision in relational databases.}
\\resumeItem{Prepared operational reports and analysis slide-decks summarizing performance metrics and quality audit results.}
\\resumeItem{Automated monthly reporting tasks using Python scripts, saving 15 hours of manual data consolidation per month.}
\\end{itemize}

%==================== TECHNICAL PROJECTS ====================
\\section{Projects}

\\resumeSubheading
{\\textbf{Predictive Customer Analytics Dashboard}}{}
{Python, SQL, Tableau, Scikit-learn}{}
\\begin{itemize}[leftmargin=14pt,itemsep=2pt,topsep=2pt]
\\resumeItem{Developed an end-to-end customer churn prediction system using Python to identify at-risk accounts, achieving a 15\\% increase in retention.}
\\resumeItem{Built an interactive Tableau dashboard to visualize customer risk segments, providing sales teams with real-time actionable insights.}
\\end{itemize}

\\resumeSubheading
{\\textbf{Automated Financial Reporting Pipeline}}{}
{Python, SQL, AWS, Airflow}{}
\\begin{itemize}[leftmargin=14pt,itemsep=2pt,topsep=2pt]
\\resumeItem{Engineered an automated data pipeline using Python and SQL to aggregate daily transaction logs, reducing reporting cycle times by 40\\%.}
\\resumeItem{Deployed the pipeline on AWS, configuring automated alerts and schema validation checks to ensure high data quality and reliability.}
\\end{itemize}

%==================== EDUCATION ====================
\\section{Education}

\\resumeSubheading
{Master of Science in Information Systems}
{}
{DePaul University}
{}

\\end{document}`;

// ============================================================================
// CANDIDATE 3: VAMSI KRISHNA (Full Stack / Software Engineer / React / Node)
// ============================================================================
export const VAMSI_MASTER_LATEX = `\\documentclass[10pt,letterpaper]{article}
\\usepackage[
    ignoreheadfoot,
    top=0.45in,
    bottom=0.45in,
    left=0.55in,
    right=0.55in
]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[dvipsnames]{xcolor}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage{ragged2e}

\\definecolor{midnightnavy}{HTML}{1B3155}
\\definecolor{skyblue}{HTML}{8FC7D6}
\\definecolor{companyblue}{HTML}{6EC6E8}
\\definecolor{textgray}{HTML}{333333}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\tabcolsep}{0pt}
\\renewcommand{\\familydefault}{\\rmdefault}

\\titleformat{\\section}
{\\normalsize\\bfseries\\color{midnightnavy}}
{}
{0em}
{}
[\\vspace{-0.15em}\\color{skyblue}\\titlerule]

\\titlespacing{\\section}
{0pt}
{8pt}
{4pt}

\\newcommand{\\resumeItem}[1]{
    \\item \\small #1
}

\\newcommand{\\resumeSubheading}[4]{
    \\begin{tabularx}{\\textwidth}{X r}
        \\textbf{#1} & \\textbf{#2} \\\\
    \\end{tabularx}
    {\\itshape\\color{companyblue}#3}
    \\hspace{2pt}| \\hspace{2pt}
    #4
    \\vspace{2pt}
}

\\begin{document}

%================ HEADER =================%
\\begin{center}
{\\fontsize{24}{26}\\selectfont\\bfseries\\color{midnightnavy} Vamsi Krishna}
\\vspace{3pt}
{\\small\\color{textgray}
vamsik.dev98@gmail.com | +1 (408) 658-9082 | Open to Relocate}
\\end{center}

%==================== PROFESSIONAL SUMMARY ====================
\\section{Professional Summary}
Software Engineer with 5+ years of experience building fullstack applications and AI-powered products. Proficient in JavaScript/TypeScript, React, Node.js, and PostgreSQL with a strong focus on clean, maintainable code and user-facing features. Experienced in designing and developing backend services, APIs, and scalable data models for enterprise-scale platforms. Passionate about building products that deliver real user value, with deep interest in AI-driven systems and modern system design. Collaborative team player with experience across the full development lifecycle, from feature ideation to production deployment and maintenance.

%==================== TECHNICAL SKILLS ====================
\\section{Technical Skills}
\\begin{itemize}[leftmargin=14pt,itemsep=1pt,topsep=2pt]
\\item \\textbf{Languages:} TypeScript, JavaScript, Python, Golang, Java, SQL
\\item \\textbf{Frontend:} React, HTML5, CSS3, Responsive Design, UI/UX Development
\\item \\textbf{Backend:} Node.js, Express.js, REST APIs, GraphQL, Microservices
\\item \\textbf{Databases:} PostgreSQL, MySQL, MongoDB, Data Modeling, Performance Optimization
\\item \\textbf{Cloud \\& Infrastructure:} AWS (EC2, S3, Lambda, RDS), Docker, Kubernetes, Terraform
\\item \\textbf{DevOps \\& CI/CD:} Git, Jenkins, CI/CD Pipelines, Bazel, Build Automation
\\item \\textbf{APIs \\& Protocols:} Protobuf, gRPC, REST APIs, Event-Driven Architecture
\\item \\textbf{Methodologies:} Agile, SDLC, Code Reviews, Testing, Debugging, Production Support
\\end{itemize}

%==================== PROFESSIONAL EXPERIENCE ====================
\\section{Professional Experience}

\\resumeSubheading
{Software Engineer}
{Feb 2025 -- Present}
{Accenture}
{USA}
\\begin{itemize}[leftmargin=14pt,itemsep=2pt,topsep=2pt]
\\resumeItem{Design and develop fullstack systems powering core product workflows, building user-facing features and interfaces using React, TypeScript, and Node.js that ship directly to real users.}
\\resumeItem{Build backend services and APIs with a focus on clean, maintainable code, implementing REST and Protobuf-based services that improve platform response times by 20\\%.}
\\resumeItem{Support data modeling efforts and optimize database performance using PostgreSQL, designing scalable schemas and implementing efficient query patterns for high-volume applications.}
\\resumeItem{Collaborate with product and design teams to turn ideas into working features, participating in code reviews, testing, and continuous improvement of engineering quality.}
\\end{itemize}

\\vspace{2pt}

\\resumeSubheading
{Software Engineer}
{Nov 2019 -- Dec 2024}
{Deloitte}
{India}
\\begin{itemize}[leftmargin=14pt,itemsep=2pt,topsep=2pt]
\\resumeItem{Built enterprise-scale web applications and backend services using TypeScript, Node.js, React, and PostgreSQL, delivering features that serve thousands of users across business units.}
\\resumeItem{Developed and maintained REST APIs and GraphQL endpoints for seamless data exchange between frontend applications and backend microservices.}
\\resumeItem{Designed and optimized database schemas and queries, improving data retrieval performance by 25\\% and reducing latency for critical reporting applications.}
\\resumeItem{Automated build, deployment, and testing workflows using CI/CD tooling, improving engineering productivity and release quality across a 20+ engineer team.}
\\end{itemize}

%==================== TECHNICAL PROJECTS ====================
\\section{Technical Projects}

\\textbf{AI Recruiter Agent Platform}
\\begin{itemize}[leftmargin=14pt,itemsep=2pt,topsep=2pt]
\\resumeItem{Developed a fullstack platform leveraging TypeScript, React, and Node.js to power an AI-driven recruiter agent, enabling automated candidate screening and intelligent decision-making.}
\\resumeItem{Built and maintained backend services and REST APIs for managing candidate data, workflow orchestration, and integration with AI/ML models.}
\\end{itemize}

\\textbf{Cloud-Native Fullstack Application Platform}
\\begin{itemize}[leftmargin=14pt,itemsep=2pt,topsep=2pt]
\\resumeItem{Engineered a scalable fullstack application platform using React, Node.js, and PostgreSQL, deployed on AWS with Docker and Kubernetes orchestration.}
\\resumeItem{Implemented user authentication, authorization, and data management features, ensuring secure and reliable access for thousands of concurrent users.}
\\end{itemize}

%==================== EDUCATION ====================
\\section{Education}

\\textbf{Master of Computer Science and Engineering} \\\\
{\\itshape\\color{companyblue}Santa Clara University}

\\end{document}`;

// ============================================================================
// CANDIDATES ARRAY (SCALABLE TO 3, 4, OR MORE CANDIDATES)
// ============================================================================
export const CANDIDATES: CandidateProfile[] = [
  {
    id: 'lohith-s',
    name: 'LOHITH S',
    email: 'lohiths249@gmail.com',
    phone: '(980) 549-3579',
    experienceLabel: '5EXP',
    experienceLength: '5+ years',
    maxWorkdayJobs: CANDIDATE_JOB_LIMITS['Lohith S']?.workday ?? 10,
    maxEasyAtsJobs: CANDIDATE_JOB_LIMITS['Lohith S']?.easyAts ?? 75,
    maxTotalJobs: CANDIDATE_JOB_LIMITS['Lohith S']?.total ?? 85,
    targetRoles: [
      'Software Engineer',
      'Software Developer',
      'Backend Engineer',
      'Full Stack Developer',
      'Java Developer',
      'Python Developer',
      'C# Developer',
      'Node.js Developer',
      'Systems Developer',
    ],
    allowedJobTitles: [
      'Software Engineer',
      'Software Developer',
      'Full Stack Engineer',
      'Full Stack Developer',
      'Backend Engineer',
      'Backend Developer',
      'Frontend Engineer',
      'Frontend Developer',
      'Python Developer',
      'Java Developer',
      'C# Developer',
      'Node.js Developer',
      'Application Developer',
      'Systems Developer',
      'Web Developer',
      'Associate Software Engineer',
      'Junior Software Engineer',
      'Senior Software Engineer',
      'Senior Software Developer',
      'Lead Software Engineer',
      'Staff Software Engineer',
      'Principal Software Engineer',
    ],
    keywords: [
      'Java',
      'Spring Boot',
      'Python',
      'JavaScript',
      'TypeScript',
      'REST APIs',
      'PostgreSQL',
      'MySQL',
      'Redis',
      'Docker',
      'AWS',
      'Jenkins',
      'CI/CD',
      'Microservices',
    ],
    locationPreference: 'Open to Relocate (USA)',
    googleSheet: 'https://docs.google.com/spreadsheets/d/shreyathakur9294/edit#gid=0 (Target Account: shreyathakur9294@gmail.com | Tab: Lohith 24/8/2026)',
    googleDriveFolder: 'https://drive.google.com/drive/folders/shreyathakur9294 (Target Account: shreyathakur9294@gmail.com | Folder: Lohith 24/8/2026)',
    headerContactLine: 'lohiths249@gmail.com \\;|\\; (980) 549-3579 \\;|\\; Open to Relocate',
    allowedSummaryLines: 'Single paragraph of exactly 5 to 6 lines (roughly 60 to 100 words), starting with matched title + "with 5+ years of experience..."',
    experienceHistory: [
      {
        company: 'Accenture',
        dates: 'May 2025 -- Jul 2026',
        location: 'USA',
        requiredBulletCount: 4,
      },
      {
        company: 'Deloitte',
        dates: 'May 2019 -- Jul 2023',
        location: 'India',
        requiredBulletCount: 4,
      },
    ],
    education: {
      degree: 'Master of Computer Science',
      institution: 'University of Central Missouri',
      gpa: '3.5',
      hasNoDates: true,
    },
    masterLatexTemplate: LOHITH_MASTER_LATEX,
    resumeRulesSummary: [
      '1. Summary must start with matched Job Title + "with 5+ years of experience..." and be 5-6 lines (60-100 words).',
      '2. Technical skills can be reordered/modified to align with JD technologies.',
      '3. Professional Experience MUST have exactly 4 bullet points under Accenture (May 2025 -- Jul 2026) and Deloitte (May 2019 -- Jul 2023). Job titles for all roles must match target title from allowed list.',
      '4. Technical Projects: Exactly 2 projects dynamically tailored to JD with 2 bullet points each. Keep LaTeX formatting.',
      '5. Education MUST remain completely unchanged (Master of Computer Science at University of Central Missouri, GPA 3.5) with NO dates.',
      '6. Header MUST contain ONLY name, email, phone, and "Open to Relocate".',
      '7. Job titles must be restricted strictly to Lohith\'s allowed list (default to Software Engineer or Software Developer).',
      '8. Proper LaTeX escape characters for &, %, _, $, #, {, }.',
      '9. Proper visual and structural alignment with exact master LaTeX document class and macros.',
    ],
    currentResumeCounter: 1,
  },
  {
    id: 'smit-patel',
    name: 'Smit Patel',
    email: 'svpatel1048@gmail.com',
    phone: '+1 (331) 236-5272',
    experienceLabel: '5EXP',
    experienceLength: '5+ years',
    maxWorkdayJobs: CANDIDATE_JOB_LIMITS['Smit Patel']?.workday ?? 30,
    maxEasyAtsJobs: CANDIDATE_JOB_LIMITS['Smit Patel']?.easyAts ?? 130,
    maxTotalJobs: CANDIDATE_JOB_LIMITS['Smit Patel']?.total ?? 160,
    targetRoles: [
      'Business Analyst',
      'Senior Business Analyst',
      'Data Analyst',
      'Business Systems Analyst',
      'Technical Business Analyst',
      'Data Engineer',
      'BI Developer',
      'Operations Analyst',
    ],
    allowedJobTitles: [
      'Business Analyst',
      'Senior Business Analyst',
      'Junior Business Analyst',
      'Lead Business Analyst',
      'Functional Analyst',
      'Functional Business Analyst',
      'Domain Business Analyst',
      'Process Analyst',
      'Operations Analyst',
      'Technical Business Analyst',
      'Systems Analyst',
      'IT Business Analyst',
      'Application Business Analyst',
      'Integration Business Analyst',
      'Product Analyst',
      'Business Systems Analyst',
      'Reporting Analyst',
      'Decision Support Analyst',
      'Enterprise Business Analyst',
      'Solutions Analyst',
      'Business Process Analyst',
      'Requirements Analyst',
      'Finance Business Analyst',
      'Banking Business Analyst',
      'Healthcare Business Analyst',
      'ERP Business Analyst',
      'ERP Business Analyst (SAP / Oracle)',
      'CRM Business Analyst',
      'Agile Business Analyst',
      'Scrum Business Analyst',
      'Delivery Analyst',
      'Data Analyst',
      'Senior Data Analyst',
      'Business Intelligence Analyst',
      'BI Developer',
      'Insights Analyst',
      'Decision Science Analyst',
      'Analytics Engineer',
      'Product Data Analyst',
      'Marketing Data Analyst',
      'Operations Data Analyst',
      'Data Engineer',
      'Senior Data Engineer',
      'Big Data Engineer',
      'ETL Engineer',
      'Data Pipeline Engineer',
      'Data Platform Engineer',
    ],
    keywords: [
      'SQL',
      'Python',
      'Tableau',
      'Power BI',
      'BRD',
      'User Stories',
      'UAT',
      'Requirements Gathering',
      'Stakeholder Management',
      'Process Optimization',
      'PostgreSQL',
      'Snowflake',
      'AWS',
      'Agile',
      'Scrum',
    ],
    locationPreference: 'Open to Relocate (USA)',
    googleSheet: 'https://docs.google.com/spreadsheets/d/shreyathakur9294/edit#gid=1 (Target Account: shreyathakur9294@gmail.com | Tab: Smit 24/8/2026)',
    googleDriveFolder: 'https://drive.google.com/drive/folders/shreyathakur9294 (Target Account: shreyathakur9294@gmail.com | Folder: Smit 24/8/2026)',
    headerContactLine: 'svpatel1048@gmail.com | +1 (331) 236-5272 | Open to Relocate',
    allowedSummaryLines: 'Single paragraph of exactly 5 to 6 lines (roughly 60 to 100 words), starting with matched title + "with 5+ years of experience..."',
    experienceHistory: [
      {
        company: 'HCL Tech',
        dates: 'Jan 2025 -- Present',
        location: 'USA',
        requiredBulletCount: 4,
      },
      {
        company: 'Mphasis',
        dates: 'Aug 2021 -- Nov 2022',
        location: 'India',
        requiredBulletCount: 4,
      },
      {
        company: 'Centene',
        dates: 'Aug 2019 -- Jul 2021',
        location: 'India',
        requiredBulletCount: 4,
      },
    ],
    education: {
      degree: 'Master of Science in Information Systems',
      institution: 'DePaul University',
      hasNoDates: true,
    },
    masterLatexTemplate: SMIT_MASTER_LATEX,
    resumeRulesSummary: [
      '1. Summary must start with matched Job Title + "with 5+ years of experience..." and be 5-6 lines (60-100 words).',
      '2. Technical skills can be reordered/modified to highlight JD technologies.',
      '3. Professional Experience MUST have exactly 4 bullet points under HCL Tech (Jan 2025 -- Present), Mphasis (Aug 2021 -- Nov 2022), and Centene (Aug 2019 -- Jul 2021). Job titles for all 3 roles must match target title from allowed list.',
      '4. Technical Projects: Exactly 2 projects dynamically tailored to JD with 2 bullet points each.',
      '5. Education MUST remain completely unchanged (Master of Science in Information Systems at DePaul University) with NO dates.',
      '6. Header MUST contain ONLY name, email, phone, and "Open to Relocate".',
      '7. Job titles must be restricted strictly to Smit\'s allowed list (default to Business Analyst or Data Analyst).',
      '8. Proper LaTeX escape characters for &, %, _, $, #, {, }.',
      '9. Proper visual and structural alignment with exact master LaTeX document class and macros.',
    ],
    currentResumeCounter: 1,
  },
  {
    id: 'vamsi-krishna',
    name: 'Vamsi Krishna',
    email: 'vamsik.dev98@gmail.com',
    phone: '+1 (408) 658-9082',
    experienceLabel: '5EXP',
    experienceLength: '5+ years',
    maxWorkdayJobs: CANDIDATE_JOB_LIMITS['Vamsi Krishna']?.workday ?? 10,
    maxEasyAtsJobs: CANDIDATE_JOB_LIMITS['Vamsi Krishna']?.easyAts ?? 65,
    maxTotalJobs: CANDIDATE_JOB_LIMITS['Vamsi Krishna']?.total ?? 75,
    targetRoles: [
      'Software Engineer',
      'Software Developer',
      'Full Stack Developer',
      'Frontend Developer',
      'Backend Developer',
      'React Developer',
      'Node Developer',
      'Python Developer',
      'API Developer',
    ],
    allowedJobTitles: [
      'Software Engineer',
      'Software Developer',
      'Full Stack Developer',
      'Frontend Developer',
      'Backend Developer',
      'Web Developer',
      'Mobile Developer',
      'iOS Developer',
      'Android Developer',
      'React Developer',
      'Python Developer',
      'Java Developer',
      'Node Developer',
      'API Developer',
    ],
    keywords: [
      'TypeScript',
      'JavaScript',
      'React',
      'Node.js',
      'PostgreSQL',
      'AWS',
      'Docker',
      'Kubernetes',
      'GraphQL',
      'REST APIs',
      'Microservices',
      'CI/CD',
      'Bazel',
      'Jenkins',
    ],
    locationPreference: 'Open to Relocate (USA)',
    googleSheet: 'https://docs.google.com/spreadsheets/d/VamsiKrishnaDevDashboard/edit (Spreadsheet: Vamsi Krishna (Dev) Dashboard | Tab: Vamsi24-8)',
    googleDriveFolder: 'https://drive.google.com/drive/folders/1C9K9g8ImqLndPcNxKAhR6nHq4E8W2NOY (Folder: Vamsi24-8)',
    headerContactLine: 'vamsik.dev98@gmail.com | +1 (408) 658-9082 | Open to Relocate',
    allowedSummaryLines: 'Single paragraph of exactly 5 to 6 lines (roughly 60 to 100 words), keeping exact experience length as "5+ years"',
    experienceHistory: [
      {
        company: 'Accenture',
        dates: 'Feb 2025 -- Present',
        location: 'USA',
        requiredBulletCount: 4,
      },
      {
        company: 'Deloitte',
        dates: 'Nov 2019 -- Dec 2024',
        location: 'India',
        requiredBulletCount: 4,
      },
    ],
    education: {
      degree: 'Master of Computer Science and Engineering',
      institution: 'Santa Clara University',
      hasNoDates: true,
    },
    masterLatexTemplate: VAMSI_MASTER_LATEX,
    resumeRulesSummary: [
      '1. Summary must keep exact experience length as "5+ years" and be a single paragraph of exactly 5 to 6 lines (60 to 100 words).',
      '2. Technical skills can be reordered/modified to highlight JD technologies.',
      '3. Professional Experience MUST have exactly 4 bullet points under Accenture (Feb 2025 -- Present) and Deloitte (Nov 2019 -- Dec 2024). Job titles must match target role from allowed list.',
      '4. Technical Projects: Exactly 2 projects dynamically tailored to JD with 2 bullet points each.',
      '5. Education MUST remain completely unchanged (Master of Computer Science and Engineering at Santa Clara University).',
      '6. Header MUST contain ONLY name, email, phone, and "Open to Relocate". Remove USA/country details.',
      '7. Job titles must be restricted strictly to Vamsi\'s allowed list (if target is hyper-specific, map to Software Engineer or closest title).',
      '8. Proper LaTeX escape characters for &, %, _, $, #, {, }.',
      '9. Proper visual and structural alignment with exact master LaTeX document class and macros.',
    ],
    currentResumeCounter: 1,
  },
];

/**
 * Builds the comprehensive, enhanced prompt to give to Gemini (or another AI)
 * with the Candidate's exact rules, master LaTeX, and Job Description.
 */
export function buildEnhancedMasterPrompt(candidate: CandidateProfile, jobDescription: string): string {
  return `You are a professional resume writer. I am giving you my master resume in LaTeX, a set of strict rules, and a Job Description.

Here are the strict rules you must follow:
1. Professional Summary Section: Customize this section for the Job Description. The summary MUST start with the matched Job Title from the allowed list (Rule 7) followed by 'with ${candidate.experienceLength} of experience...' (e.g. '${candidate.allowedJobTitles[0]} with ${candidate.experienceLength} of experience...'). It must keep my exact experience length as '${candidate.experienceLength}' and MUST be a single paragraph of exactly 5 to 6 lines of text (roughly 60 to 100 words).
2. Technical Skills Section: Can be modified/reordered to highlight technologies from the JD, ensuring all listed skills are closely aligned to the JD.
3. Professional Experience Section: Bullet points can be rephrased to match the JD's requirements and action verbs. However, you MUST provide exactly 4 bullet points under each experience section (${candidate.experienceHistory.map(e => `${e.company}: ${e.dates}`).join(', ')}). Each bullet point should be concise and cover important/key achievements. The company names, locations, and employment dates MUST remain exactly as defined in the master resume. You MUST also update the job titles for all roles to match the target job title from the allowed list (Rule 7).
4. Technical Projects Section: You MUST dynamically create/tailor exactly 2 projects in total. Do NOT copy the project names or descriptions from the master resume. Instead, create two projects with names and bullet points tailored to the key technologies and requirements of the Job Description. Keep the exact LaTeX formatting. Each project MUST have exactly 2 bullet points covering important points.
5. Education Section: MUST remain completely unchanged (${candidate.education.degree} at ${candidate.education.institution}) and MUST NOT contain any dates or years.
6. Header Section: The contact line MUST contain ONLY my name, email, phone number, and "Open to Relocate". You MUST remove any other location details. It should look exactly like:
${candidate.headerContactLine}
7. Job Titles in Experience and Summary: You MUST update the job titles in the Professional Experience section and the Professional Summary section to align with the target role. You MUST restrict the job titles strictly to the following allowed list:
${candidate.allowedJobTitles.map(t => `- ${t}`).join('\n')}

Choose the job title from this list that best matches the target role in the JD. If no specific title matches, use '${candidate.allowedJobTitles[0]}' as appropriate. Never use any other job titles.
8. LaTeX Escape Characters: For any special characters (like &, %, _, $, #, {, }), you MUST put a backslash '\\' before the character (e.g. write "React \\& Node" instead of "React & Node", "30\\%" instead of "30%").
9. Proper Visual and Structural Alignment: The resume layout and alignment must remain completely clean and professional, matching the structure of the master resume. All text alignment, section headings, subheadings, dates, locations, bullet points, margins, and spacing must be properly aligned without any overlaps, wrapped lines that disrupt layout, or distorted formatting. Keep the exact LaTeX document class, margins, packages, colors, definitions, and structure. Return ONLY the complete, compilable LaTeX code with no surrounding markdown or explanation.

Here is my master resume LaTeX code:
${candidate.masterLatexTemplate}

JOB DESCRIPTION TO TAILOR FOR:
"""
${jobDescription}
"""
`;
}
