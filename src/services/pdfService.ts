import { jsPDF } from 'jspdf';
import { ResumeJSON, ResumeFormatSettings } from '../types';

export interface CompilationResult {
  success: boolean;
  pdfBase64: string;
  pdfBlobUrl: string;
  pdfArrayBuffer: ArrayBuffer;
  pageCount: number;
  warnings: string[];
  compilerOutput: string;
  durationMs: number;
}

/**
 * Compiles structured Resume data into a professional, ATS-compliant PDF document
 */
export async function compileResumeToPdf(
  resume: ResumeJSON,
  settings?: Partial<ResumeFormatSettings>
): Promise<CompilationResult> {
  const startTime = Date.now();
  const warnings: string[] = [...(resume.warnings || [])];
  const logLines: string[] = [
    `[LATEX_COMPILER] Initializing PDF vector render pipeline...`,
    `[LATEX_COMPILER] Layout: letter size (8.5 x 11 in), standard ATS typography`,
    `[LATEX_COMPILER] Candidate: ${resume.candidate.name || 'Anonymous'}`,
  ];

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter', // 612 x 792 pt
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = settings?.marginSize === 'compact' ? 36 : settings?.marginSize === 'relaxed' ? 54 : 42;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
        logLines.push(`[LATEX_COMPILER] Page break triggered. Current page: ${doc.getNumberOfPages()}`);
      }
    };

    // 1. HEADER (Candidate Name + Contact Info)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(20, 24, 33);
    const candidateName = (resume.candidate.name || 'Candidate Name').toUpperCase();
    doc.text(candidateName, pageWidth / 2, y, { align: 'center' });
    y += 18;

    // Contact info bar
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(70, 78, 95);

    const contactItems: string[] = [];
    if (resume.candidate.email) contactItems.push(resume.candidate.email);
    if (resume.candidate.phone) contactItems.push(resume.candidate.phone);
    if (resume.candidate.location) contactItems.push(resume.candidate.location);
    if (resume.candidate.linkedin) {
      contactItems.push(resume.candidate.linkedin.replace(/^https?:\/\/(www\.)?/, ''));
    }
    if (resume.candidate.github) {
      contactItems.push(resume.candidate.github.replace(/^https?:\/\/(www\.)?/, ''));
    }
    if (resume.candidate.portfolio) {
      contactItems.push(resume.candidate.portfolio.replace(/^https?:\/\/(www\.)?/, ''));
    }

    const contactString = contactItems.join('  •  ');
    doc.text(contactString, pageWidth / 2, y, { align: 'center' });
    y += 16;

    // Helper to render ATS Section Heading
    const renderSectionHeading = (title: string) => {
      checkPageBreak(30);
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(title.toUpperCase(), margin, y);
      y += 4;

      // Horizontal line rule
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.75);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
    };

    // 2. PROFESSIONAL SUMMARY (if present)
    if (resume.summary && resume.summary.trim().length > 0) {
      renderSectionHeading('Professional Summary');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(40, 45, 55);
      
      const summaryLines = doc.splitTextToSize(resume.summary.trim(), contentWidth);
      checkPageBreak(summaryLines.length * 12 + 8);
      doc.text(summaryLines, margin, y);
      y += summaryLines.length * 12 + 6;
    }

    // 3. TECHNICAL SKILLS
    if (resume.skills && resume.skills.length > 0) {
      renderSectionHeading('Technical Skills');
      doc.setFontSize(9.5);

      for (const cat of resume.skills) {
        if (!cat.items || cat.items.length === 0) continue;
        checkPageBreak(16);
        
        const categoryLabel = `${cat.category}: `;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        const catWidth = doc.getTextWidth(categoryLabel);
        
        doc.text(categoryLabel, margin, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const skillsListStr = cat.items.join(', ');
        const remainingWidth = contentWidth - catWidth;
        const skillLines = doc.splitTextToSize(skillsListStr, remainingWidth);

        if (skillLines.length === 1) {
          doc.text(skillLines[0], margin + catWidth, y);
          y += 13;
        } else {
          doc.text(skillLines[0], margin + catWidth, y);
          y += 13;
          for (let i = 1; i < skillLines.length; i++) {
            checkPageBreak(13);
            doc.text(skillLines[i], margin + 12, y);
            y += 13;
          }
        }
      }
      y += 4;
    }

    // 4. PROFESSIONAL EXPERIENCE
    if (resume.experience && resume.experience.length > 0) {
      renderSectionHeading('Professional Experience');

      for (const exp of resume.experience) {
        checkPageBreak(35);
        
        // Role & Dates
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.8);
        doc.setTextColor(15, 23, 42);
        doc.text(exp.role, margin, y);

        const dateRange = `${exp.startDate || ''} – ${exp.endDate || 'Present'}`;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text(dateRange, pageWidth - margin, y, { align: 'right' });
        y += 12;

        // Company & Location
        doc.setFont('helvetica', 'oblique');
        doc.setFontSize(9.2);
        doc.setTextColor(51, 65, 85);
        doc.text(exp.company, margin, y);

        if (exp.location) {
          doc.text(exp.location, pageWidth - margin, y, { align: 'right' });
        }
        y += 10;

        // Bullets
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(40, 45, 55);

        const maxBullets = settings?.maxExperienceBullets || 5;
        const bulletsToRender = (exp.bullets || []).slice(0, maxBullets);

        for (const bullet of bulletsToRender) {
          const bulletIndent = 12;
          const bulletLines = doc.splitTextToSize(bullet, contentWidth - bulletIndent);
          checkPageBreak(bulletLines.length * 11.5 + 3);

          // Draw bullet dot
          doc.setTextColor(100, 116, 139);
          doc.text('•', margin + 3, y);

          // Draw text
          doc.setTextColor(40, 45, 55);
          doc.text(bulletLines, margin + bulletIndent, y);
          y += bulletLines.length * 11.5 + 2;
        }
        y += 4;
      }
    }

    // 5. KEY PROJECTS
    if (resume.projects && resume.projects.length > 0) {
      renderSectionHeading('Key Projects');
      const maxProjs = settings?.maxProjects || 3;
      const projsToRender = resume.projects.slice(0, maxProjs);

      for (const proj of projsToRender) {
        checkPageBreak(30);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.8);
        doc.setTextColor(15, 23, 42);
        const titleWidth = doc.getTextWidth(proj.title);
        doc.text(proj.title, margin, y);

        if (proj.technologies && proj.technologies.length > 0) {
          doc.setFont('helvetica', 'oblique');
          doc.setFontSize(8.8);
          doc.setTextColor(80, 90, 105);
          const techStr = `  |  ${proj.technologies.join(', ')}`;
          doc.text(techStr, margin + titleWidth, y);
        }

        if (proj.link) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(37, 99, 235); // link blue
          doc.text('View Project ↗', pageWidth - margin, y, { align: 'right' });
        }
        y += 11;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(40, 45, 55);

        for (const bullet of proj.bullets || []) {
          const bulletIndent = 12;
          const bulletLines = doc.splitTextToSize(bullet, contentWidth - bulletIndent);
          checkPageBreak(bulletLines.length * 11.5 + 3);

          doc.setTextColor(100, 116, 139);
          doc.text('•', margin + 3, y);

          doc.setTextColor(40, 45, 55);
          doc.text(bulletLines, margin + bulletIndent, y);
          y += bulletLines.length * 11.5 + 2;
        }
        y += 4;
      }
    }

    // 6. EDUCATION
    if (resume.education && resume.education.length > 0) {
      renderSectionHeading('Education');

      for (const edu of resume.education) {
        checkPageBreak(28);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.8);
        doc.setTextColor(15, 23, 42);
        doc.text(edu.institution, margin, y);

        if (edu.gradDate) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(71, 85, 105);
          doc.text(edu.gradDate, pageWidth - margin, y, { align: 'right' });
        }
        y += 12;

        doc.setFont('helvetica', 'oblique');
        doc.setFontSize(9.2);
        doc.setTextColor(51, 65, 85);
        doc.text(edu.degree, margin, y);

        if (edu.location) {
          doc.text(edu.location, pageWidth - margin, y, { align: 'right' });
        }
        y += 10;

        if (edu.gpaOrHonors) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.8);
          doc.setTextColor(80, 90, 105);
          doc.text(edu.gpaOrHonors, margin + 8, y);
          y += 10;
        }

        if (edu.highlights && edu.highlights.length > 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.8);
          for (const h of edu.highlights) {
            checkPageBreak(12);
            doc.text(`• ${h}`, margin + 8, y);
            y += 10;
          }
        }
        y += 3;
      }
    }

    // 7. CERTIFICATIONS
    if (resume.certifications && resume.certifications.length > 0) {
      renderSectionHeading('Certifications');
      doc.setFontSize(9);

      for (const cert of resume.certifications) {
        checkPageBreak(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(cert.name, margin + 4, y);

        let details = '';
        if (cert.issuer) details += ` — ${cert.issuer}`;
        if (cert.date) details += ` (${cert.date})`;

        if (details) {
          const nameWidth = doc.getTextWidth(cert.name);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(details, margin + 4 + nameWidth, y);
        }
        y += 12;
      }
      y += 3;
    }

    // 8. HONORS & ACHIEVEMENTS
    if (resume.achievements && resume.achievements.length > 0) {
      renderSectionHeading('Honors & Achievements');
      doc.setFontSize(9);

      for (const ach of resume.achievements) {
        const achLines = doc.splitTextToSize(ach, contentWidth - 12);
        checkPageBreak(achLines.length * 11.5 + 2);

        doc.setTextColor(100, 116, 139);
        doc.text('•', margin + 3, y);

        doc.setTextColor(40, 45, 55);
        doc.text(achLines, margin + 12, y);
        y += achLines.length * 11.5 + 2;
      }
    }

    const totalPages = doc.getNumberOfPages();
    const pdfArrayBuffer = doc.output('arraybuffer');
    const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
    const pdfBlobUrl = URL.createObjectURL(pdfBlob);
    
    // Base64 string
    const pdfBase64 = doc.output('datauristring').split(',')[1] || '';

    const durationMs = Date.now() - startTime;
    logLines.push(`[LATEX_COMPILER] PDF compilation successful (${totalPages} page${totalPages > 1 ? 's' : ''}) in ${durationMs}ms`);

    return {
      success: true,
      pdfBase64,
      pdfBlobUrl,
      pdfArrayBuffer,
      pageCount: totalPages,
      warnings,
      compilerOutput: logLines.join('\n'),
      durationMs,
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    logLines.push(`[LATEX_COMPILER] ERROR: ${error?.message || 'Unknown compilation failure'}`);
    return {
      success: false,
      pdfBase64: '',
      pdfBlobUrl: '',
      pdfArrayBuffer: new ArrayBuffer(0),
      pageCount: 0,
      warnings: [...warnings, error?.message || 'Compilation error'],
      compilerOutput: logLines.join('\n'),
      durationMs,
    };
  }
}
