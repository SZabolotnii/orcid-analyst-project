// Netlify Function: Gemini proxy (no streaming)
// Hides API key from client bundle and avoids Netlify secrets scanning

export async function handler(event) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders };
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
      body: JSON.stringify({ error: "Gemini API key is not configured on server" }),
    };
  }

  try {
    const { message, history = [], analysisResult = null, groupResult = null } = JSON.parse(event.body || "{}");

    const SYSTEM_INSTRUCTION = `Ти - AI-аналітик публікаційної активності науковців. Відповідай українською.`;

    // Build contents with history
    const contents = [];
    for (const msg of history) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    // Attach analysis context
    let contextMessage = "";
    if (analysisResult) {
      contextMessage += `\n\nКонтекст (одиночний дослідник): ORCID ${analysisResult.orcid_id}, публікацій ${analysisResult.totalPublications}, роки ${analysisResult.yearRange}.`;
    }
    if (groupResult) {
      contextMessage += `\n\nКонтекст (група): дослідників ${groupResult.totalResearchers}, публікацій ${groupResult.totalPublications}, роки ${groupResult.yearRange}.`;
    }

    contents.push({ role: "user", parts: [{ text: String(message || "").trim() + contextMessage }] });

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

    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!resp.ok) {
      const err = await safeJson(resp);
      return {
        statusCode: resp.status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
        body: JSON.stringify({ error: err?.error?.message || "Gemini request failed" }),
      };
    }

    const data = await resp.json();
    const text = (data.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || "")
      .join("");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
      body: JSON.stringify({ text }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
      body: JSON.stringify({ error: e.message || "Server error" }),
    };
  }
}

async function safeJson(resp) {
  try {
    return await resp.json();
  } catch {
    return null;
  }
}
