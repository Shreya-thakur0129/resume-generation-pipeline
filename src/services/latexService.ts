import { ResumeJSON, ResumeFormatSettings } from '../types';

/**
 * Escapes special LaTeX characters to prevent compilation errors and injection
 */
export function escapeLatex(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/"/g, "''")
    .replace(/</g, '\\textless{}')
    .replace(/>/g, '\\textgreater{}');
}

/**
 * Generates a clean, ATS-compliant, deterministic LaTeX document from structured ResumeJSON
 */
export function generateLatexResume(resume: ResumeJSON, formatSettings?: Partial<ResumeFormatSettings>): string {
  const settings: ResumeFormatSettings = {
    template: 'modern',
    pageTarget: 'auto',
    maxExperienceBullets: 5,
    maxProjects: 3,
    font: 'Helvetica',
    marginSize: 'compact',
    showLinkedIn: true,
    showGitHub: true,
    showPortfolio: true,
    ...formatSettings,
  };

  const marginInches = settings.marginSize === 'compact' ? '0.5in' : settings.marginSize === 'relaxed' ? '0.75in' : '0.6in';
  
  // Format contact links
  const contactParts: string[] = [];
  if (resume.candidate.email) {
    contactParts.push(`\\href{mailto:${escapeLatex(resume.candidate.email)}}{${escapeLatex(resume.candidate.email)}}`);
  }
  if (resume.candidate.phone) {
    contactParts.push(escapeLatex(resume.candidate.phone));
  }
  if (resume.candidate.location) {
    contactParts.push(escapeLatex(resume.candidate.location));
  }
  if (settings.showLinkedIn && resume.candidate.linkedin) {
    const display = resume.candidate.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, 'linkedin.com/in/');
    contactParts.push(`\\href{${escapeLatex(resume.candidate.linkedin)}}{${escapeLatex(display)}}`);
  }
  if (settings.showGitHub && resume.candidate.github) {
    const display = resume.candidate.github.replace(/^https?:\/\/(www\.)?github\.com\//, 'github.com/');
    contactParts.push(`\\href{${escapeLatex(resume.candidate.github)}}{${escapeLatex(display)}}`);
  }
  if (settings.showPortfolio && resume.candidate.portfolio) {
    const display = resume.candidate.portfolio.replace(/^https?:\/\/(www\.)?/, '');
    contactParts.push(`\\href{${escapeLatex(resume.candidate.portfolio)}}{${escapeLatex(display)}}`);
  }

  // Skills section
  let skillsLatex = '';
  if (resume.skills && resume.skills.length > 0) {
    skillsLatex = `\\section*{TECHNICAL SKILLS}\n\\begin{itemize}[leftmargin=0.15in, label={}]\n`;
    for (const skillCat of resume.skills) {
      if (skillCat.items && skillCat.items.length > 0) {
        skillsLatex += `  \\item \\textbf{${escapeLatex(skillCat.category)}:} ${skillCat.items.map(s => escapeLatex(s)).join(', ')}\n`;
      }
    }
    skillsLatex += `\\end{itemize}\n\\vspace{4pt}\n`;
  }

  // Experience section
  let experienceLatex = '';
  if (resume.experience && resume.experience.length > 0) {
    experienceLatex = `\\section*{PROFESSIONAL EXPERIENCE}\n`;
    for (const exp of resume.experience) {
      experienceLatex += `\\noindent\\textbf{${escapeLatex(exp.role)}} \\hfill \\textbf{${escapeLatex(exp.startDate)} -- ${escapeLatex(exp.endDate)}}\\\\\n`;
      experienceLatex += `\\textit{${escapeLatex(exp.company)}}${exp.location ? ` \\hfill \\textit{${escapeLatex(exp.location)}}` : ''}\n`;
      
      const bullets = (exp.bullets || []).slice(0, settings.maxExperienceBullets);
      if (bullets.length > 0) {
        experienceLatex += `\\begin{itemize}[leftmargin=0.2in, topsep=2pt, itemsep=2pt]\n`;
        for (const bullet of bullets) {
          experienceLatex += `  \\item ${escapeLatex(bullet)}\n`;
        }
        experienceLatex += `\\end{itemize}\n\\vspace{4pt}\n`;
      }
    }
  }

  // Projects section
  let projectsLatex = '';
  if (resume.projects && resume.projects.length > 0) {
    const projList = resume.projects.slice(0, settings.maxProjects);
    projectsLatex = `\\section*{KEY PROJECTS}\n`;
    for (const proj of projList) {
      const techStr = proj.technologies && proj.technologies.length > 0 ? ` $|$ \\textit{${proj.technologies.map(t => escapeLatex(t)).join(', ')}}` : '';
      const linkStr = proj.link ? ` \\hfill \\href{${escapeLatex(proj.link)}}{\\small\\texttt{View Project}}` : '';
      projectsLatex += `\\noindent\\textbf{${escapeLatex(proj.title)}}${techStr}${linkStr}\n`;
      
      if (proj.bullets && proj.bullets.length > 0) {
        projectsLatex += `\\begin{itemize}[leftmargin=0.2in, topsep=2pt, itemsep=2pt]\n`;
        for (const bullet of proj.bullets) {
          projectsLatex += `  \\item ${escapeLatex(bullet)}\n`;
        }
        projectsLatex += `\\end{itemize}\n\\vspace{4pt}\n`;
      }
    }
  }

  // Education section
  let educationLatex = '';
  if (resume.education && resume.education.length > 0) {
    educationLatex = `\\section*{EDUCATION}\n`;
    for (const edu of resume.education) {
      educationLatex += `\\noindent\\textbf{${escapeLatex(edu.institution)}} \\hfill \\textbf{${escapeLatex(edu.gradDate || '')}}\\\\\n`;
      educationLatex += `\\textit{${escapeLatex(edu.degree)}}${edu.location ? ` \\hfill \\textit{${escapeLatex(edu.location)}}` : ''}\n`;
      if (edu.gpaOrHonors) {
        educationLatex += `\\\\\\small ${escapeLatex(edu.gpaOrHonors)}\n`;
      }
      if (edu.highlights && edu.highlights.length > 0) {
        educationLatex += `\\begin{itemize}[leftmargin=0.2in, topsep=1pt, itemsep=1pt]\n`;
        for (const h of edu.highlights) {
          educationLatex += `  \\item ${escapeLatex(h)}\n`;
        }
        educationLatex += `\\end{itemize}\n`;
      }
      educationLatex += `\\vspace{3pt}\n`;
    }
  }

  // Certifications section
  let certsLatex = '';
  if (resume.certifications && resume.certifications.length > 0) {
    certsLatex = `\\section*{CERTIFICATIONS}\n\\begin{itemize}[leftmargin=0.15in, label={}]\n`;
    for (const cert of resume.certifications) {
      const issuerStr = cert.issuer ? ` -- \\textit{${escapeLatex(cert.issuer)}}` : '';
      const dateStr = cert.date ? ` \\hfill ${escapeLatex(cert.date)}` : '';
      certsLatex += `  \\item \\textbf{${escapeLatex(cert.name)}}${issuerStr}${dateStr}\n`;
    }
    certsLatex += `\\end{itemize}\n\\vspace{3pt}\n`;
  }

  // Achievements section
  let achievementsLatex = '';
  if (resume.achievements && resume.achievements.length > 0) {
    achievementsLatex = `\\section*{HONORS \\& ACHIEVEMENTS}\n\\begin{itemize}[leftmargin=0.2in, topsep=2pt, itemsep=2pt]\n`;
    for (const ach of resume.achievements) {
      achievementsLatex += `  \\item ${escapeLatex(ach)}\n`;
    }
    achievementsLatex += `\\end{itemize}\n\\vspace{3pt}\n`;
  }

  // Summary section
  let summaryLatex = '';
  if (resume.summary && resume.summary.trim().length > 0) {
    summaryLatex = `\\section*{PROFESSIONAL SUMMARY}\n\\noindent ${escapeLatex(resume.summary.trim())}\n\\vspace{4pt}\n`;
  }

  return `%-------------------------
% Auto-Generated ATS Resume (Resume Generation Pipeline v1.0.0)
% Compile with pdflatex / xelatex
% Candidate: ${escapeLatex(resume.candidate.name)}
% Generated at: ${new Date().toISOString()}
%-------------------------

\\documentclass[letterpaper,10pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{geometry}

\\geometry{
  top=${marginInches},
  bottom=${marginInches},
  left=${marginInches},
  right=${marginInches}
}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-3pt}]

\\begin{document}

%----------HEADING----------
\\begin{center}
  {\\Huge \\scshape \\textbf{${escapeLatex(resume.candidate.name)}}} \\\\ \\vspace{4pt}
  \\small ${contactParts.join(' $|$ ')}
\\end{center}
\\vspace{-4pt}

${summaryLatex}
${skillsLatex}
${experienceLatex}
${projectsLatex}
${educationLatex}
${certsLatex}
${achievementsLatex}

\\end{document}
`;
}
