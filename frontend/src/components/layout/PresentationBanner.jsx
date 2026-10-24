import React from 'react';
import { AlertTriangle, Info, Terminal } from 'lucide-react';

export const PresentationBanner = () => {
  return (
    <div className="presentation-banner">
      <div className="banner-badge">
        <Terminal size={16} />
        <span>Phase 1 Live Demonstration</span>
      </div>
      <div className="banner-content">
        <h2 className="banner-heading">Understanding the LLM Vulnerability Problem</h2>
        <p className="banner-description">
          Before applying safety boundaries (Phase 2), this stage demonstrates the foundational issue: 
          how Large Language Models react when subjected to <strong>&ldquo;wrong commands&rdquo;</strong> (adversarial prompts, 
          jailbreak tokens, and roleplay bypasses) compared to normal queries.
        </p>
      </div>
    </div>
  );
};
