// Simple Express server for HuggingFace Spaces
// Serves static Vite build + handles Gemini API proxy

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7860; // HuggingFace default port

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Gemini API proxy endpoint (same logic as Netlify function)
app.post('/api/gemini', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Gemini API key is not configured. Please add GEMINI_API_KEY to Secrets.' 
    });
  }

  try {
    const { message, history = [], analysisResult = null, groupResult = null } = req.body;

    const SYSTEM_INSTRUCTION = `Ти - AI-аналітик публікаційної активності науковців. Відповідай українською.`;

    // Build contents with history
    const contents = [];
    for (const msg of history) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    // Attach analysis context
    let contextMessage = '';
    if (analysisResult) {
      contextMessage += `\n\nКонтекст (одиночний дослідник): ORCID ${analysisResult.orcid_id}, публікацій ${analysisResult.totalPublications}, роки ${analysisResult.yearRange}.`;
    }
    if (groupResult) {
      contextMessage += `\n\nКонтекст (група): дослідників ${groupResult.totalResearchers}, публікацій ${groupResult.totalPublications}, роки ${groupResult.yearRange}.`;
    }

    contents.push({ 
      role: 'user', 
      parts: [{ text: String(message || '').trim() + contextMessage }] 
    });

    const body = {
      contents,
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ 
        error: errorData?.error?.message || 'Gemini API request failed' 
      });
    }

    const data = await response.json();
    const text = (data.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || '')
      .join('');

    res.json({ text });
  } catch (error) {
    console.error('Gemini proxy error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (SPA)
app.use((req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 ORCID Analyst ready for HuggingFace Spaces`);
});
