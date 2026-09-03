const AI_BASE = (process.env.REACT_APP_AI_URL || 'http://localhost:5000').replace(/\/$/, '');

async function aiRequest(path, payload) {
  const response = await fetch(`${AI_BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `AI request failed (${response.status})`);
  return data;
}

export const aiService = {
  health: () => fetch(`${AI_BASE}/health`).then((response) => response.json()),
  recommendSlots: (payload) => aiRequest('/recommend-slots', payload),
  predictNoShow: (payload) => aiRequest('/predict-no-show', payload),
  predictWaitTime: (payload) => aiRequest('/predict-wait-time', payload),
};

export default aiService;
