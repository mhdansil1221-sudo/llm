import React from 'react';
import { ATTACK_PRESETS } from '../../constants/presets';
import { Play, Sparkles, AlertOctagon, ShieldAlert, Check } from 'lucide-react';

export const PresetSelector = ({ onSelect, activePrompt }) => {
  return (
    <div className="preset-selector-section">
      <div className="section-header">
        <div className="section-title-wrapper">
          <Sparkles size={18} className="text-amber" />
          <h3 className="section-title">Presentation Attack Presets (1-Click Run)</h3>
        </div>
        <span className="section-hint">Select a preset to load a tested command pattern</span>
      </div>

      <div className="preset-grid">
        {ATTACK_PRESETS.map((preset) => {
          const isSelected = activePrompt === preset.prompt;
          return (
            <button
              key={preset.id}
              type="button"
              className={`preset-card ${isSelected ? 'preset-card-active' : ''} ${
                preset.isWrongCommand ? 'preset-adversarial' : 'preset-safe'
              }`}
              onClick={() => onSelect(preset)}
            >
              <div className="preset-card-top">
                <span className={`preset-badge ${preset.isWrongCommand ? 'badge-danger' : 'badge-safe'}`}>
                  {preset.isWrongCommand ? <AlertOctagon size={12} /> : <ShieldAlert size={12} />}
                  {preset.tag}
                </span>
                {isSelected && <span className="preset-selected-tag"><Check size={12} /> Active</span>}
              </div>

              <h4 className="preset-card-title">{preset.title}</h4>
              <p className="preset-card-desc">{preset.desc}</p>

              <div className="preset-card-footer">
                <span className="preset-action-label">
                  <Play size={12} /> Load into Console
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
