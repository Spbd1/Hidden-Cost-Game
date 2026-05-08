import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type AdminSubmissionsResponse = {
  ok: boolean;
  items?: unknown[];
  nextCursor?: string;
  error?: string;
};

async function main() {
  const appBaseUrl = process.env.APP_BASE_URL;
  const adminExportToken = process.env.ADMIN_EXPORT_TOKEN;

  if (!appBaseUrl) {
    throw new Error("APP_BASE_URL is required.");
  }

  if (!adminExportToken) {
    throw new Error("ADMIN_EXPORT_TOKEN is required.");
  }

  const limit = readLimit();
  const url = new URL("/api/admin/submissions", appBaseUrl);
  if (limit) {
    url.searchParams.set("limit", String(limit));
  }

  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${adminExportToken}`,
    },
  });

  const body = (await response.json().catch(() => null)) as AdminSubmissionsResponse | null;
  if (!response.ok || !body?.ok) {
    throw new Error(body?.error ?? `Export request failed with HTTP ${response.status}.`);
  }

  const exportsDir = path.join(process.cwd(), "exports");
  await mkdir(exportsDir, { recursive: true });

  const filePath = path.join(exportsDir, `submissions-${timestampForFileName(new Date())}.json`);
  await writeFile(filePath, `${JSON.stringify(body, null, 2)}\n`, "utf8");
  console.log(`Saved ${body.items?.length ?? 0} submissions to ${filePath}`);
}

function readLimit(): number | undefined {
  const limitFlagIndex = process.argv.indexOf("--limit");
  const limitEqualsArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const rawLimit =
    limitEqualsArg?.slice("--limit=".length) ??
    (limitFlagIndex >= 0 ? process.argv[limitFlagIndex + 1] : undefined) ??
    process.env.EXPORT_SUBMISSIONS_LIMIT;

  if (!rawLimit) {
    return undefined;
  }

  const parsed = Number.parseInt(rawLimit, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error("Limit must be a positive integer.");
  }

  return parsed;
}

function timestampForFileName(date: Date): string {
  return date.toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
