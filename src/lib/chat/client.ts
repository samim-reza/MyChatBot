export type ChatSender = 'user' | 'bot';

export interface ChatMessage {
  id: number;
  text: string;
  sender: ChatSender;
  timestamp: string;
  isStreaming?: boolean;
}

export interface ChatTurn {
  question: string;
  answer: string;
}

interface StreamChatOptions {
  question: string;
  sessionId: string;
  history: ChatTurn[];
  onChunk: (text: string) => void;
}

export async function streamChatResponse({
  question,
  sessionId,
  history,
  onChunk,
}: StreamChatOptions): Promise<string> {
  const response = await fetch('/api/chat/stream/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      session_id: sessionId,
      history,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No reader available');
  }

  let accumulatedText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;

      let data: { type?: string; content?: string };
      try {
        data = JSON.parse(line.slice(6));
      } catch {
        continue;
      }

      if (data.type === 'error') {
        throw new Error(data.content || 'Chat error');
      }

      if (data.type === 'chunk' && data.content) {
        accumulatedText += data.content;
        onChunk(accumulatedText);
      }
    }
  }

  if (!accumulatedText) {
    throw new Error('Empty response');
  }

  return accumulatedText;
}
