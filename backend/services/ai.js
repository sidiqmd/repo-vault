import Anthropic from '@anthropic-ai/sdk';

let client;

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}

export async function generateSummary(owner, name, readme) {
  const ai = getClient();
  if (!ai) return null;

  // Sanitize: only use alphanumeric owner/name, truncate readme
  const safeOwner = String(owner).replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 100);
  const safeName = String(name).replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 100);
  const safeReadme = (readme || '').slice(0, 4000);

  const message = await ai.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Summarize this GitHub repo in 2-3 sentences for a developer. Be specific about what it does and when you'd use it. Repo: ${safeOwner}/${safeName}\n\nREADME:\n${safeReadme}`,
    }],
  });

  return message.content[0]?.text || null;
}

export async function suggestCategory(summary, topics, language) {
  const ai = getClient();
  if (!ai) return null;

  // Sanitize inputs: truncate to prevent prompt injection and token waste
  const safeSummary = String(summary || '').slice(0, 2000);
  const safeTopics = (topics || [])
    .filter(t => typeof t === 'string')
    .slice(0, 20)
    .map(t => t.replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 50))
    .join(', ');
  const safeLang = String(language || '').replace(/[^a-zA-Z0-9 +#_.-]/g, '').slice(0, 50);

  const message = await ai.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 50,
    messages: [{
      role: 'user',
      content: `Given this GitHub repo summary, return ONLY one category from this exact list: ai-ml, dev-tools, cli, libraries, learning, boilerplate, apis, data, uncategorized.\n\nSummary: ${safeSummary}\nTopics: ${safeTopics}\nLanguage: ${safeLang}\n\nCategory:`,
    }],
  });

  const cat = (message.content[0]?.text || '').trim().toLowerCase();
  const valid = ['ai-ml', 'dev-tools', 'cli', 'libraries', 'learning', 'boilerplate', 'apis', 'data'];
  return valid.includes(cat) ? cat : 'uncategorized';
}
