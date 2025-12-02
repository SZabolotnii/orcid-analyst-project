// Gemini client that prefers serverless proxy and falls back to direct (dev)
const SERVERLESS_URL = '/.netlify/functions/gemini';

const SYSTEM_INSTRUCTION = `Ти - AI-аналітик публікаційної активності науковців. Твоя головна задача - допомагати аналізувати дані з ORCID (Open Researcher and Contributor ID).

Твої можливості:
1. Аналізувати ORCID ID науковців
2. Надавати статистику публікацій (кількість, типи, роки)
3. Пояснювати тренди публікаційної активності
4. Порівнювати показники різних дослідників
5. Давати рекомендації щодо підвищення публікаційної активності

Формат ORCID ID: XXXX-XXXX-XXXX-XXXX (наприклад, 0000-0002-1825-0097)

Коли користувач надає ORCID ID:
1. Підтверди, що отримав валідний ORCID ID
2. Поясни, що зараз виконаєш аналіз публікацій
3. Надай короткий огляд результатів

Завжди відповідай українською мовою, будь професійним та корисним.`;

/**
 * Generate content using Google Gemini API with streaming
 * @param {string} userMessage - User's message
 * @param {function} onChunk - Callback for each chunk of response
 * @param {Array} history - Previous messages for context
 * @param {Object} analysisResult - Current single analysis data
 * @param {Object} groupResult - Current group analysis data
 */
export async function generateWithGemini(userMessage, onChunk, history = [], analysisResult = null, groupResult = null) {
    // Prefer calling serverless function to keep API key server-side
    try {
        const resp = await fetch(SERVERLESS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage, history, analysisResult, groupResult })
        });

        if (resp.ok) {
            const data = await resp.json();
            const text = data.text || '';
            if (onChunk && text) onChunk(text, text);
            return text;
        }
        const errData = await safeJson(resp);
        throw new Error(errData?.error || `Gemini function error: ${resp.status}`);
    } catch (serverErr) {
        // Fallback for local dev without Netlify functions
        console.warn('Falling back to direct Gemini call (dev only):', serverErr?.message);
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            throw new Error('Gemini API не налаштовано. Додайте VITE_GEMINI_API_KEY у .env або запустіть через Netlify Functions.');
        }

        // Build contents array with history
        const contents = [];
        
        // Add system context with analysis data if available
    let contextMessage = '';
    
    if (analysisResult) {
        contextMessage = `\n\n📊 ДОСТУПНІ ДАНІ АНАЛІЗУ (одиночний дослідник):
- ORCID ID: ${analysisResult.orcid_id}
- Загальна кількість публікацій: ${analysisResult.totalPublications}
- Діапазон років: ${analysisResult.yearRange}
- Розподіл по роках: ${JSON.stringify(analysisResult.byYear, null, 2)}
- Розподіл по типам: ${JSON.stringify(analysisResult.byType, null, 2)}
- Список публікацій (топ-10): ${JSON.stringify(analysisResult.publications.slice(0, 10), null, 2)}

Використовуй ці реальні дані для відповіді на запитання користувача.`;
    }
    
    if (groupResult) {
        contextMessage = `\n\n📊 ДОСТУПНІ ДАНІ АНАЛІЗУ (група дослідників):
- Кількість дослідників: ${groupResult.totalResearchers}
- Загальна кількість публікацій: ${groupResult.totalPublications}
- Середня кількість публікацій: ${groupResult.avgPublications.toFixed(2)}
- Діапазон років: ${groupResult.yearRange}
- Розподіл по роках: ${JSON.stringify(groupResult.byYear, null, 2)}
- Розподіл по типам: ${JSON.stringify(groupResult.byType, null, 2)}
- Список публікацій (топ-10): ${JSON.stringify(groupResult.publications.slice(0, 10), null, 2)}

Використовуй ці реальні дані для відповіді на запитання користувача.`;
    }
    
        // Add history
        history.forEach(msg => {
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            });
        });
        
        // Add current message with context
        contents.push({
            role: 'user',
            parts: [{ text: userMessage + contextMessage }]
        });

        const requestBody = {
            contents,
            systemInstruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }]
            },
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        };

        const DIRECT_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        const response = await fetch(`${DIRECT_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            const errorData = await safeJson(response);
            throw new Error(errorData?.error?.message || 'Failed to generate response');
        }
        const data = await response.json();
        const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
        if (onChunk && text) onChunk(text, text);
        return text;
    }
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured() {
    // We rely on serverless function being configured in production.
    // Fallback in dev checks VITE_GEMINI_API_KEY implicitly in generateWithGemini.
    return true;
}

/**
 * Extract ORCID ID from text
 */
export function extractOrcidId(text) {
    const orcidPattern = /\b\d{4}-\d{4}-\d{4}-\d{3}[0-9X]\b/;
    const match = text.match(orcidPattern);
    return match ? match[0] : null;
}

async function safeJson(resp) {
    try { return await resp.json(); } catch { return null; }
}
