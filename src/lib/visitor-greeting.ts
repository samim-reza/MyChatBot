const NAME_KEY = 'samim-visitor-name';
const SESSION_KEY = 'samim-named-greeting-shown';

function cleanName(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 40);
}

function nameFromQuery(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    return cleanName(params.get('name') || params.get('n') || '');
  } catch {
    return '';
  }
}

export function readKnownVisitorName(): string {
  const fromQuery = nameFromQuery();
  if (fromQuery) {
    localStorage.setItem(NAME_KEY, fromQuery);
    return fromQuery;
  }
  return cleanName(localStorage.getItem(NAME_KEY) || '');
}

export function shouldShowNamedGreeting(): boolean {
  if (typeof window === 'undefined') return false;
  if (sessionStorage.getItem(SESSION_KEY) === '1') return false;
  return Boolean(readKnownVisitorName());
}

export function markNamedGreetingShown(): void {
  sessionStorage.setItem(SESSION_KEY, '1');
}

export function englishGreeting(name: string): {
  headline: string;
  body: string;
} {
  const hour = new Date().getHours();
  let time = 'Good evening';
  if (hour < 5 || hour >= 21) time = 'Good night';
  else if (hour < 12) time = 'Good morning';
  else if (hour < 17) time = 'Good afternoon';

  return {
    headline: `Welcome, ${name}`,
    body: `${time}. Nice to see you.`,
  };
}
