import { OpenAI } from 'openai';
import { franc } from 'franc';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get path to the documentation file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docPath = path.join(__dirname, '..', 'liga_documentation.md');

// Load documentation at startup
let documentationText = '';
fs.readFile(docPath, 'utf8')
  .then(data => {
    documentationText = data;
    console.log('Documentation loaded');
  })
  .catch(err => {
    console.error('Failed to load documentation:', err);
  });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  // Detect language
  const langCode = franc(message || '');
  const language = langCode === 'und' ? 'unknown' : langCode;

  // Create prompt for OpenAI
  const prompt = `
You are a helpful assistant. The user is asking the following in ${language}:

"${message}"

Refer to this documentation to help answer the question:
${documentationText}

Respond clearly and concisely.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for technical documentation.' },
        { role: 'user', content: prompt }
      ]
    });

    const reply = completion.choices[0].message.content;
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('OpenAI Error:', error);
    return res.status(500).json({ error: 'Failed to get response from OpenAI.' });
  }
}
