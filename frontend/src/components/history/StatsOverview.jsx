import React from 'react';
import { Activity, ShieldAlert, ShieldCheck, Percent } from 'lucide-react';

export const StatsOverview = ({ stats }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon-wrapper bg-blue-glow">
          <Activity size={18} className="text-blue" />
        </div>
        <div className="stat-info">
          <span className="stat-label">Total Prompts Executed</span>
          <span className="stat-value">{stats?.totalTests ?? 0}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper bg-rose-glow">
          <ShieldAlert size={18} className="text-rose" />
        </div>
        <div className="stat-info">
          <span className="stat-label">Wrong Commands Tested</span>
          <span className="stat-value">{stats?.wrongCommands ?? 0}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper bg-emerald-glow">
          <ShieldCheck size={18} className="text-emerald" />
        </div>
        <div className="stat-info">
          <span className="stat-label">Refused / Intercepted</span>
          <span className="stat-value">{stats?.refusedCount ?? 0}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper bg-amber-glow">
          <Percent size={18} className="text-amber" />
        </div>
        <div className="stat-info">
          <span className="stat-label">Defense Success Rate (DSR)</span>
          <span className="stat-value">{stats?.defenseSuccessRate ?? 100}%</span>
        </div>
      </div>
    </div>
  );
};
