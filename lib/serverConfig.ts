export function isServerSubmissionEnabled(): boolean {
  return process.env.ENABLE_SERVER_SUBMISSION === "true";
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getSubmissionRateLimitWindowMs(): number {
  return readPositiveIntegerEnv("SUBMISSION_RATE_LIMIT_WINDOW_MS", 60_000);
}

export function getSubmissionRateLimitMax(): number {
  return readPositiveIntegerEnv("SUBMISSION_RATE_LIMIT_MAX", 20);
}

export function getMaxSubmissionBodyBytes(): number {
  return readPositiveIntegerEnv("MAX_SUBMISSION_BODY_BYTES", 250_000);
}

function readPositiveIntegerEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
