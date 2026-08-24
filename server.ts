import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { analyzeJobDescription, generateStructuredResume, transcribeAudio, generateCandidateTailoredLatexAI } from './server/gemini.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // 1. Health check & Diagnostics
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      version: 'v1.0.0',
      service: 'Resume Generation Pipeline Backend',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Job Description Analysis API
  app.post('/api/gemini/analyze-jd', async (req, res) => {
    try {
      const { jdText } = req.body;
      if (!jdText || typeof jdText !== 'string') {
        res.status(400).json({ error: 'Missing or invalid "jdText" parameter.' });
        return;
      }

      const analysis = await analyzeJobDescription(jdText);
      res.json({ success: true, analysis });
    } catch (err: any) {
      console.error('Error analyzing job description:', err);
      res.status(500).json({
        error: err.message || 'Failed to analyze Job Description with Gemini.',
      });
    }
  });

  // 3. Resume Generation API
  app.post('/api/gemini/generate-resume', async (req, res) => {
    try {
      const { candidate, jdAnalysis, options } = req.body;
      if (!candidate || !candidate.name) {
        res.status(400).json({ error: 'Missing candidate data.' });
        return;
      }

      const resumeJson = await generateStructuredResume(candidate, jdAnalysis, options);
      res.json({ success: true, resumeJson });
    } catch (err: any) {
      console.error('Error generating structured resume:', err);
      res.status(500).json({
        error: err.message || 'Failed to generate structured resume with Gemini.',
      });
    }
  });

  // 3b. Candidate-Specific Master LaTeX Generation API
  app.post('/api/gemini/generate-candidate-latex', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Missing prompt parameter.' });
        return;
      }

      const latexCode = await generateCandidateTailoredLatexAI(prompt);
      res.json({ success: true, latexCode });
    } catch (err: any) {
      console.error('Error generating candidate LaTeX:', err);
      res.status(500).json({
        error: err.message || 'Failed to generate candidate LaTeX with Gemini.',
      });
    }
  });

  // 4. Audio Transcription API (Microphone Speech-to-Text)
  app.post('/api/gemini/transcribe-audio', async (req, res) => {
    try {
      const { audioBase64, mimeType } = req.body;
      if (!audioBase64) {
        res.status(400).json({ error: 'Missing "audioBase64" parameter.' });
        return;
      }

      const transcript = await transcribeAudio(audioBase64, mimeType || 'audio/webm');
      res.json({ success: true, transcript });
    } catch (err: any) {
      console.error('Error transcribing audio:', err);
      res.status(500).json({
        error: err.message || 'Failed to transcribe audio with Gemini.',
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Resume Generation Pipeline] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
