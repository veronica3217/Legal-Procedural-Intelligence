import React from 'react';
import { MessageSquare, Info } from 'lucide-react';
import ChatBox from '../components/chat/ChatBox';
import { useDocument } from '../context/DocumentContext';

export default function LegalQA() {
  const { analysisResult } = useDocument();

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Ask About Your Case</h1>
          <p className="text-sm text-muted mt-1">Ask questions about the analyzed legal document in natural language.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', background: 'var(--color-warning-bg)', border: '1px solid #FDE68A', borderRadius: 'var(--radius)', fontSize: '0.8125rem', color: 'var(--color-warning)' }}>
          <Info size={14} />
          RAG Backend Not Yet Connected
        </div>
      </div>

      {!analysisResult && (
        <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
          <MessageSquare size={15} />
          <span className="text-sm">
            No document analyzed yet. <strong>Mock responses</strong> will be used. Analyze a document first for real QA.
          </span>
        </div>
      )}

      {/* TODO (RAG integration): Pass real documentId from analysisResult */}
      <ChatBox documentId={analysisResult?.documentId || 'mock'} />
    </div>
  );
}
