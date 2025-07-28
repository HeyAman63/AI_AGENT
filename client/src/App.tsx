import { useState } from 'react';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL;

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const threadId = 1;

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, thread_id: threadId }),
      });

      const aiResponse = await response.text();
      setMessages((prev) => [...prev, { role: 'ai', content: aiResponse }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', content: 'Sorry, there was an error processing your request.' }]);
    } finally {
      setInput('');
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>AI Chat</h1>
        <button className="new-chat-btn">
          <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>
      </header>

      <main className="chat-container">
        <div className="chat-history">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role}`}>
              <div className="sender-label">{msg.role === 'user' ? 'You' : 'AI'}</div>
              <div className="message-text">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-bubble ai">
              <div className="sender-label">AI</div>
              <div className="message-text">Typing...</div>
            </div>
          )}
        </div>

        <div className="input-container">
          <textarea
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button className="send-btn" onClick={sendMessage} disabled={loading}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
