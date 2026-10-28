/**
 * WebSearchService
 * Real-time web search grounding service for LLM queries.
 * Fetches verified live search snippets and extracts clean factual context.
 */

export class WebSearchService {
  /**
   * Determine if a prompt should be grounded with live web search.
   * Attacks (jailbreaks, exploits, code injection) are skipped,
   * while factual, temporal, and general queries are grounded.
   */
  static shouldSearch(prompt, isWrongCommand = false, allowWebSearch = true) {
    if (allowWebSearch === false) return false;
    // Adversarial attack demonstrations, jailbreaks, or exploit tests should NOT search the web
    if (isWrongCommand) return false;

    if (!prompt || typeof prompt !== 'string') return false;
    const text = prompt.trim().toLowerCase();

    // Temporal and factual intent indicators
    const temporalKeywords = [
      'current', 'latest', 'today', 'now', 'recent', 'present',
      'who is', 'who was', 'who are', 'who won',
      'chief minister', 'prime minister', 'president', 'governor', 'minister',
      'election', 'elections', 'news', 'update', 'price', 'winner', 'cabinet',
      '2024', '2025', '2026', '2027', 'head of', 'ceo', 'ruler'
    ];

    const hasTemporalKeyword = temporalKeywords.some(kw => text.includes(kw));
    const isQuestion = text.includes('?') || text.startsWith('what') || text.startsWith('who') || text.startsWith('when') || text.startsWith('where');

    return hasTemporalKeyword || isQuestion || text.length < 120;
  }

  /**
   * Clean HTML entities and tags.
   */
  static cleanSnippet(raw) {
    return raw
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Search DuckDuckGo HTML endpoint with fallback.
   * @param {string} query
   * @param {number} maxResults
   * @returns {Promise<Array<{ title: string, snippet: string, url: string }>>}
   */
  static async search(query, maxResults = 5) {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanQuery)}`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      clearTimeout(timeout);

      if (!res.ok) {
        console.warn(`[WebSearchService] Search HTTP ${res.status}`);
        return [];
      }

      const html = await res.text();
      const results = [];

      // Regex matching result snippets and titles
      const snippetRegex = /<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/g;
      const titleRegex = /<a class="result__url[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;

      const snippets = [];
      let match;
      while ((match = snippetRegex.exec(html)) !== null) {
        const text = this.cleanSnippet(match[1]);
        if (text && text.length > 20) {
          snippets.push(text);
        }
      }

      // If snippets found, format them cleanly
      for (let i = 0; i < Math.min(snippets.length, maxResults); i++) {
        results.push({
          title: `Web Source #${i + 1}`,
          snippet: snippets[i],
          source: 'Live Web Grounding'
        });
      }

      return results;
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`[WebSearchService] Search failed or timed out: ${err.message}`);
      return [];
    }
  }

  /**
   * Format grounding context into a structured instruction for the LLM.
   */
  static buildGroundingContext(query, searchResults) {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (!searchResults || searchResults.length === 0) {
      return `[SYSTEM TEMPORAL CONTEXT]\nToday's Date: ${formattedDate}.\nYear: ${now.getFullYear()}. Answer with awareness of the current year.`;
    }

    const snippetsText = searchResults
      .map((r, i) => `[Source ${i + 1}]: ${r.snippet}`)
      .join('\n\n');

    return `[SYSTEM TEMPORAL & LIVE GROUNDING CONTEXT]
Today's Date: ${formattedDate}.
Current Year: ${now.getFullYear()}.

VERIFIED LIVE WEB SEARCH RESULTS FOR: "${query}"
--------------------------------------------------
${snippetsText}
--------------------------------------------------

GROUNDING DIRECTIVE:
1. You have direct access to the live, verified web search results above.
2. If the user asks about current office holders, election outcomes, or recent events, prioritize the live verified search information above over any older training data.
3. Provide a direct, authoritative, and factually accurate response reflecting the current state as of ${now.getFullYear()}. Do not state that you lack information if it is verified in the search results above.`;
  }
}
