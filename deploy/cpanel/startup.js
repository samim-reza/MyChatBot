'use strict';

/**
 * Lightweight chat API for cPanel / LiteSpeed Passenger.
 * Full Next.js is too heavy for this shared host; pages stay as static files.
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const fs = require('fs');
const http = require('http');
const path = require('path');

function findAppRoot() {
  const candidates = [
    process.cwd(),
    __dirname,
    path.resolve(__dirname, '..', '..'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'src', 'server', 'personal.json')))
      return dir;
  }
  return process.cwd();
}

const APP_ROOT = findAppRoot();

function loadEnvFile(file) {
  try {
    const text = fs.readFileSync(file, 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (key && process.env[key] == null) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

loadEnvFile(path.join(APP_ROOT, '.env'));
loadEnvFile(path.join(APP_ROOT, '.env.production'));
loadEnvFile(path.join(APP_ROOT, '.env.local'));

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const PRIMARY_MODEL = process.env.GROQ_MODEL_PRIMARY || 'openai/gpt-oss-120b';
const FALLBACK_MODEL = process.env.GROQ_MODEL_FALLBACK || 'openai/gpt-oss-20b';
const BIRTH = { year: 2000, month: 11, day: 21 };

function logError(error) {
  const message = error && error.stack ? error.stack : String(error);
  try {
    fs.appendFileSync(
      path.join(APP_ROOT, 'stderr.log'),
      `${new Date().toISOString()} ${message}\n`,
    );
  } catch {
    console.error(message);
  }
}

function groqConfigured() {
  const key = process.env.GROQ_API_KEY || '';
  return key !== '' && key !== 'replace-me';
}

function loadKnowledge() {
  const file = path.join(APP_ROOT, 'src', 'server', 'personal.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (data.basic_identity && typeof data.basic_identity === 'object') {
    delete data.basic_identity.birth_date;
    delete data.basic_identity.phone;
  }
  if (Array.isArray(data.key_facts)) {
    data.key_facts = data.key_facts.filter(
      (fact) => !/born on|birth date|\+\d{8,}|phone number/i.test(String(fact)),
    );
  }
  return data;
}

function dhakaNow() {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
  );
}

function samimAge() {
  const now = dhakaNow();
  let age = now.getFullYear() - BIRTH.year;
  const hadBirthday =
    now.getMonth() + 1 > BIRTH.month ||
    (now.getMonth() + 1 === BIRTH.month && now.getDate() >= BIRTH.day);
  if (!hadBirthday) age -= 1;
  return age;
}

function systemPrompt(knowledge) {
  const today = dhakaNow().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Dhaka',
  });
  return `You are Samim Reza speaking in first person. You know this profile and you answer as Samim, not as an assistant describing him.

Today's date is ${today}. You are ${samimAge()} years old. Never reveal or hint at an exact birth date.

Rules:
- Use ONLY the profile facts below. Do not invent employers, dates, projects, numbers, or links.
- If the profile does not contain the answer, say you do not have that information and offer samimreza2111@gmail.com.
- Be warm, specific, and concise. Prefer names, dates, and numbers from the profile.
- Public contact is email and LinkedIn only. Never share a mobile number, date of birth, salary, home address, or wife's name.
- When you mention a website, GitHub, LinkedIn, email, or any other URL, write it as a markdown link like [samimreza.me](https://samimreza.me) or [email](mailto:samimreza2111@gmail.com).
- If asked about hiring or freelance, say you are not looking right now and offer email.
- Reply in the user's language. If they write in Bengali, answer in Bengali.
- Stay in first person.
- Family answers stay limited to being married and brother's name.

Profile:
${JSON.stringify(knowledge)}`;
}

function isChatPath(urlPath) {
  const clean = (urlPath || '/').split('?')[0];
  return (
    clean === '/api/chat/stream' ||
    clean === '/api/chat/stream/' ||
    clean.endsWith('/api/chat/stream') ||
    clean.endsWith('/api/chat/stream/')
  );
}

function sse(data) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function send(res, status, body, headers) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...(headers || {}),
  });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

async function streamGroq(apiKey, model, messages, write) {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 800,
      stream: true,
    }),
  });
  if (!response.ok || !response.body) {
    const detail = (await response.text()).slice(0, 240);
    throw new Error(`Groq HTTP ${response.status} ${detail}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let produced = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const payload = trimmed.slice(6).trim();
      if (payload === '[DONE]') continue;
      const json = JSON.parse(payload);
      const content =
        json.choices && json.choices[0] && json.choices[0].delta
          ? json.choices[0].delta.content
          : '';
      if (content) {
        produced = true;
        write(sse({ type: 'chunk', content }));
      }
    }
  }
  if (!produced) throw new Error('Empty Groq stream');
}

function extractive(knowledge) {
  const facts = Array.isArray(knowledge.key_facts)
    ? knowledge.key_facts.slice(0, 3)
    : [];
  if (facts.length) return facts.map(String).join(' ');
  const identity = knowledge.basic_identity || {};
  return `I am ${identity.full_name || 'Samim Reza'}. ${identity.current_role || ''}`.trim();
}

async function handlePost(req, res) {
  let payload;
  try {
    payload = await readJson(req);
  } catch {
    send(res, 400, { error: 'Invalid JSON' });
    return;
  }

  const question = String(payload.question || '').trim();
  const history = Array.isArray(payload.history) ? payload.history : [];
  if (!question) {
    send(res, 400, { error: 'No question provided' });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-store',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const write = (chunk) => res.write(chunk);
  try {
    if (/\b(how old|age|old are you|what'?s your age)\b/i.test(question)) {
      write(sse({ type: 'chunk', content: `I am ${samimAge()} years old.` }));
      res.end();
      return;
    }
    if (
      /\b(birth ?date|date of birth|birthday|born on|when were you born|dob)\b/i.test(
        question,
      )
    ) {
      write(sse({ type: 'chunk', content: `I am ${samimAge()} years old.` }));
      res.end();
      return;
    }
    if (
      /\b(phone|mobile|whatsapp|cell)\b/i.test(question) &&
      !/\b(phone receptionist|phone agent|phone bot)\b/i.test(question)
    ) {
      write(
        sse({
          type: 'chunk',
          content:
            "I prefer email: samimreza2111@gmail.com. I don't share a mobile number here.",
        }),
      );
      res.end();
      return;
    }
    if (
      /\b(salary|ctc|compensation|how much (do you|you) (make|earn))\b/i.test(
        question,
      )
    ) {
      write(
        sse({
          type: 'chunk',
          content:
            "I don't share salary details. You can email me at samimreza2111@gmail.com if you want to talk about work in general.",
        }),
      );
      res.end();
      return;
    }
    if (
      /\b(wife|spouse|wife'?s name|who (is|are) you married to)\b/i.test(
        question,
      )
    ) {
      write(
        sse({
          type: 'chunk',
          content: "I'm married. I keep family details private beyond that.",
        }),
      );
      res.end();
      return;
    }
    if (
      /\b(hire|hiring|open to work|looking for (a )?job|available for (work|hire|freelance)|freelance|job offer)\b/i.test(
        question,
      )
    ) {
      write(
        sse({
          type: 'chunk',
          content:
            "I'm not currently looking for a new job or freelance work. You're welcome to email me at samimreza2111@gmail.com if you still want to stay in touch.",
        }),
      );
      res.end();
      return;
    }
    if (
      /\b(hometown|where (are|were) you from|where did you grow up|gopalganj)\b/i.test(
        question,
      )
    ) {
      write(
        sse({
          type: 'chunk',
          content:
            'I grew up in Gopalganj, Bangladesh, and I live in Dhaka now.',
        }),
      );
      res.end();
      return;
    }

    const knowledge = loadKnowledge();
    const messages = [{ role: 'system', content: systemPrompt(knowledge) }];
    for (const turn of history.slice(-10)) {
      if (!turn.question || !turn.answer) continue;
      messages.push({ role: 'user', content: String(turn.question) });
      messages.push({ role: 'assistant', content: String(turn.answer) });
    }
    messages.push({ role: 'user', content: question });

    if (!groqConfigured()) {
      write(sse({ type: 'chunk', content: extractive(knowledge) }));
      res.end();
      return;
    }

    const apiKey = process.env.GROQ_API_KEY;
    const models = Array.from(
      new Set([
        PRIMARY_MODEL,
        FALLBACK_MODEL,
        'openai/gpt-oss-120b',
        'openai/gpt-oss-20b',
      ]),
    );
    let ok = false;
    for (const model of models) {
      try {
        await streamGroq(apiKey, model, messages, write);
        ok = true;
        break;
      } catch (error) {
        logError(error);
      }
    }
    if (!ok) write(sse({ type: 'chunk', content: extractive(knowledge) }));
  } catch (error) {
    logError(error);
    write(
      sse({
        type: 'error',
        content: error instanceof Error ? error.message : 'Chat error',
      }),
    );
  }
  res.end();
}

function handleGet(res) {
  let knowledge = false;
  try {
    knowledge = Object.keys(loadKnowledge()).length > 0;
  } catch {
    knowledge = false;
  }
  send(res, 200, {
    status: 'ok',
    groq_configured: groqConfigured(),
    knowledge,
  });
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];
  if (isChatPath(urlPath)) {
    if (req.method === 'GET') {
      handleGet(res);
      return;
    }
    if (req.method === 'POST') {
      handlePost(req, res).catch((error) => {
        logError(error);
        if (!res.headersSent) send(res, 500, { error: 'Chat error' });
        else res.end();
      });
      return;
    }
    send(res, 405, { error: 'Method not allowed' });
    return;
  }
  send(res, 404, { error: 'Not found' });
});

if (typeof PhusionPassenger !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
  server.listen('passenger');
} else {
  const rawPort = process.env.PORT || '3000';
  const port = Number(rawPort);
  if (Number.isNaN(port)) {
    server.listen(rawPort);
  } else {
    server.listen(port, '0.0.0.0', () => {
      console.log(`Chat API ready on http://127.0.0.1:${port}`);
    });
  }
}

process.on('uncaughtException', logError);
process.on('unhandledRejection', logError);
