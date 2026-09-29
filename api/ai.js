// api/ai.js
// A Vercel serverless function. It runs on Google's servers, not the visitor's browser,
// so your GEMINI_API_KEY stays private no matter who visits the site.
//
// SETUP:
// 1. Get a free key at https://ai.google.dev (no credit card needed).
// 2. In your Vercel project: Settings -> Environment Variables -> add
//      GEMINI_API_KEY = <your key>
// 3. Deploy. This file is automatically picked up as the route POST /api/ai
//
// The frontend (index.html) already calls this route — you don't need to change it.

const MODEL = 'gemini-3.5-flash-lite'; // free-tier friendly, fast, good quality

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('\n') || '';
  return text.trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Server is missing GEMINI_API_KEY. Add it in Vercel project settings.' });
  }

  const { type, topic, subject, level, simple, question } = req.body || {};

  try {
    if (type === 'explain') {
      const prompt = simple
        ? `Explain "${topic}" (in ${subject}) even more simply than before, for a ${level} student in India. ` +
          `Use very short sentences and one everyday analogy. Max 120 words. Plain text with line breaks, no markdown headers or asterisks.`
        : `You are a patient tutor. Explain "${topic}" in ${subject} to a ${level} student in India, studying for board/competitive exams. ` +
          `Structure it as: (1) a one-line plain-language definition, (2) why it matters / where it's used, (3) one short worked example. ` +
          `Keep it concise (under 180 words), clear, and pitched exactly at their level. Plain text with line breaks, no markdown headers or asterisks.`;
      const text = await callGemini(prompt);
      return res.status(200).json({ text });
    }

    if (type === 'followup') {
      const prompt = `A ${level} student studying "${topic}" in ${subject} just asked this follow-up question: "${question}". ` +
        `Answer it directly and simply, in under 120 words, plain text with line breaks, no markdown headers or asterisks.`;
      const text = await callGemini(prompt);
      return res.status(200).json({ text });
    }

    if (type === 'practice') {
      const prompt = `Write exactly 3 multiple-choice practice questions on "${topic}" (${subject}) for a ${level} student. ` +
        `Respond with ONLY raw JSON, no markdown fences, no preamble, in this exact shape: ` +
        `[{"q":"question text","options":["a","b","c","d"],"correct":0}, ...] ` +
        `"correct" is the zero-based index of the right option in "options". Each question needs 4 options.`;
      const raw = await callGemini(prompt);
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const questions = JSON.parse(cleaned);
      return res.status(200).json({ questions });
    }

    return res.status(400).json({ error: 'Unknown request type' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}