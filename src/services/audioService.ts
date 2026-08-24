export interface AudioRecorderState {
  isRecording: boolean;
  recordingDuration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

/**
 * Audio recorder class for recording microphone audio and transcribing via Gemini
 */
export class VoiceAudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    this.audioChunks = [];
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      this.mediaRecorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250); // collect in 250ms chunks
    } catch (err: any) {
      throw new Error(`Microphone access error: ${err.message || 'Permission denied'}`);
    }
  }

  async stopRecording(): Promise<{ audioBlob: Blob; audioBase64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });

          // Convert to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64data = (reader.result as string).split(',')[1] || '';
            
            // Clean up streams
            if (this.stream) {
              this.stream.getTracks().forEach((track) => track.stop());
              this.stream = null;
            }

            resolve({
              audioBlob,
              audioBase64: base64data,
              mimeType,
            });
          };
          reader.onerror = (e) => reject(e);
        } catch (e) {
          reject(e);
        }
      };

      this.mediaRecorder.stop();
    });
  }
}

/**
 * Transcribes audio via backend Gemini endpoint
 */
export async function transcribeAudioVoice(
  audioBase64: string,
  mimeType: string = 'audio/webm',
  isDemoMode: boolean = false
): Promise<string> {
  if (isDemoMode) {
    // Return realistic voice-transcribed Job Description
    return `We are seeking a Senior Full Stack Engineer proficient in React, TypeScript, and AWS Lambda microservices. The candidate must have experience with PostgreSQL, Docker containerization, and modern CI/CD automation. Strong system design and communication skills are required.`;
  }

  const clientApiKey = localStorage.getItem('gemini_api_key');
  if (clientApiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${clientApiKey}`;
    const body = {
      contents: [{
        parts: [
          { text: 'Transcribe this voice recording with high accuracy. Return only the clean transcript.' },
          { inlineData: { mimeType, data: audioBase64 } }
        ]
      }]
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Transcription failed (${res.status})`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  }

  const res = await fetch('/api/gemini/transcribe-audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Transcription failed (${res.status})`);
  }

  const data = await res.json();
  return data.transcript;
}
