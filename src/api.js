export const askGroq = async (prompt, apiKey, model = 'llama3-8b-8192') => {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(`Rate limit on ${model}. Switch model or wait.`);
    }
    const err = await res.text();
    throw new Error(`Groq error: ${res.status} — ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
};
