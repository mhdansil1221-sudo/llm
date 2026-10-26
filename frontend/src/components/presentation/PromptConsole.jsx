import React from 'react';
import { Send, Trash2, ShieldAlert, AlertCircle } from 'lucide-react';

export const PromptConsole = ({
  prompt,
  setPrompt,
  isWrongCommand,
  setIsWrongCommand,
  attackLabel,
  loading,
  execute,
  clearPrompt,
  error
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    execute();
  };

  return (
    <div className="console-card">
      <div className="console-header">
        <div className="console-title-area">
          <span className="terminal-dot dot-red"></span>
          <span className="terminal-dot dot-yellow"></span>
          <span className="terminal-dot dot-green"></span>
          <span className="console-title">Prompt & Command Console</span>
        </div>
        <div className="console-meta">
          <span className="meta-tag">{attackLabel || 'Manual Input'}</span>
          <span className="meta-length">{prompt.length} chars</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="console-body">
        <textarea
          className="prompt-textarea"
          rows={5}
          placeholder="Type any command, query, or adversarial test prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />

        {error && (
          <div className="error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="console-controls">
          <label className="toggle-label" title="Toggle to simulate a known adversarial attack or wrong command">
            <input
              type="checkbox"
              className="toggle-checkbox"
              checked={isWrongCommand}
              onChange={(e) => setIsWrongCommand(e.target.checked)}
              disabled={loading}
            />
            <span className="toggle-text">
              <ShieldAlert size={14} className={isWrongCommand ? 'text-rose' : 'text-muted'} />
              Mark as Adversarial &quot;Wrong Command&quot; (Attack Demonstration)
            </span>
          </label>

          <div className="button-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearPrompt}
              disabled={loading || !prompt}
            >
              <Trash2 size={16} />
              Clear
            </button>

            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
              disabled={loading || !prompt.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing LLM...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Execute Command
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
