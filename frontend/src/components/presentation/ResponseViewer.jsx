import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Copy, 
  Check, 
  TerminalSquare,
  Bot,
  Sparkles,
  FileText,
  Code,
  Globe,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
  gfm: true,
  breaks: true
});

export const ResponseViewer = ({ result, loading }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('formatted'); // 'formatted' | 'raw'
  const [showSources, setShowSources] = useState(false);

  const handleCopy = () => {
    if (!result?.response) return;
    navigator.clipboard.writeText(result.response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const responseText = result?.response || '';

  const sanitizedHtml = useMemo(() => {
    if (!responseText) return '';
    try {
      const rawHtml = marked.parse(responseText);
      return DOMPurify.sanitize(rawHtml);
    } catch (e) {
      console.error('Failed to parse markdown:', e);
      return responseText;
    }
  }, [responseText]);

  if (loading) {
    return (
      <div className="response-card response-placeholder">
        <div className="terminal-loader">
          <div className="loader-icon-wrapper">
            <Sparkles size={28} className="text-primary spin-pulse" />
          </div>
          <p className="loader-text">Querying Gemini LLM &amp; Evaluating Safety Boundaries...</p>
          <span className="loader-sub">Measuring inference latency and safety candidate ratings</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="response-card response-empty">
        <TerminalSquare size={40} className="empty-icon text-muted" />
        <h4 className="empty-title">Awaiting Command Execution</h4>
        <p className="empty-desc">
          Select an attack preset above or type a command in the console to observe the live LLM response and safety classification.
        </p>
      </div>
    );
  }

  const isBypassed = result.status === 'BYPASSED';
  const isRefused = result.status === 'REFUSED';

  return (
    <div className={`response-card ${isBypassed ? 'card-border-danger' : isRefused ? 'card-border-safe' : 'card-border-normal'}`}>
      <div className="response-header">
        <div className="response-status-badge-container">
          {isBypassed && (
            <span className="badge-status badge-status-bypassed">
              <AlertTriangle size={16} />
              Vulnerability Demonstrated: Command Bypassed
            </span>
          )}
          {isRefused && (
            <span className="badge-status badge-status-refused">
              <ShieldCheck size={16} />
              Boundary Active: Request Refused / Blocked
            </span>
          )}
          {!isBypassed && !isRefused && (
            <span className="badge-status badge-status-safe">
              <CheckCircle size={16} />
              Normal Safe Response
            </span>
          )}
        </div>

        <div className="response-metrics">
          {result.isGrounded && (
            <span className="metric-chip text-emerald" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <Globe size={13} /> Live Web Grounded
            </span>
          )}
          <span className="metric-chip">
            <Clock size={13} /> {result.latencyMs ? `${result.latencyMs} ms` : 'N/A'}
          </span>
          <span className="metric-chip">
            <Cpu size={13} /> {result.modelUsed || 'gemini-2.5-flash'}
          </span>
          <button
            type="button"
            className="btn-icon"
            onClick={handleCopy}
            title="Copy response text"
          >
            {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="response-subbar">
        <div className="response-answer-title">
          <Bot size={16} className="text-primary answer-icon" />
          <span className="answer-heading">Model Answer</span>
          <span className="answer-badge">Live Evaluation</span>
        </div>

        <div className="view-mode-toggle">
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'formatted' ? 'active' : ''}`}
            onClick={() => setViewMode('formatted')}
            title="Formatted View (Render Markdown & Tables)"
          >
            <FileText size={12} />
            <span>Formatted</span>
          </button>
          <button
            type="button"
            className={`view-mode-btn ${viewMode === 'raw' ? 'active' : ''}`}
            onClick={() => setViewMode('raw')}
            title="Raw Markdown Syntax"
          >
            <Code size={12} />
            <span>Raw</span>
          </button>
        </div>
      </div>

      <div className="response-body">
        {viewMode === 'formatted' ? (
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        ) : (
          <div className="response-text-wrapper">
            <pre className="response-text">{result.response}</pre>
          </div>
        )}
      </div>

      {result.groundingSources && result.groundingSources.length > 0 && (
        <div className="grounding-tray" style={{ margin: '12px 18px 0 18px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setShowSources(!showSources)}
          >
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={13} /> Verified Live Search Sources ({result.groundingSources.length})
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {showSources ? <><ChevronUp size={12} /> Hide</> : <><ChevronDown size={12} /> View Sources</>}
            </span>
          </div>
          {showSources && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {result.groundingSources.map((source, idx) => (
                <div key={idx} style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4', background: 'rgba(0, 0, 0, 0.25)', padding: '8px 10px', borderRadius: '6px', borderLeft: '2px solid #10b981' }}>
                  <strong style={{ color: '#38bdf8' }}>[Source {idx + 1}]:</strong> {source.snippet}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {result.safetyRatings && result.safetyRatings.length > 0 && (
        <div className="safety-ratings-tray">
          <span className="tray-label">Candidate Safety Ratings:</span>
          <div className="ratings-list">
            {result.safetyRatings.map((rating, idx) => (
              <span key={idx} className="safety-tag">
                {rating.category?.replace('HARM_CATEGORY_', '')}: <strong>{rating.probability}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
