'use client';

import ChatMessageBubble from '@/components/chat/ChatMessageBubble';
import { TrackedLink } from '@/components/common/TrackedLink';
import SendIcon from '@/components/svgs/SendIcon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { chatSuggestions } from '@/config/ChatPrompt';
import { heroConfig, socialLinks } from '@/config/Hero';
import { usePortfolioChat } from '@/hooks/use-portfolio-chat';
import type { KeyboardEvent } from 'react';

export default function ChatPageClient() {
  const {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    submitMessage,
    messagesEndRef,
  } = usePortfolioChat();

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submitMessage(newMessage);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="grid min-h-[calc(100dvh-10rem)] gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-3">
            <Avatar className="border-primary h-12 w-12 border-2 bg-blue-300 dark:bg-yellow-300">
              <AvatarImage
                src="/assets/samim-pixel-avatar.png"
                alt={heroConfig.name}
              />
              <AvatarFallback>SR</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-semibold">Chat with Samim</h1>
              <p className="text-muted-foreground text-sm">
                Answers from Samim&apos;s work, projects, and background.
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold tracking-wide uppercase">
              About
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Ask about experience, projects, education, skills, or how to get
              in touch. This is the same assistant as the chat bubble on the
              rest of the site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold tracking-wide uppercase">
              Quick prompts
            </h2>
            <div className="flex flex-wrap gap-2">
              {chatSuggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => void submitMessage(suggestion)}
                  disabled={isLoading}
                  className="h-auto justify-start px-3 py-2 text-left text-xs whitespace-normal"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold tracking-wide uppercase">
              Profile
            </h2>
            <div className="text-muted-foreground flex flex-col gap-2 text-sm">
              <TrackedLink href="/" className="hover:text-foreground underline">
                Portfolio
              </TrackedLink>
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground underline"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </section>
        </aside>

        <section className="bg-card flex min-h-[70vh] flex-col overflow-hidden rounded-xl border">
          <header className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-base font-semibold">
                Ask anything about Samim
              </h2>
              <p className="text-muted-foreground text-sm">
                Streaming answers grounded in Samim&apos;s profile.
              </p>
            </div>
            <div className="text-muted-foreground hidden items-center gap-2 text-xs sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Online
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form
            className="border-t p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submitMessage(newMessage);
            }}
          >
            <div className="flex gap-2">
              <textarea
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={1}
                placeholder="Ask about projects, experience, education, or contact details."
                className="border-input bg-background min-h-11 flex-1 resize-none rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
              />
              <Button type="submit" disabled={!newMessage.trim() || isLoading}>
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <SendIcon className="h-4 w-4" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Press Enter to send, Shift+Enter for a new line.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
