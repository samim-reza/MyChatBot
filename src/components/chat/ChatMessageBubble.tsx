'use client';

import ChatMarkdown from '@/components/chat/ChatMarkdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ChatMessage } from '@/lib/chat/client';
import { cn } from '@/lib/utils';

export default function ChatMessageBubble({
  message,
  showTimestamp = false,
  className,
}: {
  message: ChatMessage;
  showTimestamp?: boolean;
  className?: string;
}) {
  const isUser = message.sender === 'user';

  return (
    <div
      className={cn(
        'flex w-fit max-w-[85%] flex-col rounded-lg px-3 py-2 text-sm',
        isUser
          ? 'bg-primary text-primary-foreground ml-auto'
          : 'bg-muted text-foreground',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        {!isUser && (
          <Avatar className="mt-0.5 h-6 w-6 shrink-0 border">
            <AvatarImage src="/assets/samim-avatar.jpg" alt="Assistant" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        )}
        <div
          className={cn(
            'min-w-0 break-words',
            isUser
              ? 'text-primary-foreground [&_a]:text-inherit'
              : 'prose prose-sm dark:prose-invert',
          )}
        >
          {message.text ? (
            <ChatMarkdown text={message.text} onPrimary={isUser} />
          ) : (
            message.isStreaming && (
              <span className="text-muted-foreground">Thinking...</span>
            )
          )}
          {showTimestamp && (
            <p
              className={cn(
                'mt-1 text-xs',
                isUser ? 'text-primary-foreground/70' : 'text-muted-foreground',
              )}
            >
              {message.timestamp}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
