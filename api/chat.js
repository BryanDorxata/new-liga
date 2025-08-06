// File: api/chat.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt in request body.' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OpenRouter API key.' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://new-liga.vercel.app/', 
        'X-Title': 'My Chatbot',
      },
      body: JSON.stringify({
        model: 'openchat/openchat-7b',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error || 'OpenRouter API error.', details: data });
    }

    const message = data.choices?.[0]?.message?.content || 'No response from model.';
    return res.status(200).json({ response: message });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to connect to OpenRouter.', details: error.message });
  }
}
