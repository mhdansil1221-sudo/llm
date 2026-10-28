import { config } from '../config/env.js';

export class GeminiService {
  /**
   * Execute prompt with Groq (ultra-fast, free tier, OpenAI-compatible).
   */
  static async generateWithGroq(prompt, systemInstruction = '', groundingInfo = null) {
    const startTime = Date.now();
    const modelsToTry = [
      config.groqModel || 'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'qwen/qwen3.8-27b'
    ];

    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const messages = [];
        let combinedSystem = systemInstruction || '';
        if (groundingInfo?.context) {
          combinedSystem = combinedSystem
            ? `${groundingInfo.context}\n\n${combinedSystem}`
            : groundingInfo.context;
        }

        if (combinedSystem) {
          messages.push({ role: 'system', content: combinedSystem });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.3
          })
        });

        const data = await response.json();
        const latencyMs = Date.now() - startTime;

        if (!response.ok) {
          throw new Error(data.error?.message || `Groq API error ${response.status}`);
        }

        const choice = data.choices?.[0];
        const rawText = choice?.message?.content || '';
        const finishReason = choice?.finish_reason || 'stop';

        const isSafetyBlocked = finishReason === 'content_filter' || !rawText.trim();
        const finalResponseText = isSafetyBlocked
          ? 'Notice: Response was blocked or restricted by the model safety boundary.'
          : rawText;

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
          modelUsed: `Groq (${model})`,
          latencyMs,
          finishReason,
          response: finalResponseText,
          isSafetyBlocked,
          isRefused,
          safetyRatings: [],
          isGrounded: Boolean(groundingInfo?.isGrounded),
          groundingSources: groundingInfo?.sources || [],
          usageMetadata: data.usage || null
        };
      } catch (err) {
        lastError = err;
        console.warn(`[GroqService] Model ${model} failed: ${err.message}`);
      }
    }

    throw lastError || new Error('All Groq model endpoints failed.');
  }

  /**
   * Send a prompt to Groq or Gemini LLM with safety evaluation, web grounding, and latency tracking.
   * @param {string} prompt - User command or prompt
   * @param {string} [systemInstruction] - Optional system guideline
   * @param {object} [groundingInfo] - Optional live web search grounding context
   * @returns {Promise<object>} Structured response with text, safety ratings, latency, finishReason, grounding
   */
  static async generate(prompt, systemInstruction = '', groundingInfo = null) {
    // 1. If Groq API key is present, prioritize Groq for ultra-fast, free execution
    if (config.groqApiKey) {
      try {
        return await this.generateWithGroq(prompt, systemInstruction, groundingInfo);
      } catch (groqErr) {
        console.warn(`[LLMService] Groq failed, checking Gemini fallback: ${groqErr.message}`);
        if (!config.geminiApiKey) throw groqErr;
      }
    }

    // 2. Fall back to Gemini
    if (!config.geminiApiKey) {
      throw new Error('Neither GROQ_API_KEY nor GEMINI_API_KEY is configured in backend/.env.');
    }

    const modelsToTry = [
      config.geminiPrimaryModel || 'gemini-3-flash-preview',
      'gemini-3.5-flash',
      'gemini-3-flash-preview',
      'gemini-3.8-flash',
      'gemini-flash-latest'
    ];

    let lastError = null;

    for (const model of modelsToTry) {
      const startTime = Date.now();
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`;

        let combinedSystem = systemInstruction || '';
        if (groundingInfo?.context) {
          combinedSystem = combinedSystem
            ? `${groundingInfo.context}\n\n${combinedSystem}`
            : groundingInfo.context;
        }

        const payload = {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        };

        if (combinedSystem) {
          payload.systemInstruction = {
            parts: [{ text: combinedSystem }]
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
          // If unavailable, high demand, or model no longer available, try the next fallback model
          if (response.status === 503 || response.status === 429 || response.status === 404) {
            console.warn(`[GeminiService] Model ${model} returned HTTP ${response.status}. Attempting fallback...`);
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
          isGrounded: Boolean(groundingInfo?.isGrounded),
          groundingSources: groundingInfo?.sources || [],
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
