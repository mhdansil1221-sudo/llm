import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Shield, Database, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

export const Navbar = () => {
  const [health, setHealth] = useState({
    database: { connected: false },
    activeModel: 'gemini-3.5-flash'
  });

  useEffect(() => {
    apiClient.getHealth()
      .then(data => setHealth(data))
      .catch(() => setHealth({ database: { connected: false }, activeModel: 'gemini-3.5-flash' }));
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon-wrapper">
          <Shield className="brand-icon" size={24} />
        </div>
        <div>
          <h1 className="brand-title">LLM Safety Boundary Analysis</h1>
          <p className="brand-subtitle">Phase 1: Vulnerability Demonstration Platform</p>
        </div>
      </div>

      <div className="navbar-badges">
        <div className="status-chip">
          <Cpu size={14} className="chip-icon text-cyan" />
          <span>Model: <strong>{health.activeModel || 'gemini-3.5-flash'}</strong></span>
        </div>

        <div className="status-chip">
          <Database size={14} className="chip-icon text-purple" />
          <span>MongoDB: </span>
          {health.database?.connected ? (
            <span className="badge-online">
              <CheckCircle2 size={12} /> Connected
            </span>
          ) : (
            <span className="badge-offline">
              <AlertCircle size={12} /> Reconnecting
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
