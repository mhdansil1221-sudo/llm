import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

export const useAttackLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    wrongCommands: 0,
    refusedCount: 0,
    bypassedCount: 0,
    safeResponses: 0,
    defenseSuccessRate: 100
  });
  const [loading, setLoading] = useState(false);

  const fetchLogsAndStats = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedLogs, fetchedStats] = await Promise.all([
        apiClient.getLogs(20),
        apiClient.getStats()
      ]);
      setLogs(fetchedLogs || []);
      setStats(fetchedStats || {
        totalTests: 0,
        wrongCommands: 0,
        refusedCount: 0,
        bypassedCount: 0,
        safeResponses: 0,
        defenseSuccessRate: 100
      });
    } catch (err) {
      console.warn('Failed to load logs or stats:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAllLogs = async () => {
    try {
      await apiClient.clearLogs();
      await fetchLogsAndStats();
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  useEffect(() => {
    fetchLogsAndStats();
  }, [fetchLogsAndStats]);

  return {
    logs,
    stats,
    loading,
    refresh: fetchLogsAndStats,
    clearAllLogs
  };
};
