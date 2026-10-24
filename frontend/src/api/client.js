const BASE_URL = '/api';

export const apiClient = {
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error(`Health check failed with status ${res.status}`);
    return res.json();
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
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'LLM execution failed');
    }
    return data.data;
  },

  async getPresets() {
    const res = await fetch(`${BASE_URL}/llm/presets`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch presets');
    return data.data;
  },

  async getLogs(limit = 20) {
    const res = await fetch(`${BASE_URL}/logs?limit=${limit}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch audit logs');
    return data.data;
  },

  async getStats() {
    const res = await fetch(`${BASE_URL}/logs/stats`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch statistics');
    return data.data;
  },

  async clearLogs() {
    const res = await fetch(`${BASE_URL}/logs/clear`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to clear logs');
    return data;
  }
};
