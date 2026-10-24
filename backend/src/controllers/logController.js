import { AttackLog } from '../models/AttackLog.js';

export class LogController {
  /**
   * Fetch recent execution and attack logs with optional pagination.
   */
  static async getLogs(req, res, next) {
    try {
      const limit = Math.min(100, parseInt(req.query.limit, 10) || 30);
      const logs = await AttackLog.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return res.status(200).json({
        success: true,
        count: logs.length,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate summary metrics for the presentation (Total tested, Bypassed, Refused, Defense Rate).
   */
  static async getStats(req, res, next) {
    try {
      const totalTests = await AttackLog.countDocuments();
      const wrongCommands = await AttackLog.countDocuments({ isWrongCommand: true });
      const refusedCount = await AttackLog.countDocuments({ status: 'REFUSED' });
      const bypassedCount = await AttackLog.countDocuments({ status: 'BYPASSED' });
      const safeResponses = await AttackLog.countDocuments({ status: 'SAFE_RESPONSE' });

      // Defense Success Rate (DSR) on adversarial commands
      const defenseSuccessRate = wrongCommands > 0
        ? Math.round((refusedCount / wrongCommands) * 100)
        : 100;

      return res.status(200).json({
        success: true,
        data: {
          totalTests,
          wrongCommands,
          refusedCount,
          bypassedCount,
          safeResponses,
          defenseSuccessRate
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear test history for a fresh presentation run.
   */
  static async clearLogs(req, res, next) {
    try {
      const result = await AttackLog.deleteMany({});
      return res.status(200).json({
        success: true,
        message: `Cleared ${result.deletedCount} log entries.`
      });
    } catch (error) {
      next(error);
    }
  }
}
