type CounterMap = Map<string, number>;

const counters: CounterMap = new Map();
const slowQueries: Array<{ model: string; operation: string; durationMs: number; at: string }> = [];

const increment = (key: string, value = 1) => {
  counters.set(key, (counters.get(key) ?? 0) + value);
};

export const recordRequestMetric = (durationMs: number) => {
  increment("requests.total");
  if (durationMs > 500) {
    increment("requests.slow");
  }
};

export const recordSlowQuery = (model: string, operation: string, durationMs: number) => {
  increment("queries.total");
  increment("queries.slow");
  slowQueries.unshift({
    model,
    operation,
    durationMs,
    at: new Date().toISOString(),
  });

  if (slowQueries.length > 50) {
    slowQueries.length = 50;
  }
};

export const recordQuery = () => {
  increment("queries.total");
};

export const getMetricsSnapshot = () => ({
  counters: Object.fromEntries(counters.entries()),
  recentSlowQueries: [...slowQueries],
  uptimeSeconds: Math.round(process.uptime()),
  timestamp: new Date().toISOString(),
});
