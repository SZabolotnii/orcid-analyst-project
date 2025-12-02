// Google Gemini API Integration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent';

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
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
        throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in .env file');
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

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}&alt=sse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to generate response');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const jsonStr = line.slice(6);
                        if (jsonStr.trim() === '[DONE]') continue;
                        
                        const data = JSON.parse(jsonStr);
                        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        
                        if (text) {
                            fullText += text;
                            if (onChunk) {
                                onChunk(text, fullText);
                            }
                        }
                    } catch (e) {
                        // Skip parsing errors for incomplete chunks
                        console.debug('Skipping chunk:', e.message);
                    }
                }
            }
        }

        return fullText;

    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured() {
    return GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here';
}

/**
 * Extract ORCID ID from text
 */
export function extractOrcidId(text) {
    const orcidPattern = /\b\d{4}-\d{4}-\d{4}-\d{3}[0-9X]\b/;
    const match = text.match(orcidPattern);
    return match ? match[0] : null;
}
