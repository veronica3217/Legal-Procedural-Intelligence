import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../ui/Button';
import { askLegalQuestion } from '../../services/api';

const QUICK_QUESTIONS = [
  'What court heard this case?',
  'When was the case filed?',
  'Who was the petitioner?',
  'What judgment was passed?',
  'What statutes were mentioned?',
];

function MarkdownText({ text }) {
  const parts = text.split('\n');
  return (
    <div>
      {parts.map((line, i) => {
        const parts2 = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} style={{ marginBottom: i < parts.length - 1 ? '0.375rem' : 0 }}>
            {parts2.map((p, j) => (j % 2 === 1 ? <strong key={j}>{p}</strong> : p))}
          </p>
        );
      })}
    </div>
  );
}

function EvidenceSection({ evidence }) {
  const [open, setOpen] = useState(false);
  if (!evidence || evidence.length === 0) return null;
  return (
    <div style={{ marginTop: '0.625rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '0.75rem', color: 'var(--color-text-muted)',
          display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'inherit',
        }}
      >
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        Evidence from document ({evidence.length})
      </button>
      {open && (
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {evidence.map((ev, i) => (
            <div key={i} style={{
              background: 'var(--color-bg-alt)', borderLeft: '3px solid var(--color-primary)',
              padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem', fontStyle: 'italic',
              color: 'var(--color-text-secondary)',
            }}>
              <span style={{ fontStyle: 'normal', fontFamily: 'monospace' }}>"{ev.text}"</span>
              {ev.score !== undefined && (
                <span style={{ float: 'right', fontStyle: 'normal', fontSize: '0.6875rem', color: 'var(--color-text-light)' }}>
                  {Math.round(ev.score * 100)}% match
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatBox({ documentId }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'Hello! I can answer questions about the analyzed legal document. Ask me anything about the parties, dates, statutes, or procedural events.',
      evidence: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    try {
      const res = await askLegalQuestion(question, documentId);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: res.answer,
        evidence: res.evidence || [],
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Sorry, I encountered an error processing your question. Please try again.',
        evidence: [],
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container" style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', maxWidth: '78%' }}>
              {msg.role === 'ai' && (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--color-primary)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2,
                }}>
                  <Bot size={15} color="#fff" />
                </div>
              )}
              <div>
                <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                  {msg.role === 'user' ? msg.content : <MarkdownText text={msg.content} />}
                </div>
                {msg.role === 'ai' && <EvidenceSection evidence={msg.evidence} />}
              </div>
              {msg.role === 'user' && (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2,
                }}>
                  <User size={15} color="var(--color-text-muted)" />
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--color-primary)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={15} color="#fff" />
            </div>
            <div className="chat-bubble chat-bubble-ai" style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', padding: '0.75rem 1rem' }}>
              <div className="spinner" style={{ width: '0.75rem', height: '0.75rem' }} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Analyzing document...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => !loading && sendMessage(q)}
            disabled={loading}
            style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.625rem',
              fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-text-secondary)',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.color = 'var(--color-primary)'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.color = 'var(--color-text-secondary)'; }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <textarea
          className="form-textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ask a question about this legal document..."
          disabled={loading}
          rows={2}
          style={{ flex: 1, minHeight: 'unset', resize: 'none' }}
        />
        <Button
          variant="primary"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          loading={loading}
          icon={<Send size={16} />}
          aria-label="Send message"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
