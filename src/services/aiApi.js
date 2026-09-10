import { API_BASE_URL, authFetch } from './api';

/**
 * Sends a chat message to the DigitalLatino AI assistant.
 * @param {string} message - User query text
 * @param {Array<{role: string, content: string}>} history - Previous conversation turns
 * @param {string} [countryCode='MX'] - Optional ISO country code or country ID
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<string>} The assistant's reply in Markdown
 */
export async function sendAiChatMessage(message, history = [], countryCode = 'MX', signal) {
  const payload = {
    message,
    history: history.filter(h => !h.isError).map(({ role, content }) => ({ role, content })),
    countryCode: countryCode ? String(countryCode) : 'MX'
  };

  const response = await authFetch(`${API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    signal
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.message || errJson.error || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text().catch(() => '');
    }
    throw new Error(errorDetail || `Error HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.reply || 'No se recibió respuesta del asistente.';
}