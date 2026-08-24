import { GoogleDriveConfig } from '../types';

export interface DriveUploadResult {
  fileId: string;
  fileName: string;
  webViewLink: string;
  sizeBytes: number;
  uploadedAt: string;
}

/**
 * Finds or creates a subfolder in Google Drive by name
 */
export async function getOrCreateDriveFolder(
  folderName: string,
  parentFolderId: string | null,
  accessToken: string
): Promise<string> {
  // Query if folder already exists
  let query = `name = '${folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentFolderId && parentFolderId.trim().length > 0) {
    query += ` and '${parentFolderId.trim()}' in parents`;
  }

  try {
    const listRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&spaces=drive`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (listRes.ok) {
      const data = await listRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }
  } catch (err) {
    console.warn('[Drive] Query for folder failed, will try create:', err);
  }

  // Create folder
  const folderMetadata: { name: string; mimeType: string; parents?: string[] } = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentFolderId && parentFolderId.trim().length > 0) {
    folderMetadata.parents = [parentFolderId.trim()];
  }

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(folderMetadata),
  });

  if (!createRes.ok) {
    const errorBody = await createRes.json().catch(() => ({}));
    throw new Error(`Failed to create Drive folder "${folderName}": ${errorBody?.error?.message || createRes.statusText}`);
  }

  const createdData = await createRes.json();
  return createdData.id;
}

/**
 * Uploads a compiled PDF document to Google Drive using the Drive v3 REST API
 */
export async function uploadPdfToDrive(
  pdfBlob: Blob,
  fileName: string,
  config: GoogleDriveConfig,
  accessToken: string | null,
  isDemoMode: boolean = false
): Promise<DriveUploadResult> {
  const timestamp = new Date().toISOString();

  if (isDemoMode || !accessToken) {
    const mockFileId = `1DEMO_DRIVE_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    return {
      fileId: mockFileId,
      fileName,
      webViewLink: `https://drive.google.com/file/d/${mockFileId}/view?usp=sharing`,
      sizeBytes: pdfBlob.size || 84200,
      uploadedAt: timestamp,
    };
  }

  // 1. Prepare metadata
  const metadata: { name: string; mimeType: string; parents?: string[] } = {
    name: fileName,
    mimeType: 'application/pdf',
  };

  if (config.folderId && config.folderId.trim().length > 0) {
    metadata.parents = [config.folderId.trim()];
  }

  // 2. Prepare multipart body
  const boundary = '-------ResumePipelineBoundary' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
  const mediaPartHeader = `${delimiter}Content-Type: application/pdf\r\n\r\n`;

  const pdfArrayBuffer = await pdfBlob.arrayBuffer();
  const pdfBytes = new Uint8Array(pdfArrayBuffer);

  const enc = new TextEncoder();
  const metaBytes = enc.encode(metadataPart);
  const headerBytes = enc.encode(mediaPartHeader);
  const closeBytes = enc.encode(closeDelimiter);

  // Combine into single Uint8Array
  const totalLength = metaBytes.byteLength + headerBytes.byteLength + pdfBytes.byteLength + closeBytes.byteLength;
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  combined.set(metaBytes, offset); offset += metaBytes.byteLength;
  combined.set(headerBytes, offset); offset += headerBytes.byteLength;
  combined.set(pdfBytes, offset); offset += pdfBytes.byteLength;
  combined.set(closeBytes, offset);

  const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,size`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
      'Content-Length': String(totalLength),
    },
    body: combined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody?.error?.message || res.statusText;
    if (res.status === 403) {
      throw new Error(`Drive Permission Denied (403): Cannot write to the specified Drive folder. Check folder permissions or target folder ID. Error: ${message}`);
    }
    if (res.status === 404) {
      throw new Error(`Drive Target Folder Not Found (404): Check folder ID "${config.folderId}".`);
    }
    throw new Error(`Google Drive Upload Failed (${res.status}): ${message}`);
  }

  const uploadedFile = await res.json();
  const fileId = uploadedFile.id;
  const webViewLink = uploadedFile.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;

  // 3. Set sharing permissions if requested
  if (config.sharingMode === 'LINK_ACCESS') {
    try {
      const permUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`;
      await fetch(permUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone',
        }),
      });
    } catch (permErr) {
      console.warn('Could not set public link permission on file:', permErr);
    }
  }

  return {
    fileId,
    fileName: uploadedFile.name || fileName,
    webViewLink,
    sizeBytes: parseInt(uploadedFile.size || '0', 10) || pdfBlob.size,
    uploadedAt: timestamp,
  };
}
