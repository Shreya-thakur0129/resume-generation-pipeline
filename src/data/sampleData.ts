import { CandidateRawData, ColumnMapping } from '../types';

export const DEFAULT_COLUMN_MAPPING: ColumnMapping = {
  candidateId: 'Candidate ID',
  name: 'Candidate Name',
  email: 'Email Address',
  phone: 'Phone Number',
  location: 'Location',
  linkedin: 'LinkedIn URL',
  github: 'GitHub Profile',
  portfolio: 'Portfolio Link',
  summary: 'Professional Summary',
  education: 'Education & Degrees',
  skills: 'Technical Skills',
  experience: 'Work Experience',
  projects: 'Key Projects',
  certifications: 'Certifications',
  achievements: 'Honors & Achievements',
  jobDescription: 'Target Job Description',
  status: 'Processing Status',
  resumeUrl: 'Generated Resume URL',
  generatedAt: 'Timestamp',
  error: 'Pipeline Error Logs',
};

export const SAMPLE_JOB_DESCRIPTION = `Senior Full Stack Cloud Engineer
Company: CloudScale Dynamics Inc.
Location: San Francisco, CA (Hybrid / Remote)
Seniority: Senior / Lead Level
Domain: Distributed Cloud Architecture & SaaS

Role Overview:
We are seeking an experienced Senior Full Stack Cloud Engineer to design, architect, and scale high-throughput enterprise web applications and event-driven microservices. You will lead frontend modernization using React and TypeScript, engineer robust serverless APIs on AWS/GCP, and optimize PostgreSQL and Redis data layers.

Key Responsibilities:
- Architect and develop responsive, high-performance web applications using React, TypeScript, and Tailwind CSS.
- Design resilient RESTful and gRPC microservices deployed on Kubernetes and AWS Lambda.
- Implement automated CI/CD pipelines with GitHub Actions, Docker, and Terraform infrastructure-as-code.
- Optimize database schema, indexing, and query performance across PostgreSQL and Redis caching layers.
- Champion code quality through automated test suites (Jest, Playwright), rigorous code reviews, and architectural RFCs.
- Collaborate with product managers, UX designers, and security engineers to deliver mission-critical features.

Required Qualifications & Skills:
- 4+ years of professional full-stack development experience.
- Strong proficiency in TypeScript, JavaScript, React.js, and Node.js / Express.
- Proven expertise in cloud platforms (AWS or GCP) including Lambda, S3, ECS/EKS, and CloudFront.
- Strong experience with SQL databases (PostgreSQL/MySQL), relational schema design, and query optimization.
- Familiarity with CI/CD automation, Docker containerization, and modern Git workflows.
- Excellent communication and system design skills.

Preferred Qualifications:
- Experience with GraphQL, Apache Kafka, or event-driven streaming architectures.
- AWS Certified Solutions Architect or Developer Associate.
- Background in AI integration, LLM prompt engineering, or vector database tooling.`;

export const SAMPLE_CANDIDATES: CandidateRawData[] = [
  {
    rowNumber: 2,
    candidateId: 'CAND-001',
    name: 'Alex Morgan',
    email: 'alex.morgan.dev@gmail.com',
    phone: '+1 (555) 234-5678',
    location: 'San Jose, CA',
    linkedin: 'https://linkedin.com/in/alexmorgan-dev',
    github: 'https://github.com/alexmorgan',
    portfolio: 'https://alexmorgan.codes',
    summary: 'Full-stack software engineer with 5 years of experience building high-traffic cloud applications, REST/GraphQL microservices, and modern React interfaces. Specialized in TypeScript, Node.js, and AWS infrastructure with a focus on high availability and developer productivity.',
    education: 'B.S. in Computer Science | University of California, Berkeley | 2017 - 2021 | GPA 3.82 | Dean\'s Honors List',
    skills: 'Languages: TypeScript, JavaScript, Python, Go, SQL, HTML5, CSS3\nFrameworks & Libraries: React, Next.js, Node.js, Express, Tailwind CSS, Jest, Playwright\nCloud & DevOps: AWS (Lambda, ECS, S3, RDS, CloudWatch), Docker, Kubernetes, Terraform, GitHub Actions\nDatabases & Storage: PostgreSQL, Redis, MongoDB, DynamoDB\nTools & Practices: Git, Agile/Scrum, CI/CD, Microservices Architecture, REST APIs',
    experience: `Senior Software Engineer | Apex Cloud Systems | San Francisco, CA | July 2022 - Present
- Architected and deployed scalable React 18/TypeScript web portal serving 450,000+ monthly active users with 99.98% uptime.
- Engineered 14 Node.js microservices on AWS ECS using PostgreSQL and Redis caching, cutting average API latency from 320ms to 85ms.
- Built automated multi-stage CI/CD pipelines via GitHub Actions and Terraform, accelerating release velocity by 60%.
- Mentored 4 junior engineers and spearheaded cross-team code quality standards, decreasing production bug escape rate by 35%.

Software Engineer | Nexus Digital Labs | Oakland, CA | June 2021 - June 2022
- Developed responsive customer dashboard components in React and Tailwind CSS, increasing user onboarding completion by 22%.
- Built RESTful backend endpoints in Node.js/Express with robust JWT authentication and role-based access control.
- Designed optimized SQL queries and indexing strategies for PostgreSQL, improving complex analytical query speeds by 40%.
- Integrated third-party payment and CRM webhooks with idempotent event handlers.`,
    projects: `Distributed Cloud File Pipeline | React, Node.js, AWS S3, Redis, Docker | https://github.com/alexmorgan/cloud-pipeline
- Engineered resilient serverless file processing pipeline uploading and converting 50GB+ daily assets with zero data loss.
- Implemented real-time progress updates via WebSockets and Redis pub/sub with sub-100ms client sync latency.

Enterprise Developer Portal | TypeScript, Next.js, Tailwind CSS, PostgreSQL | https://github.com/alexmorgan/dev-portal
- Created centralized API documentation and sandbox testing console adopted by 120+ internal engineers.
- Designed dynamic schema explorer and automated code snippet generator in 4 programming languages.`,
    certifications: 'AWS Certified Solutions Architect – Associate (2023)\nHashiCorp Certified: Terraform Associate (2024)',
    achievements: '1st Place Winner - Apex Hackathon 2023 (Best Cloud Innovation)\nAuthor of popular open-source React UI utility with 1,200+ GitHub stars',
    jobDescription: SAMPLE_JOB_DESCRIPTION,
    status: 'COMPLETED',
    resumeUrl: 'https://drive.google.com/file/d/1DEMO_ALEX_MORGAN_RESUME/view',
    generatedAt: '2026-08-23 10:15 AM',
    error: '',
  },
  {
    rowNumber: 3,
    candidateId: 'CAND-002',
    name: 'Sarah Chen',
    email: 'sarah.chen.tech@gmail.com',
    phone: '+1 (555) 345-6789',
    location: 'Seattle, WA',
    linkedin: 'https://linkedin.com/in/sarahchen-swe',
    github: 'https://github.com/sarahchen-code',
    portfolio: 'https://sarahchen.io',
    summary: 'Cloud-native backend and distributed systems engineer with 4+ years creating resilient microservices, event-driven architectures, and high-throughput data pipelines using Go, Python, and TypeScript on AWS.',
    education: 'M.S. in Software Engineering | University of Washington | 2019 - 2021\nB.S. in Computer Science | Western Washington University | 2015 - 2019',
    skills: 'Languages: Python, Go, TypeScript, Java, C++, Bash\nCloud & Platform: AWS (EKS, Lambda, SQS, SNS, DynamoDB), GCP, Docker, Kubernetes, Helm\nDatabases: PostgreSQL, Redis, Elasticsearch, Kafka\nTesting & Quality: PyTest, Jest, k6 Load Testing, Prometheus, Grafana',
    experience: `Cloud Systems Engineer | CloudVantage Technologies | Seattle, WA | Aug 2022 - Present
- Designed high-throughput event processing platform on AWS EKS and Apache Kafka handling 15M+ events daily.
- Implemented automated autoscaling policies and memory profiling that reduced monthly cloud infrastructure spend by $18,000.
- Developed gRPC and REST APIs in Go and TypeScript with strict OpenAPI documentation and automated contract testing.

Backend Developer | OmniData Solutions | Bellevue, WA | June 2021 - July 2022
- Migrated legacy monolithic services into containerized Docker microservices, improving deployment frequency from bi-weekly to daily.
- Optimized Elasticsearch search queries and PostgreSQL read replicas, slashing 95th percentile query times by 55%.`,
    projects: `EventStream Analytics Engine | Go, Kafka, Redis, PostgreSQL | https://github.com/sarahchen/event-stream
- Built real-time analytics aggregation service processing 8,000 msgs/sec with sub-5ms internal queue latency.`,
    certifications: 'AWS Certified Developer – Associate\nCertified Kubernetes Administrator (CKA)',
    achievements: 'Published technical article on High-Concurrency Microservices with 40k+ views',
    jobDescription: SAMPLE_JOB_DESCRIPTION,
    status: 'READY',
    resumeUrl: '',
    generatedAt: '',
    error: '',
  },
  {
    rowNumber: 4,
    candidateId: 'CAND-003',
    name: 'David Miller',
    email: 'david.miller.ai@outlook.com',
    phone: '+1 (555) 456-7890',
    location: 'Austin, TX',
    linkedin: 'https://linkedin.com/in/davidmiller-ai',
    github: 'https://github.com/davidmiller-dev',
    portfolio: 'https://davidmiller.dev',
    summary: 'AI Solutions and Full-Stack Engineer with 3+ years combining React/TypeScript frontends with Python and Gemini LLM backends to deliver intelligent enterprise workflows.',
    education: 'B.S. in Electrical and Computer Engineering | University of Texas at Austin | 2018 - 2022',
    skills: 'Languages: Python, TypeScript, SQL, JavaScript, C++\nAI & ML: Gemini API, LangChain, PyTorch, Embeddings, Vector Search (Pinecone/Chroma)\nWeb & Backend: React, Node.js, FastAPI, Flask, PostgreSQL, Redis\nCloud: AWS, Google Cloud Platform, Docker',
    experience: `AI Application Engineer | Cognition Labs | Austin, TX | Jan 2023 - Present
- Built generative AI document extraction engine using Gemini and FastAPI, reducing manual review time by 75% for 60+ enterprise clients.
- Developed interactive web app in React and Tailwind CSS with real-time streaming LLM responses and markdown rendering.
- Engineered hybrid vector and keyword search over 500,000+ internal knowledge base documents with PostgreSQL pgvector.

Junior Full Stack Engineer | DataSpark Software | Austin, TX | June 2022 - Dec 2022
- Maintained core client React web portal and implemented automated end-to-end integration tests.
- Designed database migrations and REST APIs in Python for customer analytics dashboards.`,
    projects: `SmartDoc Synthesizer | React, TypeScript, FastAPI, Gemini API | https://github.com/davidmiller/smart-doc
- Created automated PDF parsing and structured data summarizer with 98.4% field extraction precision.`,
    certifications: 'Google Cloud Professional Cloud Architect\nTensorFlow Developer Certificate',
    achievements: 'Graduated Magna Cum Laude with CS Departmental Distinction',
    jobDescription: SAMPLE_JOB_DESCRIPTION,
    status: 'READY',
    resumeUrl: '',
    generatedAt: '',
    error: '',
  },
  {
    rowNumber: 5,
    candidateId: 'CAND-004',
    name: 'Priya Patel',
    email: 'priya.patel.swe@gmail.com',
    phone: '+1 (555) 567-8901',
    location: 'Boston, MA',
    linkedin: 'https://linkedin.com/in/priyapatel-tech',
    github: 'https://github.com/priyapatel-code',
    portfolio: 'https://priyapatel.me',
    summary: 'Frontend and Full Stack Engineer with 4 years specializing in modular React component architecture, state management, web performance optimization, and TypeScript integration.',
    education: 'B.S. in Computer Science | Northeastern University | 2017 - 2021',
    skills: 'Frontend: React, TypeScript, Next.js, Redux Toolkit, Tailwind CSS, Framer Motion, HTML5/CSS3\nBackend: Node.js, Express, REST APIs, GraphQL\nTesting & Tooling: Jest, React Testing Library, Cypress, Webpack, Vite, Git',
    experience: `Frontend Engineer | Horizon Web Solutions | Boston, MA | Aug 2022 - Present
- Spearheaded frontend rewrite to Next.js and TypeScript, boosting Google Lighthouse performance scores from 54 to 96.
- Built reusable design system component library with 40+ accessible UI components used across 5 distinct web products.
- Decreased initial bundle payload by 42% through code-splitting, tree-shaking, and asset compression.

Web Developer | Beacon Interactive | Cambridge, MA | July 2021 - July 2022
- Developed responsive client web apps in React with cross-browser compatibility and WCAG 2.1 AA accessibility compliance.
- Collaborated with UX team to conduct A/B testing, increasing conversion rate by 18%.`,
    projects: `Design System Orchestrator | React, TypeScript, Tailwind, Storybook | https://github.com/priyapatel/design-kit
- Created comprehensive component catalog with automated visual regression tests and dark mode tokens.`,
    certifications: 'Meta Certified Frontend Developer\nCertified ScrumMaster (CSM)',
    achievements: 'Speaker at Boston React Meetup 2024 ("Modern Performance Patterns in React 19")',
    jobDescription: SAMPLE_JOB_DESCRIPTION,
    status: 'READY',
    resumeUrl: '',
    generatedAt: '',
    error: '',
  },
  {
    rowNumber: 6,
    candidateId: 'CAND-005',
    name: 'Marcus Vance',
    email: 'marcus.vance.cloud@gmail.com',
    phone: '+1 (555) 678-9012',
    location: 'New York, NY',
    linkedin: 'https://linkedin.com/in/marcusvance-devops',
    github: 'https://github.com/marcusvance',
    portfolio: 'https://marcusvance.cloud',
    summary: 'DevOps & Site Reliability Engineer with 5+ years automating cloud infrastructure, Kubernetes orchestration, CI/CD pipelines, and high-availability systems on AWS and GCP.',
    education: 'B.S. in Information Systems | New York University | 2016 - 2020',
    skills: 'DevOps: Kubernetes, Docker, Terraform, Ansible, Helm, ArgoCD, GitHub Actions, Jenkins\nCloud: AWS (EKS, VPC, Route53, IAM, CloudFront), GCP (GKE, Cloud Run)\nMonitoring: Prometheus, Grafana, Datadog, ELK Stack\nLanguages: Python, Bash, Go, YAML, HCL',
    experience: `Lead DevOps Engineer | MetroCloud Infrastructure | New York, NY | Oct 2022 - Present
- Managed multi-region Kubernetes clusters across 3 AWS regions with 99.99% availability for financial clients.
- Automated zero-downtime blue/green deployments with ArgoCD and Helm, handling 200+ releases per month.
- Enforced automated security compliance scanning in CI/CD pipeline, reducing vulnerability triage time by 50%.`,
    projects: `Terraform AWS Cluster Template | Terraform, AWS EKS, Helm | https://github.com/marcusvance/terraform-eks
- Open-source infrastructure-as-code boilerplate with 800+ forks used for rapid enterprise cloud provisioning.`,
    certifications: 'AWS Certified DevOps Engineer – Professional\nCertified Kubernetes Security Specialist (CKS)',
    achievements: 'Awarded Employee of the Year 2023 at MetroCloud Infrastructure',
    jobDescription: SAMPLE_JOB_DESCRIPTION,
    status: 'READY',
    resumeUrl: '',
    generatedAt: '',
    error: '',
  }
];
