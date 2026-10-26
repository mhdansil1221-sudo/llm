const BASE_URL = '/api';

async function parseResponse(res) {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Invalid response format from server (HTTP ${res.status})`);
  }

  if (!res.ok) {
    const errorMsg = data?.message || (data ? JSON.stringify(data) : `Server returned status ${res.status}`);
    throw new Error(errorMsg);
  }

  return data;
}

export const apiClient = {
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return parseResponse(res);
  },

  async executePrompt({ prompt, category, attackLabel, isWrongCommand, systemInstruction }) {
    const res = await fetch(`${BASE_URL}/llm/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        category,
        attackLabel,
        isWrongCommand,
        systemInstruction
      })
    });
    const data = await parseResponse(res);
    return data.data;
  },

  async getPresets() {
    const res = await fetch(`${BASE_URL}/llm/presets`);
    const data = await parseResponse(res);
    return data.data;
  },

  async getLogs(limit = 20) {
    const res = await fetch(`${BASE_URL}/logs?limit=${limit}`);
    const data = await parseResponse(res);
    return data.data;
  },

  async getStats() {
    const res = await fetch(`${BASE_URL}/logs/stats`);
    const data = await parseResponse(res);
    return data.data;
  },

  async clearLogs() {
    const res = await fetch(`${BASE_URL}/logs/clear`, { method: 'DELETE' });
    return parseResponse(res);
  }
};
