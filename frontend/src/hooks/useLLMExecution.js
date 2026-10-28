import { useState } from 'react';
import { apiClient } from '../api/client';

export const useLLMExecution = (onSuccess) => {
  const [prompt, setPrompt] = useState('');
  const [isWrongCommand, setIsWrongCommand] = useState(false);
  const [category, setCategory] = useState('CUSTOM_PROMPT');
  const [attackLabel, setAttackLabel] = useState('Custom Prompt');
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const selectPreset = (preset) => {
    setPrompt(preset.prompt);
    setIsWrongCommand(preset.isWrongCommand);
    setCategory(preset.category);
    setAttackLabel(preset.title);
    setError(null);
  };

  const execute = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.executePrompt({
        prompt,
        category,
        attackLabel,
        isWrongCommand,
        useWebSearch
      });
      setResult(data);
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to execute prompt');
    } finally {
      setLoading(false);
    }
  };

  const clearPrompt = () => {
    setPrompt('');
    setIsWrongCommand(false);
    setCategory('CUSTOM_PROMPT');
    setAttackLabel('Custom Prompt');
    setError(null);
  };

  return {
    prompt,
    setPrompt,
    isWrongCommand,
    setIsWrongCommand,
    useWebSearch,
    setUseWebSearch,
    category,
    attackLabel,
    loading,
    result,
    error,
    selectPreset,
    execute,
    clearPrompt
  };
};
