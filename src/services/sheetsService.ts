import { CandidateRawData, ColumnMapping, GoogleSheetsConfig } from '../types';
import { SAMPLE_CANDIDATES } from '../data/sampleData';

/**
 * Extracts a Google Spreadsheet ID from either a direct ID or a full Google Sheets URL
 */
export function extractSpreadsheetId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

export interface SheetMetadata {
  title: string;
  sheets: { title: string; sheetId: number; rowCount: number; columnCount: number }[];
}

/**
 * Fetches Spreadsheet Metadata (tab names, title) using the Google Sheets REST API
 */
export async function fetchSpreadsheetMetadata(
  spreadsheetId: string,
  accessToken: string | null,
  isDemoMode: boolean = false
): Promise<SheetMetadata> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  
  if (isDemoMode || !accessToken) {
    return {
      title: 'Enterprise Candidates Master [DEMO]',
      sheets: [
        { title: 'Engineering Candidates', sheetId: 0, rowCount: 10, columnCount: 20 },
        { title: 'Archived Applications', sheetId: 1, rowCount: 5, columnCount: 20 },
      ],
    };
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=properties.title,sheets.properties`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody?.error?.message || res.statusText;
    if (res.status === 404) {
      throw new Error(`Spreadsheet not found (ID: ${cleanId}). Check that the ID or URL is correct and shared with your account.`);
    }
    if (res.status === 403) {
      throw new Error(`Access Denied (403): Your Google account does not have permission to view this spreadsheet. Error: ${message}`);
    }
    throw new Error(`Google Sheets API Error (${res.status}): ${message}`);
  }

  const data = await res.json();
  const title = data.properties?.title || 'Untitled Spreadsheet';
  const sheets = (data.sheets || []).map((s: any) => ({
    title: s.properties?.title || 'Sheet1',
    sheetId: s.properties?.sheetId || 0,
    rowCount: s.properties?.gridProperties?.rowCount || 100,
    columnCount: s.properties?.gridProperties?.columnCount || 26,
  }));

  return { title, sheets };
}

/**
 * Fetches rows from a worksheet and maps them to CandidateRawData objects
 */
export async function fetchWorksheetCandidates(
  config: GoogleSheetsConfig,
  accessToken: string | null,
  isDemoMode: boolean = false
): Promise<{ headers: string[]; candidates: CandidateRawData[] }> {
  if (isDemoMode || !accessToken) {
    return {
      headers: Object.values(config.columnMapping),
      candidates: SAMPLE_CANDIDATES,
    };
  }

  const cleanId = extractSpreadsheetId(config.spreadsheetId);
  const sheetName = config.worksheetName || 'Sheet1';
  const range = `'${sheetName}'!A1:ZZ500`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(range)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(`Failed to read sheet "${sheetName}": ${errorBody?.error?.message || res.statusText}`);
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];
  if (rows.length === 0) {
    return { headers: [], candidates: [] };
  }

  const headers = rows[0].map(h => (h || '').trim());
  const headerMap: Record<string, number> = {};
  headers.forEach((h, idx) => {
    headerMap[h.toLowerCase()] = idx;
  });

  const getColIdx = (mappedName: string): number => {
    if (!mappedName) return -1;
    const lower = mappedName.trim().toLowerCase();
    if (headerMap[lower] !== undefined) return headerMap[lower];
    // fuzzy check
    for (const h of Object.keys(headerMap)) {
      if (h.includes(lower) || lower.includes(h)) return headerMap[h];
    }
    return -1;
  };

  const mapping = config.columnMapping;
  const idIdx = getColIdx(mapping.candidateId);
  const nameIdx = getColIdx(mapping.name);
  const emailIdx = getColIdx(mapping.email);
  const phoneIdx = getColIdx(mapping.phone);
  const locIdx = getColIdx(mapping.location);
  const linkedinIdx = getColIdx(mapping.linkedin);
  const githubIdx = getColIdx(mapping.github);
  const portfolioIdx = getColIdx(mapping.portfolio);
  const summaryIdx = getColIdx(mapping.summary);
  const eduIdx = getColIdx(mapping.education);
  const skillsIdx = getColIdx(mapping.skills);
  const expIdx = getColIdx(mapping.experience);
  const projIdx = getColIdx(mapping.projects);
  const certIdx = getColIdx(mapping.certifications);
  const achIdx = getColIdx(mapping.achievements);
  const jdIdx = getColIdx(mapping.jobDescription);
  const statusIdx = getColIdx(mapping.status);
  const resumeUrlIdx = getColIdx(mapping.resumeUrl);
  const genAtIdx = getColIdx(mapping.generatedAt);
  const errorIdx = getColIdx(mapping.error);

  const candidates: CandidateRawData[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const rawRow: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rawRow[h] = row[idx] || '';
    });

    const nameVal = (nameIdx >= 0 ? row[nameIdx] : row[1] || '').trim();
    if (!nameVal && !row[0]) continue; // Skip completely empty rows

    candidates.push({
      rowNumber: r + 1, // 1-indexed row number in Google Sheets
      candidateId: (idIdx >= 0 ? row[idIdx] : `CAND-${r}`).trim() || `CAND-${r}`,
      name: nameVal || `Candidate ${r}`,
      email: (emailIdx >= 0 ? row[emailIdx] : '').trim(),
      phone: (phoneIdx >= 0 ? row[phoneIdx] : '').trim(),
      location: (locIdx >= 0 ? row[locIdx] : '').trim(),
      linkedin: (linkedinIdx >= 0 ? row[linkedinIdx] : '').trim(),
      github: (githubIdx >= 0 ? row[githubIdx] : '').trim(),
      portfolio: (portfolioIdx >= 0 ? row[portfolioIdx] : '').trim(),
      summary: (summaryIdx >= 0 ? row[summaryIdx] : '').trim(),
      education: (eduIdx >= 0 ? row[eduIdx] : '').trim(),
      skills: (skillsIdx >= 0 ? row[skillsIdx] : '').trim(),
      experience: (expIdx >= 0 ? row[expIdx] : '').trim(),
      projects: (projIdx >= 0 ? row[projIdx] : '').trim(),
      certifications: (certIdx >= 0 ? row[certIdx] : '').trim(),
      achievements: (achIdx >= 0 ? row[achIdx] : '').trim(),
      jobDescription: (jdIdx >= 0 ? row[jdIdx] : '').trim(),
      status: (statusIdx >= 0 ? row[statusIdx] : 'PENDING').trim(),
      resumeUrl: (resumeUrlIdx >= 0 ? row[resumeUrlIdx] : '').trim(),
      generatedAt: (genAtIdx >= 0 ? row[genAtIdx] : '').trim(),
      error: (errorIdx >= 0 ? row[errorIdx] : '').trim(),
      rawRow,
    });
  }

  return { headers, candidates };
}

/**
 * Commits the completed resume status, Drive link, and timestamp back to the Google Sheet row
 */
export async function commitCandidateStatusToSheet(
  config: GoogleSheetsConfig,
  rowNumber: number,
  updates: {
    status: 'COMPLETED' | 'FAILED';
    resumeUrl?: string;
    error?: string;
    generatedAt?: string;
  },
  accessToken: string | null,
  isDemoMode: boolean = false
): Promise<{ success: boolean; message: string }> {
  if (isDemoMode || !accessToken) {
    return {
      success: true,
      message: `[DEMO MODE] Successfully simulated commit for Row ${rowNumber}: Status=${updates.status}`,
    };
  }

  const cleanId = extractSpreadsheetId(config.spreadsheetId);
  const sheetName = config.worksheetName || 'Sheet1';
  
  // First get header names to find target columns
  const headerUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/'${sheetName}'!1:1`;
  const headerRes = await fetch(headerUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!headerRes.ok) {
    throw new Error(`Failed to inspect sheet headers before commit: ${headerRes.statusText}`);
  }

  const headerData = await headerRes.json();
  const headers: string[] = (headerData.values && headerData.values[0]) || [];

  // Helper to convert 0-indexed col to A1 notation column letter (0->A, 25->Z, 26->AA)
  const colToLetter = (col: number): string => {
    let temp = col;
    let letter = '';
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  };

  const getColLetter = (mappedName: string, defaultCol: number): string => {
    const lower = mappedName.toLowerCase();
    const idx = headers.findIndex(h => (h || '').trim().toLowerCase() === lower);
    if (idx >= 0) return colToLetter(idx);
    return colToLetter(defaultCol);
  };

  const mapping = config.columnMapping;
  const statusCol = getColLetter(mapping.status, 16);
  const resumeUrlCol = getColLetter(mapping.resumeUrl, 17);
  const genAtCol = getColLetter(mapping.generatedAt, 18);
  const errorCol = getColLetter(mapping.error, 19);

  const valueRanges = [
    {
      range: `'${sheetName}'!${statusCol}${rowNumber}`,
      values: [[updates.status]],
    },
    {
      range: `'${sheetName}'!${resumeUrlCol}${rowNumber}`,
      values: [[updates.resumeUrl || '']],
    },
    {
      range: `'${sheetName}'!${genAtCol}${rowNumber}`,
      values: [[updates.generatedAt || new Date().toLocaleString()]],
    },
    {
      range: `'${sheetName}'!${errorCol}${rowNumber}`,
      values: [[updates.error || '']],
    },
  ];

  const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values:batchUpdate`;
  const batchRes = await fetch(batchUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: valueRanges,
    }),
  });

  if (!batchRes.ok) {
    const errBody = await batchRes.json().catch(() => ({}));
    throw new Error(`Failed to commit updates to Row ${rowNumber}: ${errBody?.error?.message || batchRes.statusText}`);
  }

  return {
    success: true,
    message: `Updated Row ${rowNumber} in sheet "${sheetName}": Status = ${updates.status}`,
  };
}
