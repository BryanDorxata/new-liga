// File: api/chat.js
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed.' }),
      { status: 405 }
    );
  }

  const { prompt } = await req.json();
  if (!prompt) {
    return new Response(
      JSON.stringify({ error: 'Missing prompt in request body.' }),
      { status: 400 }
    );
  }

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return new Response(
      JSON.stringify({ error: 'Missing OpenRouter API key.' }),
      { status: 500 }
    );
  }

  try {
    const resp = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
          'HTTP-Referer': 'https://new-liga.vercel.app',
          'X-Title': 'Liga Chatbot',
        },
        body: JSON.stringify({
          model: 'openrouter/auto',
          messages: [
            { role: 'system', content: 'You are a helpful multilingual assistant for Liga ng mga Barangay.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 500, // Reduced to fit free usage
          stream: false,
        }),
      }
    );

    const data = await resp.json();
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: data.error, details: data }), {
        status: resp.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const reply = data.choices?.[0]?.message?.content || 'No response from model.';
    return new Response(JSON.stringify({ response: reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to connect to OpenRouter.', details: err.message }),
      { status: 500 }
    );
  }
}
