import type { ChatTurn } from '@/lib/chat/client';
import { readFileSync } from 'fs';
import { join } from 'path';

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type Knowledge = { [key: string]: Json };
type Doc = { text: string; category: string };
type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const BIRTH_DATE = { year: 2000, month: 11, day: 21 };
const MAX_QUESTION_LENGTH = 2000;
const PRIMARY_MODEL = process.env.GROQ_MODEL_PRIMARY || 'openai/gpt-oss-120b';
const FALLBACK_MODEL = process.env.GROQ_MODEL_FALLBACK || 'openai/gpt-oss-20b';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const QUERY_EXPAND: Record<string, string[]> = {
  job: ['experience', 'work', 'role', 'sloancode', 'brandifies'],
  jobs: ['experience', 'work', 'role'],
  work: ['experience', 'role', 'sloancode'],
  company: ['organization', 'sloancode', 'brandifies'],
  working: ['experience', 'role', 'sloancode'],
  college: ['education', 'university', 'green'],
  university: ['education', 'green'],
  cgpa: ['education', 'gpa'],
  phone: ['contact', 'email'],
  email: ['contact', 'email', 'linkedin'],
  contact: ['email', 'linkedin'],
  hire: ['contact', 'linkedin', 'email', 'availability'],
  freelance: ['availability', 'contact'],
  available: ['availability', 'hire'],
  hometown: ['gopalganj', 'education'],
  gopalganj: ['hometown', 'education'],
  banglabot: ['project', 'voice'],
  hourly: ['project'],
  cowork: ['project'],
  stack: ['skills', 'python', 'fastapi'],
  tech: ['skills', 'technical'],
  technology: ['skills', 'technical'],
  technologies: ['skills', 'technical'],
  skill: ['skills', 'technical'],
  skills: ['skills', 'technical'],
  ai: ['sloancode', 'rag', 'llm', 'machine'],
  voice: ['sloancode', 'twilio', 'realtime'],
  restaurant: ['sloancode', 'receptionist'],
  thesis: ['research', 'publication'],
  paper: ['research', 'publication'],
  icpc: ['competitive', 'programming', 'contest'],
  travel: ['travel', 'bandarban', 'saint'],
  married: ['marital', 'married'],
  brother: ['family', 'romim'],
  cv: ['resume', 'cv'],
  resume: ['resume', 'cv'],
  project: ['project', 'sloancode', 'truedoc'],
  projects: ['project'],
};

let cachedKnowledge: Knowledge | null = null;

export function groqConfigured(): boolean {
  const key = process.env.GROQ_API_KEY || '';
  return key !== '' && key !== 'replace-me';
}

export function loadKnowledge(): Knowledge {
  if (cachedKnowledge) return cachedKnowledge;
  const file = join(process.cwd(), 'src/server/personal.json');
  cachedKnowledge = JSON.parse(readFileSync(file, 'utf8')) as Knowledge;
  return cachedKnowledge;
}

export function dhakaNow(): Date {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
  );
}

export function samimAge(now = dhakaNow()): number {
  let age = now.getFullYear() - BIRTH_DATE.year;
  const hadBirthday =
    now.getMonth() + 1 > BIRTH_DATE.month ||
    (now.getMonth() + 1 === BIRTH_DATE.month &&
      now.getDate() >= BIRTH_DATE.day);
  if (!hadBirthday) age -= 1;
  return age;
}

function asRecord(value: Json | undefined): Record<string, Json> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, Json>)
    : {};
}

function asList(value: Json | undefined): Json[] {
  return Array.isArray(value) ? value : [];
}

function tokenize(text: string): string[] {
  return Array.from(new Set(text.toLowerCase().match(/[a-z0-9]+/g) || []));
}

function expandQuery(question: string): string[] {
  const tokens = tokenize(question);
  const extra = tokens.flatMap((token) => QUERY_EXPAND[token] || []);
  return Array.from(new Set([...tokens, ...extra]));
}

function isAgeQuestion(question: string): boolean {
  return /\b(how old|age|old are you|what'?s your age)\b/i.test(question);
}

function isCurrentRoleQuestion(question: string): boolean {
  return (
    /\bcurrent role\b/i.test(question) ||
    /\bcurrently where are you working\b/i.test(question) ||
    /\bwhere are you working now\b/i.test(question) ||
    /\bwhere do you work\b/i.test(question) ||
    /\bwhat do you do now\b/i.test(question) ||
    /\bwhat is your current (job|role)\b/i.test(question) ||
    /\bwhere are you currently working\b/i.test(question) ||
    /\bcurrent position\b/i.test(question)
  );
}

function isExperienceDurationQuestion(question: string): boolean {
  return (
    /\bhow many years of (working |work )?experience\b/i.test(question) ||
    /\bhow long have you worked\b/i.test(question) ||
    /\bfor how many years\b/i.test(question) ||
    /\bwork experience\b/i.test(question)
  );
}

function currentExperience(knowledge: Knowledge): Record<string, Json> | null {
  for (const item of asList(knowledge.experience)) {
    const row = asRecord(item);
    if (
      String(row.duration || '')
        .toLowerCase()
        .includes('present')
    )
      return row;
  }
  return null;
}

function currentRoleAnswer(): string {
  return 'I work full-time and remote from Dhaka as a Senior AI Software Engineer at SloanCode, and I also work full-time and remote from Dhaka as a Machine Learning Engineer at Brandifies.';
}

function isPhoneQuestion(question: string): boolean {
  return (
    /\b(phone|mobile|whatsapp|cell)\b/i.test(question) &&
    !/\b(phone receptionist|phone agent|phone bot)\b/i.test(question)
  );
}

function isHireQuestion(question: string): boolean {
  return /\b(hire|hiring|open to work|looking for (a )?job|available for (work|hire|freelance)|freelance|job offer|want to (hire|recruit))\b/i.test(
    question,
  );
}

function isHometownQuestion(question: string): boolean {
  return /\b(hometown|where (are|were) you from|where did you grow up|gopalganj)\b/i.test(
    question,
  );
}

function isBirthDateQuestion(question: string): boolean {
  return /\b(birth ?date|date of birth|birthday|born on|when were you born|dob)\b/i.test(
    question,
  );
}

function isSalaryQuestion(question: string): boolean {
  return /\b(salary|ctc|compensation|how much (do you|you) (make|earn)|pay you)\b/i.test(
    question,
  );
}

function isWifeQuestion(question: string): boolean {
  return /\b(wife|spouse|wife'?s name|who (is|are) you married to)\b/i.test(
    question,
  );
}

function contactEmail(knowledge: Knowledge): string {
  return String(
    asRecord(knowledge.basic_identity).email || 'samimreza2111@gmail.com',
  );
}

function parseDurationPart(
  part: string,
  fallbackYear?: number,
): [number | null, number | null] {
  const normalized = part.trim().toLowerCase().replace(/\./g, '');
  const now = dhakaNow();
  if (['present', 'current', 'now'].includes(normalized)) {
    return [now.getFullYear(), now.getMonth() + 1];
  }
  const yearMatch = normalized.match(/\b(20\d{2}|19\d{2})\b/);
  const year = yearMatch ? Number(yearMatch[1]) : (fallbackYear ?? null);
  let month: number | null = null;
  for (const [name, value] of Object.entries(MONTHS)) {
    if (new RegExp(`\\b${name}\\b`).test(normalized)) {
      month = value;
      break;
    }
  }
  if (month === null && year !== null) month = 1;
  return [year, month];
}

function durationToMonths(duration: string): number | null {
  const normalized = duration.replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
  const dash = normalized.indexOf('-');
  if (dash === -1) return null;
  const left = normalized.slice(0, dash).trim();
  const right = normalized.slice(dash + 1).trim();
  const [rightYear] = parseDurationPart(right);
  const [startYear, startMonth] = parseDurationPart(
    left,
    rightYear ?? undefined,
  );
  const [endYear, endMonth] = parseDurationPart(right, startYear ?? undefined);
  if (
    startYear == null ||
    startMonth == null ||
    endYear == null ||
    endMonth == null
  ) {
    return null;
  }
  return Math.max(0, (endYear - startYear) * 12 + (endMonth - startMonth));
}

function formatMonths(months: number): string {
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} year${years === 1 ? '' : 's'}`);
  if (remaining) parts.push(`${remaining} month${remaining === 1 ? '' : 's'}`);
  return parts.join(' ') || 'less than a month';
}

function experienceDurationAnswer(
  question: string,
  history: ChatTurn[],
  knowledge: Knowledge,
): string | null {
  if (!isExperienceDurationQuestion(question)) return null;
  const current = currentExperience(knowledge);
  const last = history[history.length - 1];
  const normalized = question.trim().toLowerCase();
  if (
    current &&
    last &&
    (isCurrentRoleQuestion(last.question) ||
      [
        'for how many years',
        'for how many years?',
        'how long',
        'how long?',
      ].includes(normalized))
  ) {
    const months = durationToMonths(String(current.duration || ''));
    if (months != null) {
      return `I have been working as a ${String(current.role || 'my current role')} at ${String(current.organization || 'my current company')} for about ${formatMonths(months)}.`;
    }
  }

  let earliest: [number, number, number] | null = null;
  for (const item of asList(knowledge.experience)) {
    const duration = String(asRecord(item).duration || '').replace(
      /[–—]/g,
      '-',
    );
    const left = duration.split('-')[0]?.trim() || '';
    const [year, month] = parseDurationPart(left, dhakaNow().getFullYear());
    if (year == null || month == null) continue;
    const stamp = year * 12 + month;
    if (!earliest || stamp < earliest[0]) earliest = [stamp, year, month];
  }
  if (!earliest) return null;
  const now = dhakaNow();
  const span = Math.max(
    0,
    (now.getFullYear() - earliest[1]) * 12 + (now.getMonth() + 1 - earliest[2]),
  );
  const label = new Date(earliest[1], earliest[2] - 1, 1).toLocaleString(
    'en-US',
    {
      month: 'long',
      year: 'numeric',
    },
  );
  return `I have about ${formatMonths(span)} of working experience, counting my roles from ${label} onward.`;
}

function confirmationAnswer(
  question: string,
  history: ChatTurn[],
): string | null {
  const normalized = question.trim().toLowerCase();
  if (
    ![
      'sure?',
      'sure',
      'really?',
      'really',
      'are you sure?',
      'are you sure',
    ].includes(normalized)
  ) {
    return null;
  }
  const last = history[history.length - 1];
  if (!last?.answer) return null;
  if (isAgeQuestion(last.question) || isCurrentRoleQuestion(last.question)) {
    return `Yes. ${last.answer}`;
  }
  return null;
}

export function deterministicAnswer(
  question: string,
  history: ChatTurn[],
  knowledge: Knowledge,
): string | null {
  const email = contactEmail(knowledge);
  if (isBirthDateQuestion(question)) {
    return `I am ${samimAge()} years old.`;
  }
  if (isPhoneQuestion(question)) {
    return `I prefer email: ${email}. I don't share a mobile number here.`;
  }
  if (isSalaryQuestion(question)) {
    return `I don't share salary details. You can email me at ${email} if you want to talk about work in general.`;
  }
  if (isWifeQuestion(question)) {
    return `I'm married. I keep family details private beyond that.`;
  }
  if (isHireQuestion(question)) {
    return `I'm not currently looking for a new job or freelance work. You're welcome to email me at ${email} if you still want to stay in touch.`;
  }
  if (isHometownQuestion(question)) {
    return `I grew up in Gopalganj, Bangladesh, and I live in Dhaka now.`;
  }
  return (
    confirmationAnswer(question, history) ||
    experienceDurationAnswer(question, history, knowledge) ||
    (isAgeQuestion(question) ? `I am ${samimAge()} years old.` : null) ||
    (isCurrentRoleQuestion(question) ? currentRoleAnswer() : null)
  );
}

function sanitizedKnowledge(knowledge: Knowledge): Knowledge {
  const copy = structuredClone(knowledge);
  const identity = asRecord(copy.basic_identity);
  delete identity.birth_date;
  delete identity.phone;
  copy.basic_identity = identity;
  copy.key_facts = asList(copy.key_facts).filter((fact) => {
    const text = String(fact);
    return !/born on|birth date|\+\d{8,}|phone number/i.test(text);
  });
  return copy;
}

function buildDocuments(knowledge: Knowledge): Doc[] {
  const data = sanitizedKnowledge(knowledge);
  const documents: Doc[] = [];
  const identity = asRecord(data.basic_identity);
  if (Object.keys(identity).length) {
    documents.push({
      category: 'basic_identity',
      text: `Samim Reza profile: full name ${identity.full_name || ''}; nicknames ${(asList(identity.nicknames) as string[]).join(', ')}; public title ${identity.public_title || identity.current_role || ''}; hometown ${identity.hometown || ''}; marital status ${identity.marital_status || ''}; lives in ${identity.location || ''}; work mode ${identity.work_mode || 'remote from Dhaka'}; email ${identity.email || ''}; LinkedIn ${identity.linkedin || ''}; GitHub ${identity.github || ''}; website ${identity.website || ''}; CV ${identity.cv || ''}; languages ${(asList(identity.languages_spoken) as string[]).join(', ')}. Not currently looking for a new job or freelance work.`,
    });
  }
  for (const fact of asList(data.key_facts)) {
    documents.push({ category: 'key_facts', text: String(fact) });
  }
  for (const item of asList(data.education)) {
    const row = asRecord(item);
    documents.push({
      category: 'education',
      text: `Education: ${row.degree || ''} at ${row.institution || ''}, ${row.location || ''}, duration ${row.duration || ''}, CGPA/GPA ${row.cgpa || row.gpa || ''}.`,
    });
  }
  for (const item of asList(data.experience)) {
    const row = asRecord(item);
    const responsibilities = (asList(row.responsibilities) as string[]).join(
      '; ',
    );
    const website = row.website ? ` Website: ${row.website}.` : '';
    documents.push({
      category: 'experience',
      text: `Experience: ${row.role || ''} at ${row.organization || ''}, ${row.location || ''}, ${row.employment_type || ''}, duration ${row.duration || ''}. Responsibilities: ${responsibilities}.${website}`,
    });
  }
  for (const item of asList(data.research)) {
    const row = asRecord(item);
    documents.push({
      category: 'research',
      text: `Research and thesis-related work: ${row.title || ''} (${row.status || ''}${row.year ? `, ${row.year}` : ''}). Description: ${row.description || ''}.`,
    });
  }
  for (const item of asList(data.projects)) {
    const row = asRecord(item);
    const links = Object.entries(asRecord(row.links))
      .map(([name, url]) => `${name}: ${url}`)
      .join('; ');
    documents.push({
      category: 'project',
      text: `Project: ${row.name || ''}. Description: ${row.description || ''}. Links: ${links || 'No public links listed'}.`,
    });
  }
  const skills = asRecord(data.technical_skills);
  if (Object.keys(skills).length) {
    const parts = Object.entries(skills).map(
      ([group, values]) =>
        `${group.replace(/_/g, ' ')}: ${(asList(values) as string[]).join(', ')}`,
    );
    documents.push({
      category: 'skills',
      text: `Technical skills. ${parts.join('. ')}.`,
    });
  }
  const achievements = asList(
    asRecord(data.competitive_programming).achievements,
  ) as string[];
  if (achievements.length) {
    documents.push({
      category: 'competitive_programming',
      text: `Competitive programming: ${achievements.join('; ')}.`,
    });
  }
  const awards = asList(data.awards) as string[];
  if (awards.length) {
    documents.push({
      category: 'awards',
      text: `Awards and achievements: ${awards.join('; ')}.`,
    });
  }
  const roles = asList(data.roles) as string[];
  if (roles.length) {
    documents.push({
      category: 'roles',
      text: `Leadership and campus roles: ${roles.join('; ')}.`,
    });
  }
  const travel = asRecord(data.travel);
  if (Object.keys(travel).length) {
    documents.push({
      category: 'travel',
      text: `${travel.passion || 'Samim enjoys traveling'}. Places visited: ${(asList(travel.places_visited) as string[]).join(', ')}.`,
    });
  }
  const availability = asRecord(data.availability);
  if (Object.keys(availability).length) {
    documents.push({
      category: 'availability',
      text: `Hiring availability: open to new jobs ${availability.open_to_work ? 'yes' : 'no'}; open to freelance ${availability.open_to_freelance ? 'yes' : 'no'}. ${availability.note || ''}`,
    });
  }
  const prefs = asRecord(data.preferences);
  if (Object.keys(prefs).length) {
    documents.push({
      category: 'preferences',
      text: `Interests and hobbies: ${(asList(prefs.hobbies) as string[]).join(', ')}. Topics of interest: ${(asList(prefs.topics_of_interest) as string[]).join(', ')}.`,
    });
  }
  for (const sibling of asList(asRecord(data.family).siblings)) {
    const row = asRecord(sibling);
    documents.push({
      category: 'family',
      text: `Family basic fact: ${row.name || ''} is Samim's ${row.relation || 'sibling'}.`,
    });
  }
  for (const item of asList(data.references)) {
    const row = asRecord(item);
    documents.push({
      category: 'references',
      text: `Reference: ${row.name || ''}, ${row.title || ''} at ${row.organization || ''}. Email: ${row.email || ''}.`,
    });
  }
  return documents;
}

function scoreDocument(document: Doc, queryTokens: string[]): number {
  const overlap = tokenize(document.text).filter((token) =>
    queryTokens.includes(token),
  ).length;
  const category = document.category;
  let bonus = 0;
  const has = (...words: string[]) =>
    words.some((word) => queryTokens.includes(word));
  if (
    has('research', 'thesis', 'paper', 'publication', 'published') &&
    category.includes('research')
  )
    bonus += 8;
  if (has('project', 'projects') && category.includes('project')) bonus += 6;
  if (
    has('experience', 'work', 'job', 'role') &&
    category.includes('experience')
  )
    bonus += 6;
  if (
    has('skill', 'skills', 'technical', 'stack') &&
    category.includes('skill')
  )
    bonus += 6;
  if (
    has('education', 'university', 'cgpa', 'gpa') &&
    category.includes('education')
  )
    bonus += 6;
  if (
    has('hire', 'hiring', 'freelance', 'available') &&
    category.includes('availability')
  )
    bonus += 8;
  if (has('email', 'contact', 'linkedin') && category === 'basic_identity')
    bonus += 6;
  if (has('hometown', 'gopalganj') && category === 'basic_identity') bonus += 6;
  if (has('travel', 'bandarban') && category.includes('travel')) bonus += 6;
  return overlap + bonus;
}

function relevantContext(
  question: string,
  history: ChatTurn[],
  knowledge: Knowledge,
): string {
  let effective = question;
  const last = history[history.length - 1];
  const normalized = question.trim().toLowerCase();
  if (
    last &&
    (/^(sure\??|really\??|why\??|how\??|and\??|then\??)$/.test(normalized) ||
      (tokenize(normalized).length <= 4 &&
        /\b(it|that|this|same)\b/.test(normalized)))
  ) {
    effective = `This is a follow-up. Previous user question: ${last.question} Previous assistant answer: ${last.answer} Current follow-up question: ${question}`;
  }
  const queryTokens = expandQuery(effective);
  const documents = buildDocuments(knowledge);
  const ranked = documents
    .map((document, index) => ({
      document,
      index,
      score: scoreDocument(document, queryTokens),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const top = ranked
    .filter((row) => row.score > 0)
    .slice(0, 8)
    .map((row) => row.document.text);
  const sections = [
    top.length
      ? `Most relevant facts for this question:\n- ${top.join('\n- ')}`
      : '',
    `Complete profile:\n${documents.map((document) => document.text).join('\n')}`,
  ].filter(Boolean);
  return sections.join('\n\n');
}

function systemPrompt(context: string): string {
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
- Combine related facts when that helps (for example current roles, overlapping skills, or a project plus its stack).
- If the profile does not contain the answer, say you do not have that information and offer samimreza2111@gmail.com.
- Be warm, specific, and concise. Prefer names, dates, and numbers from the profile over vague claims.
- For "tell me about yourself", give a short bio: current work, location, education highlight, and 1-2 signature projects.
- For project or experience questions, cover the relevant items instead of stopping after one unless the user asked for one.
- Public contact is email and LinkedIn only. Never share a mobile number, date of birth, salary, home address, or wife's name.
- When you mention a website, GitHub, LinkedIn, email, or any other URL, write it as a markdown link like [samimreza.me](https://samimreza.me) or [email](mailto:samimreza2111@gmail.com).
- If asked about hiring or freelance, say you are not looking right now and offer email.
- Resolve follow-ups using conversation history, including words like it, that, this, and the same one.
- Reply in the user's language. If they write in Bengali, answer in Bengali.
- Stay in first person. Do not call yourself an AI unless the user asks whether this chat is automated.
- Family answers stay limited to being married and brother's name. Do not add extra family detail.

${context}`;
}

function buildChatMessages(
  question: string,
  history: ChatTurn[],
  knowledge: Knowledge,
): ChatMessage[] {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: systemPrompt(relevantContext(question, history, knowledge)),
    },
  ];
  for (const turn of history.slice(-10)) {
    if (!turn.question?.trim() || !turn.answer?.trim()) continue;
    messages.push({ role: 'user', content: turn.question.trim() });
    messages.push({ role: 'assistant', content: turn.answer.trim() });
  }
  messages.push({ role: 'user', content: question });
  return messages;
}

function toFirstPerson(text: string): string {
  return text
    .replace(/Samim Reza is/gi, 'I am')
    .replace(/Samim is/gi, 'I am')
    .replace(/Samim Reza's/gi, 'my')
    .replace(/Samim's/gi, 'my')
    .replace(/Samim Reza/gi, 'I')
    .replace(/Samim has/gi, 'I have')
    .replace(/Experience:/gi, 'I have worked as')
    .replace(/Education:/gi, 'I studied')
    .replace(/Project:/gi, 'One of my projects is')
    .replace(/Technical skills\./gi, 'My technical skills include');
}

export function extractiveAnswer(
  question: string,
  history: ChatTurn[],
  knowledge: Knowledge,
): string {
  const direct = deterministicAnswer(question, history, knowledge);
  if (direct) return direct;
  const documents = buildDocuments(knowledge);
  const queryTokens = expandQuery(question);
  const ranked = documents
    .map((document, index) => ({
      document,
      index,
      score: scoreDocument(document, queryTokens),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 4);
  if (!ranked.length) {
    const email = String(
      asRecord(knowledge.basic_identity).email || 'samimreza2111@gmail.com',
    );
    return `I don't have that information right now. You can reach me at ${email} for more details.`;
  }
  return `${toFirstPerson(ranked.map((row) => row.document.text).join(' '))
    .slice(0, 1200)
    .replace(/[ \t\n\r.]+$/, '')}.`;
}

async function* streamGroq(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): AsyncGenerator<string> {
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
      const json = JSON.parse(payload) as {
        choices?: { delta?: { content?: string } }[];
      };
      const content = json.choices?.[0]?.delta?.content;
      if (content) yield content;
    }
  }
}

export async function* answerChat(
  question: string,
  history: ChatTurn[],
): AsyncGenerator<{ type: 'chunk' | 'error'; content: string }> {
  const trimmed = question.trim();
  if (!trimmed) {
    yield { type: 'error', content: 'No question provided' };
    return;
  }
  if (trimmed.length > MAX_QUESTION_LENGTH) {
    yield {
      type: 'error',
      content: `Question too long (max ${MAX_QUESTION_LENGTH} characters)`,
    };
    return;
  }

  const knowledge = loadKnowledge();
  const direct = deterministicAnswer(trimmed, history, knowledge);
  if (direct) {
    yield { type: 'chunk', content: direct };
    return;
  }

  const apiKey = process.env.GROQ_API_KEY || '';
  if (!groqConfigured()) {
    yield {
      type: 'chunk',
      content: extractiveAnswer(trimmed, history, knowledge),
    };
    return;
  }

  const messages = buildChatMessages(trimmed, history, knowledge);
  const models = Array.from(
    new Set([
      PRIMARY_MODEL,
      FALLBACK_MODEL,
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
    ]),
  );
  for (const model of models) {
    try {
      for await (const chunk of streamGroq(apiKey, model, messages)) {
        yield { type: 'chunk', content: chunk };
      }
      return;
    } catch {
      continue;
    }
  }
  yield {
    type: 'chunk',
    content: extractiveAnswer(trimmed, history, knowledge),
  };
}
