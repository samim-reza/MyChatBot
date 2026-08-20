'use client';

import { useUmami } from '@/hooks/use-umami';
import {
  type ChatMessage,
  type ChatTurn,
  streamChatResponse,
} from '@/lib/chat/client';
import { useEffect, useRef, useState } from 'react';

const createSessionId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const welcomeMessage: ChatMessage = {
  id: 1,
  text: "Hello! I'm Samim's AI assistant. Ask me about my work, projects, education, or how to get in touch.",
  sender: 'bot',
  timestamp: new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  }),
};

const timestamp = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function usePortfolioChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef(createSessionId());
  const historyRef = useRef<ChatTurn[]>([]);
  const { trackEvent } = useUmami();

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]',
    );
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submitMessage = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || isLoading) return;

    trackEvent({
      name: 'chat_message_sent',
      data: { message: trimmed, sender: 'user' },
    });

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: trimmed,
      sender: 'user',
      timestamp: timestamp(),
    };
    const botMessageId = Date.now() + 1;
    const botMessage: ChatMessage = {
      id: botMessageId,
      text: '',
      sender: 'bot',
      timestamp: timestamp(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const finalText = await streamChatResponse({
        question: trimmed,
        sessionId: sessionIdRef.current,
        history: historyRef.current.slice(-10),
        onChunk: (text) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, text, isStreaming: true }
                : msg,
            ),
          );
        },
      });

      historyRef.current = [
        ...historyRef.current,
        { question: trimmed, answer: finalText },
      ].slice(-12);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? { ...msg, text: finalText, isStreaming: false }
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
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    submitMessage,
    scrollAreaRef,
    messagesEndRef,
  };
}
