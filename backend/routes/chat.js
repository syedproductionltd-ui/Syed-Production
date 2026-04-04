const express = require('express');
const router = express.Router();

const SYSTEM_PROMPT = `You are the AI trek planning assistant for "Gilgit Adventure Treks", a travel company based in Gilgit-Baltistan, Northern Pakistan.

Your role:
- Help visitors plan treks and trips in Northern Pakistan (Hunza, Skardu, Fairy Meadows, K2, Naltar, Deosai, Khunjerab Pass, etc.)
- Be friendly, warm, and knowledgeable about the region
- Give concise responses (2-4 sentences max)
- Recommend destinations, share travel tips, best times to visit, budget estimates in PKR
- If someone asks something unrelated to travel/Northern Pakistan, politely steer them back to trip planning
- Use occasional Urdu greetings (Assalam o Alaikum, JazakAllah, etc.) to feel local
- Always encourage visitors to book through Gilgit Adventure Treks
- Do NOT use markdown formatting like ** or ## — respond in plain text only`;

const chatHistory = new Map();

function getChatId(req) {
  return req.ip || 'default';
}

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI service not configured' });
  }

  try {
    const chatId = getChatId(req);
    if (!chatHistory.has(chatId)) {
      chatHistory.set(chatId, []);
    }
    const history = chatHistory.get(chatId);

    history.push({ role: 'user', parts: [{ text: message.trim() }] });

    // Keep only last 10 exchanges to save tokens
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: history
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      throw new Error('No response from AI');
    }

    history.push({ role: 'model', parts: [{ text: aiText }] });

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
