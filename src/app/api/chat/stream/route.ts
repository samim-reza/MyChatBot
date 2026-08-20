import type { ChatTurn } from '@/lib/chat/client';
import { answerChat, groqConfigured, loadKnowledge } from '@/lib/chat/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET() {
  let knowledge = false;
  try {
    knowledge = Object.keys(loadKnowledge()).length > 0;
  } catch {
    knowledge = false;
  }
  return Response.json({
    status: 'ok',
    groq_configured: groqConfigured(),
    knowledge,
  });
}

export async function POST(request: Request) {
  let payload: { question?: string; history?: ChatTurn[] };
  try {
    payload = (await request.json()) as {
      question?: string;
      history?: ChatTurn[];
    };
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const question = String(payload.question || '');
  const history = Array.isArray(payload.history) ? payload.history : [];
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of answerChat(question, history)) {
          controller.enqueue(encoder.encode(sse(event)));
        }
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            sse({
              type: 'error',
              content: error instanceof Error ? error.message : 'Chat error',
            }),
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
