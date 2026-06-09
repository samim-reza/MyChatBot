import React, { useEffect, useRef, useState } from 'react';

const initialMessages = [
  {
    role: 'assistant',
    text: "Assalamualaikum, I am Samim's AI assistant. Ask me about his work, projects, research, skills, or contact details.",
  },
];

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messagesRef = useRef(null);

  useEffect(() => {
    const wasOpen = localStorage.getItem('chat_open') === '1';
    if (wasOpen) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem('chat_open', newState ? '1' : '0');
  };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    localStorage.setItem('chat_open', '0');
  };

  const updateLastAssistantMessage = (text) => {
    setMessages((current) => {
      const next = [...current];
      const last = next[next.length - 1];
      if (last && last.role === 'assistant' && last.streaming) {
        next[next.length - 1] = { ...last, text };
      }
      return next;
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const question = input.trim();

    if (!question || isSending) {
      return;
    }

    setInput('');
    setError('');
    setIsSending(true);
    setMessages((current) => [
      ...current,
      { role: 'user', text: question },
      { role: 'assistant', text: '', streaming: true },
    ]);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Chat service is not available right now.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let answer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const event of events) {
          const line = event
            .split('\n')
            .find((item) => item.startsWith('data: '));

          if (!line) continue;

          const payload = JSON.parse(line.slice(6));

          if (payload.type === 'chunk') {
            answer += payload.content;
            updateLastAssistantMessage(answer);
          }

          if (payload.type === 'error') {
            throw new Error(payload.content || 'Chat service returned an error.');
          }
        }
      }

      setMessages((current) => {
        const next = [...current];
        const last = next[next.length - 1];
        if (last && last.role === 'assistant') {
          next[next.length - 1] = {
            role: 'assistant',
            text: answer || 'I could not generate a response. Please try again.',
          };
        }
        return next;
      });
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setMessages((current) => current.filter((message) => !message.streaming));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-widget">
      <button 
        className="chat-toggle"
        aria-label={isOpen ? "Close chat" : "Open chat"}
        title="Chat with me"
        onClick={handleToggle}
        type="button"
      >
        <i className="fas fa-comment-dots"></i>
      </button>
      
      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <div>
              <h3>Samim AI</h3>
              <p>Portfolio assistant</p>
            </div>
            <a className="chat-page-link" href="/chat" aria-label="Open full chat page">
              <i className="fas fa-up-right-from-square"></i>
            </a>
            <button 
              className="chat-close"
              onClick={handleClose}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          <div className="chat-body">
            <div className="chat-messages" ref={messagesRef}>
              {messages.map((message, index) => (
                <div className={`chat-bubble ${message.role}`} key={`${message.role}-${index}`}>
                  <p>{message.text || (message.streaming ? 'Thinking...' : '')}</p>
                </div>
              ))}
              {error && <div className="chat-error">{error}</div>}
            </div>
            <form className="chat-form" onSubmit={sendMessage}>
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about Samim..."
                aria-label="Ask Samim AI"
              />
              <button type="submit" disabled={isSending || !input.trim()} aria-label="Send message">
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;
