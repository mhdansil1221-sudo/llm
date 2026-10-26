import { config } from '../config/env.js';

export class GeminiService {
  /**
   * Send a prompt to Gemini LLM with safety evaluation and latency tracking.
   * @param {string} prompt - User command or prompt
   * @param {string} [systemInstruction] - Optional system guideline
   * @returns {Promise<object>} Structured response with text, safety ratings, latency, finishReason
   */
  static async generate(prompt, systemInstruction = '') {
    if (!config.geminiApiKey) {
      throw new Error('Gemini API key is not configured in environment variables.');
    }

    const modelsToTry = [
      config.geminiPrimaryModel || 'gemini-2.5-flash',
      config.geminiFallbackModel || 'gemini-3.5-flash',
      'gemini-flash-latest'
    ];

    let lastError = null;

    for (const model of modelsToTry) {
      const startTime = Date.now();
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`;

        const payload = {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        };

        if (systemInstruction) {
          payload.systemInstruction = {
            parts: [{ text: systemInstruction }]
          };
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        const latencyMs = Date.now() - startTime;

        if (!response.ok) {
          // If unavailable / high demand, try the next fallback model
          if (response.status === 503 || response.status === 429) {
            console.warn(`[GeminiService] Model ${model} returned ${response.status}. Attempting fallback...`);
            lastError = new Error(data.error?.message || `HTTP ${response.status}`);
            continue;
          }
          throw new Error(data.error?.message || `Gemini API request failed with status ${response.status}`);
        }

        const candidate = data.candidates?.[0];
        const finishReason = candidate?.finishReason || 'STOP';
        const rawText = candidate?.content?.parts?.map(p => p.text).join('') || '';
        const safetyRatings = candidate?.safetyRatings || [];

        // Check if the response was flagged or blocked by safety filter
        const isSafetyBlocked = finishReason === 'SAFETY' || !rawText.trim();
        const finalResponseText = isSafetyBlocked
          ? 'Notice: Response was blocked or restricted by the model safety boundary.'
          : rawText;

        // Detect if response contains refusal or constraint-enforcement language
        const refusalKeywords = [
          'i cannot',
          'i am unable to',
          'i will not',
          'i am not able to',
          'cannot confirm',
          'cannot execute without constraints',
          'cannot assist',
          'cannot fulfill',
          'cannot generate',
          'cannot provide',
          'maintain my core safety',
          'safety guidelines',
          'operational boundaries',
          'against my policy',
          'violates safety',
          'against safety guidelines',
          'cannot bypass',
          'as an ai, i must refuse'
        ];
        const lowerResponse = finalResponseText.toLowerCase();
        const isRefused = refusalKeywords.some(kw => lowerResponse.includes(kw)) || isSafetyBlocked;

        return {
          success: true,
          modelUsed: model,
          latencyMs,
          finishReason,
          response: finalResponseText,
          isSafetyBlocked,
          isRefused,
          safetyRatings: safetyRatings.map(r => ({
            category: r.category || 'UNKNOWN',
            probability: r.probability || 'NEGLIGIBLE',
            severity: r.severity || 'LOW'
          })),
          usageMetadata: data.usageMetadata || null
        };
      } catch (err) {
        lastError = err;
        console.warn(`[GeminiService] Error with model ${model}: ${err.message}`);
      }
    }

    throw lastError || new Error('All Gemini model endpoints failed to respond.');
  }
}
