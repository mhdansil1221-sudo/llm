import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Copy, 
  Check, 
  TerminalSquare 
} from 'lucide-react';

export const ResponseViewer = ({ result, loading }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!result?.response) return;
    navigator.clipboard.writeText(result.response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="response-card response-placeholder">
        <div className="terminal-loader">
          <div className="pulse-circle"></div>
          <p className="loader-text">Querying Gemini LLM and evaluating safety boundaries...</p>
          <span className="loader-sub">Measuring inference latency and safety candidate ratings</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="response-card response-empty">
        <TerminalSquare size={36} className="empty-icon text-muted" />
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
          <span className="metric-chip">
            <Clock size={13} /> {result.latencyMs ? `${result.latencyMs} ms` : 'N/A'}
          </span>
          <span className="metric-chip">
            <Cpu size={13} /> {result.modelUsed || 'gemini-3.5-flash'}
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

      <div className="response-body">
        <div className="response-text-wrapper">
          <pre className="response-text">{result.response}</pre>
        </div>
      </div>

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
