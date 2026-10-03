import { pingPrisma } from '@/database/index.js';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  uptime: number;
  timestamp: string;
  checks?: Record<string, 'up' | 'down'>;
}

export const healthService = {
  /** Liveness: the process is up. Never touches the database. */
  liveness(): HealthStatus {
    return {
      status: 'ok',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  },

  /** Readiness: the database is reachable. */
  async readiness(): Promise<HealthStatus> {
    const database = (await pingPrisma()) ? 'up' : 'down';
    return {
      ...this.liveness(),
      status: database === 'up' ? 'ok' : 'degraded',
      checks: { database },
    };
  },
};
