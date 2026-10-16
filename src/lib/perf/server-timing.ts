/**
 * W3C Server-Timing header recorder, parser & latency budget evaluator
 * (`PORT-PERF-TIMING-004`, `PLAT-PERF-CI-GATE-001`).
 */

export interface ServerTimingMetric {
  name: string;
  durationMs: number;
  description?: string;
}

export interface LatencyBudgetCheckInput {
  endpoint: string;
  p50Ms: number;
  p95Ms: number;
  budgetP50Ms: number;
  budgetP95Ms: number;
  serverTimingHeader?: string | null;
  requiredMetrics?: readonly string[];
}

export interface LatencyBudgetCheckResult {
  endpoint: string;
  passed: boolean;
  violations: string[];
  parsedMetrics: ServerTimingMetric[];
}

export function formatServerTimingHeader(metrics: readonly ServerTimingMetric[]): string {
  return metrics
    .map((m) => {
      const safeName = m.name.replace(/[^a-zA-Z0-9_-]/g, "_");
      const dur = Math.max(0, Number.isFinite(m.durationMs) ? m.durationMs : 0).toFixed(1);
      if (m.description) {
        const safeDesc = m.description.replace(/"/g, "'");
        return `${safeName};dur=${dur};desc="${safeDesc}"`;
      }
      return `${safeName};dur=${dur}`;
    })
    .join(", ");
}

export function parseServerTimingHeader(headerValue: string | null | undefined): ServerTimingMetric[] {
  if (!headerValue || !headerValue.trim()) return [];
  const entries = headerValue
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const metrics: ServerTimingMetric[] = [];
  for (const entry of entries) {
    const segments = entry.split(";").map((s) => s.trim()).filter(Boolean);
    if (segments.length === 0) continue;
    const name = segments[0];
    let durationMs = 0;
    let description: string | undefined;

    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      const eqIdx = seg.indexOf("=");
      if (eqIdx === -1) continue;
      const paramKey = seg.slice(0, eqIdx).trim().toLowerCase();
      const rawVal = seg.slice(eqIdx + 1).trim();
      if (paramKey === "dur") {
        const parsed = Number.parseFloat(rawVal);
        if (Number.isFinite(parsed)) durationMs = parsed;
      } else if (paramKey === "desc") {
        description = rawVal.replace(/^"(.*)"$/, "$1");
      }
    }
    metrics.push({ name, durationMs, ...(description !== undefined ? { description } : {}) });
  }
  return metrics;
}

export function evaluateLatencyBudget(input: LatencyBudgetCheckInput): LatencyBudgetCheckResult {
  const violations: string[] = [];
  const parsedMetrics = parseServerTimingHeader(input.serverTimingHeader);

  if (input.p50Ms > input.budgetP50Ms) {
    violations.push(
      `${input.endpoint} p50 (${input.p50Ms.toFixed(1)}ms) exceeded budget (${input.budgetP50Ms.toFixed(1)}ms)`,
    );
  }
  if (input.p95Ms > input.budgetP95Ms) {
    violations.push(
      `${input.endpoint} p95 (${input.p95Ms.toFixed(1)}ms) exceeded budget (${input.budgetP95Ms.toFixed(1)}ms)`,
    );
  }

  if (input.requiredMetrics && input.requiredMetrics.length > 0) {
    const present = new Set(parsedMetrics.map((m) => m.name));
    for (const reqMetric of input.requiredMetrics) {
      if (!present.has(reqMetric)) {
        violations.push(`${input.endpoint} missing required Server-Timing metric "${reqMetric}"`);
      }
    }
  }

  return {
    endpoint: input.endpoint,
    passed: violations.length === 0,
    violations,
    parsedMetrics,
  };
}

export class ServerTimingRecorder {
  private readonly startedAt = performance.now();
  private readonly metrics: ServerTimingMetric[] = [];

  record(name: string, durationMs: number, description?: string): void {
    this.metrics.push({ name, durationMs, description });
  }

  async time<T>(name: string, fn: () => Promise<T>, description?: string): Promise<T> {
    const t0 = performance.now();
    try {
      return await fn();
    } finally {
      this.record(name, performance.now() - t0, description);
    }
  }

  toHeaderValue(includeTotal = true, totalDescription?: string): string {
    const all = includeTotal
      ? [
          ...this.metrics,
          {
            name: "total",
            durationMs: performance.now() - this.startedAt,
            ...(totalDescription ? { description: totalDescription } : {}),
          },
        ]
      : this.metrics;
    return formatServerTimingHeader(all);
  }
}

export function createServerTimingRecorder(): ServerTimingRecorder {
  return new ServerTimingRecorder();
}

/**
 * Computes a deterministic weak ETag (`W/"<fnv1a-hex>-<len>"`) from any JSON-serializable
 * payload (`PORT-PERF-ETAG-005`). Safe in both Node and Edge runtimes.
 */
export function computeWeakETag(payload: unknown): string {
  const serialized = typeof payload === "string" ? payload : JSON.stringify(payload ?? null);
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < serialized.length; i++) {
    const ch = serialized.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch ^ (i & 0xff);
    h2 = Math.imul(h2, 0x811c9dc5);
  }
  const hex1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (h2 >>> 0).toString(16).padStart(8, "0");
  return `W/"${hex1}${hex2}-${serialized.length.toString(16)}"`;
}

/**
 * Returns true when an incoming `If-None-Match` request header matches `currentETag`
 * under RFC 9110 weak comparison (`PORT-PERF-ETAG-005`).
 */
export function matchesIfNoneMatch(
  ifNoneMatchHeader: string | null | undefined,
  currentETag: string
): boolean {
  if (!ifNoneMatchHeader || !currentETag) return false;
  const trimmed = ifNoneMatchHeader.trim();
  if (trimmed === "*") return true;
  const normalize = (tag: string) => tag.trim().replace(/^W\//i, "");
  const target = normalize(currentETag);
  return trimmed
    .split(",")
    .map((part) => normalize(part))
    .some((candidate) => candidate === target);
}
