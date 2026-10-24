import React from 'react';
import { Navbar } from './components/layout/Navbar';
import { PresentationBanner } from './components/layout/PresentationBanner';
import { PresetSelector } from './components/presentation/PresetSelector';
import { PromptConsole } from './components/presentation/PromptConsole';
import { ResponseViewer } from './components/presentation/ResponseViewer';
import { StatsOverview } from './components/history/StatsOverview';
import { HistoryTable } from './components/history/HistoryTable';
import { useLLMExecution } from './hooks/useLLMExecution';
import { useAttackLogs } from './hooks/useAttackLogs';

export function App() {
  const { logs, stats, loading: logsLoading, refresh, clearAllLogs } = useAttackLogs();

  const {
    prompt,
    setPrompt,
    isWrongCommand,
    setIsWrongCommand,
    attackLabel,
    loading: execLoading,
    result,
    error,
    selectPreset,
    execute,
    clearPrompt
  } = useLLMExecution(() => {
    // When prompt execution completes, refresh database logs and stats
    refresh();
  });

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <PresentationBanner />

        <StatsOverview stats={stats} />

        <PresetSelector onSelect={selectPreset} activePrompt={prompt} />

        <div className="workspace-grid">
          <PromptConsole
            prompt={prompt}
            setPrompt={setPrompt}
            isWrongCommand={isWrongCommand}
            setIsWrongCommand={setIsWrongCommand}
            attackLabel={attackLabel}
            loading={execLoading}
            execute={execute}
            clearPrompt={clearPrompt}
            error={error}
          />

          <ResponseViewer result={result} loading={execLoading} />
        </div>

        <HistoryTable
          logs={logs}
          loading={logsLoading}
          onRefresh={refresh}
          onClear={clearAllLogs}
        />
      </main>

      <footer className="footer">
        <p>LLM Safety Boundary Research Platform &bull; Phase 1 Demonstration &bull; Powered by Google Gemini &amp; MongoDB</p>
      </footer>
    </div>
  );
}

export default App;
