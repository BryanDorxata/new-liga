// File: api/chat.js

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405 });
  }

  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing prompt in request body.' }), { status: 400 });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://new-liga.vercel.app', // your domain here
        'X-Title': 'Liga Chatbot'
      },
      body: JSON.stringify({
        model: 'openchat/openchat-7b',
        messages: [
          { role: 'system', content: 'You are a helpful multilingual chatbot about Liga ng mga Barangay.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error, details: data }), {
        status: response.status,
      });
    }

    const reply = data.choices?.[0]?.message?.content || 'No response from model.';
    return new Response(JSON.stringify({ response: reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to connect to OpenRouter.', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
