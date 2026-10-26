import React from 'react';
import { History, RefreshCw, Trash2, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const HistoryTable = ({ logs, loading, onRefresh, onClear }) => {
  return (
    <div className="history-section">
      <div className="history-header">
        <div className="section-title-wrapper">
          <History size={18} className="text-cyan" />
          <h3 className="section-title">MongoDB Execution Audit Trail</h3>
          <span className="badge-count">{logs.length} logged</span>
        </div>

        <div className="history-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh database logs"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm btn-danger-hover"
            onClick={onClear}
            disabled={loading || logs.length === 0}
            title="Clear presentation log history"
          >
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Category</th>
              <th>Prompt Snippet</th>
              <th>Response Summary</th>
              <th>Model / Latency</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-muted">
                  No execution logs yet. Run a command from the console above to record live audit data.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isBypassed = log.status === 'BYPASSED';
                const isRefused = log.status === 'REFUSED';

                return (
                  <tr key={log._id}>
                    <td>
                      {isBypassed && (
                        <span className="badge-table badge-table-danger">
                          <AlertTriangle size={12} /> Bypassed
                        </span>
                      )}
                      {isRefused && (
                        <span className="badge-table badge-table-safe">
                          <ShieldCheck size={12} /> Refused
                        </span>
                      )}
                      {!isBypassed && !isRefused && (
                        <span className="badge-table badge-table-normal">
                          <CheckCircle2 size={12} /> Safe
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="category-tag">{log.category || 'CUSTOM'}</span>
                    </td>
                    <td className="cell-prompt" title={log.prompt}>
                      {log.prompt.length > 55 ? `${log.prompt.substring(0, 55)}...` : log.prompt}
                    </td>
                    <td className="cell-response" title={log.response}>
                      {log.response
                        ? log.response.length > 60
                          ? `${log.response.substring(0, 60)}...`
                          : log.response
                        : 'No text generated'}
                    </td>
                    <td>
                      <div className="latency-cell">
                        <span className="model-name">{log.modelUsed || 'gemini'}</span>
                        <span className="latency-val">{log.latencyMs ? `${log.latencyMs}ms` : '-'}</span>
                      </div>
                    </td>
                    <td className="cell-time">
                      {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
