'use client';

import ChatBubbleIcon from '@/components/svgs/ChatBubbleIcon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  ExpandableChat,
  ExpandableChatBody,
  ExpandableChatFooter,
  ExpandableChatHeader,
} from '@/components/ui/expandable-chat';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatSuggestions } from '@/config/ChatPrompt';
import { heroConfig } from '@/config/Hero';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';
import { useUmami } from '@/hooks/use-umami';
import { cn } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import SendIcon from '../svgs/SendIcon';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  isStreaming?: boolean;
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hello! I'm Samim's Portfolio Assistant. Ask me about my work, projects, or experience.",
    sender: 'bot',
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  },
];

const createSessionId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const ChatBubble: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(createSessionId());
  const { triggerHaptic, isMobile } = useHapticFeedback();
  const { trackEvent } = useUmami();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]',
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const timestamp = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const submitMessage = async (messageText: string, haptic: 'light' | 'selection') => {
    if (!messageText.trim() || isLoading) return;

    if (isMobile()) {
      triggerHaptic(haptic);
    }

    trackEvent({
      name: 'chat_message_sent',
      data: { message: messageText, sender: 'user' },
    });

    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: timestamp(),
    };

    // Temporary bot message that fills in as the response streams
    const botMessageId = Date.now() + 1;
    const botMessage: Message = {
      id: botMessageId,
      text: '',
      sender: 'bot',
      timestamp: timestamp(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setNewMessage('');
    setIsLoading(true);

    await sendMessage(messageText, botMessageId);
  };

  const handleSendMessage = () => submitMessage(newMessage.trim(), 'light');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) =>
    submitMessage(suggestion, 'selection');

  const sendMessage = async (messageText: string, botMessageId: number) => {
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: messageText,
          session_id: sessionIdRef.current,
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

        // Buffer partial lines: an SSE event can be split across reads
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          let data;
          try {
            data = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (data.type === 'error') {
            throw new Error(data.content);
          }

          if (data.type === 'chunk' && data.content) {
            accumulatedText += data.content;

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? { ...msg, text: accumulatedText, isStreaming: true }
                  : msg,
              ),
            );
          }
        }
      }

      if (!accumulatedText) {
        throw new Error('Empty response');
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? { ...msg, text: accumulatedText, isStreaming: false }
            : msg,
        ),
      );
    } catch (error) {
      console.error('Error sending message:', error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
                isStreaming: false,
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
      setNewMessage('');
    }
  };

  return (
    <ExpandableChat
      className="mt-4 ml-4 max-h-[95vh] max-w-[calc(100vw-2rem)] hover:cursor-pointer sm:max-w-[calc(100vw-4rem)] md:max-w-xl"
      position="bottom-right"
      size="lg"
      icon={<ChatBubbleIcon className="h-6 w-6" />}
    >
      <ExpandableChatHeader>
        <div className="flex items-center space-x-3">
          <Avatar className="border-primary h-8 w-8 border-2 bg-blue-300 dark:bg-yellow-300">
            <AvatarImage src="/assets/samim-pixel-avatar.png" alt="Assistant" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-semibold">
              {heroConfig.name}&apos;s Portfolio Assistant
            </h3>
            <div className="text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                Online
              </div>
            </div>
          </div>
        </div>
      </ExpandableChatHeader>

      <ExpandableChatBody>
        <ScrollArea ref={scrollAreaRef} className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex w-max max-w-xs flex-col gap-2 rounded-lg px-3 py-2 text-sm',
                  message.sender === 'user'
                    ? 'text-secondary bg-muted ml-auto'
                    : 'bg-muted',
                )}
              >
                <div className="flex items-start space-x-2">
                  {message.sender === 'bot' && (
                    <Avatar className="border-primary h-6 w-6 border-2 bg-blue-300 dark:bg-yellow-300">
                      <AvatarImage src="/assets/samim-pixel-avatar.png" alt="Assistant" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="max-w-xs flex-1 md:max-w-sm">
                    <div className="flex items-center gap-2">
                      <div className="prose prose-sm dark:prose-invert max-w-none flex-1">
                        {message.text ? (
                          <ReactMarkdown
                            components={{
                              a: (props) => (
                                <a
                                  {...props}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="break-words text-blue-500 underline hover:text-blue-700"
                                />
                              ),
                              // Custom paragraph component to remove default margins
                              p: (props) => (
                                <p {...props} className="m-0 leading-relaxed" />
                              ),
                              // Custom list components
                              ul: (props) => (
                                <ul {...props} className="m-0 pl-4" />
                              ),
                              ol: (props) => (
                                <ol {...props} className="m-0 pl-4" />
                              ),
                              li: (props) => <li {...props} className="m-0" />,
                              // Custom strong/bold component
                              strong: (props) => (
                                <strong {...props} className="font-semibold" />
                              ),
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        ) : (
                          message.isStreaming && (
                            <span className="text-muted-foreground">
                              Thinking...
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    <p
                      className={cn(
                        'mt-1 text-xs',
                        message.sender === 'user'
                          ? 'text-secondary'
                          : 'text-muted-foreground',
                      )}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Show suggestions only when conversation just started */}
            {messages.length === 1 && !isLoading && (
              <div className="space-y-2">
                <p className="text-muted-foreground px-3 text-xs">
                  Quick questions:
                </p>
                <div className="flex flex-wrap gap-2 px-3">
                  {chatSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="bg-background hover:bg-muted border-muted-foreground/20 h-8 px-3 text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </ExpandableChatBody>

      <ExpandableChatFooter>
        <div className="flex space-x-2">
          <Input
            placeholder="Ask me about my work and experience..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </ExpandableChatFooter>
    </ExpandableChat>
  );
};

export default ChatBubble;
