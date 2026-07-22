// Vercel serverless function — runs on the server, never in the browser.
// The API key here is read from process.env.ANTHROPIC_API_KEY (no VITE_ prefix),
// so it is NEVER bundled into client-side JavaScript.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured: ANTHROPIC_API_KEY not set in Vercel environment variables' })
  }

  const { system, messages, max_tokens } = req.body || {}
  if (!messages) {
    return res.status(400).json({ error: 'Missing messages in request body' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: max_tokens || 900,
        system,
        messages,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Claude API error' })
    }
    return res.status(200).json(data)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
