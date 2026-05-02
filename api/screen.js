export default async function handler(req, res) {
        if (req.method !== 'POST') {
                  return res.status(405).json({ error: 'Method not allowed' });
        }

  const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
                  return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
        }

  const { prompt } = req.body;
        if (!prompt) {
                  return res.status(400).json({ error: 'prompt is required' });
        }

  const model = 'gemini-2.5-flash-lite';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const geminiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.2, maxOutputTokens: 4096 }
            })
  });

  const data = await geminiRes.json();

  if (!geminiRes.ok) {
            return res.status(geminiRes.status).json({ error: JSON.stringify(data) });
  }

  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Strip markdown code fences so frontend JSON.parse works correctly
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

  return res.status(200).json({ result: text });
}
