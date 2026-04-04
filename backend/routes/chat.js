const express = require('express');
const router = express.Router();

const SYSTEM_PROMPT = `You are the AI trek planning assistant for "Gilgit Adventure Treks", a travel company based in Gilgit-Baltistan, Northern Pakistan.

Your role:
- Help visitors plan treks and trips in Northern Pakistan (Gilgit, Skardu, Fairy Meadows, K2, Naltar, Deosai, Khunjerab Pass, etc.)
- NEVER mention or recommend Hunza — it is not part of our destinations
- Be friendly, warm, and knowledgeable about the region
- Give concise responses (2-4 sentences max)
- Recommend destinations, share travel tips, best times to visit, budget estimates in PKR
- If someone asks something unrelated to travel/Northern Pakistan, politely steer them back to trip planning
- Only greet with "Assalam o Alaikum" on the VERY FIRST message of a conversation. After that, NEVER repeat it — just respond naturally without any greeting
- Always encourage visitors to book through Gilgit Adventure Treks
- Do NOT use markdown formatting like ** or ## — respond in plain text only`;

const chatHistory = new Map();

function getChatId(req) {
  return req.ip || 'default';
}

// Test endpoint
router.get('/test', async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.json({ status: 'FAIL', reason: 'GROQ_API_KEY not set' });
  try {
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'say hi in one sentence' }],
        max_tokens: 50
      })
    });
    const data = await resp.json();
    if (!resp.ok) return res.json({ status: 'FAIL', reason: 'API error', details: data });
    res.json({ status: 'OK', reply: data.choices?.[0]?.message?.content });
  } catch (err) {
    res.json({ status: 'FAIL', reason: err.message });
  }
});

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI service not configured' });
  }

  try {
    const chatId = getChatId(req);
    if (!chatHistory.has(chatId)) {
      chatHistory.set(chatId, []);
    }
    const history = chatHistory.get(chatId);

    history.push({ role: 'user', content: message.trim() });

    // Keep only last 10 exchanges to save tokens
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history
        ],
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content;

    if (!aiText) {
      throw new Error('No response from AI');
    }

    history.push({ role: 'assistant', content: aiText });

    res.json({ reply: aiText });
  } catch (err) {
    console.error('Chat AI error:', err.message);
    res.status(500).json({ error: 'AI unavailable' });
  }
});

// Clean up old chat histories every 30 minutes
setInterval(() => {
  chatHistory.clear();
}, 30 * 60 * 1000);

module.exports = router;
