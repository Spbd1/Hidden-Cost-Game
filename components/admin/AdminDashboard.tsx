"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type AdminStatsResponse = {
  ok: boolean;
  error?: string;
  totalSubmissions: number;
  completedSubmissions: number;
  highCoverageCount: number;
  lowCoverageCount: number;
  firstSubmissionAt: string | null;
  lastSubmissionAt: string | null;
  averageBurden: number;
  averageCareAvoidance: number;
  averageResponsibilityShift: number;
  averageConstraintRecognitionShift: number;
  averageProtestLegitimacyShift: number;
  averageRuleCorrectionSupportShift: number;
  averageRedistributionSupportShift: number;
  attemptedRevisionCount: number;
  revisionUnlockedCount: number;
  revisionLockedCount: number;
  usedRevisionOpportunityCount: number;
  averageRevisionMagnitude: number;
  immediateRevealCount: number;
  delayedRevealCount: number;
  averageStandByInitialInterpretation: number;
  averageRememberedResponsibilityError: number;
  averageRememberedConstraintError: number;
  rememberedAttributionMatchPercentage: number;
  noCostInfoCount: number;
  partialCostHintCount: number;
  fullCostPreviewCount: number;
  explainToSelfCount: number;
  explainToOtherCount: number;
  replayOfferedCount: number;
  replayCompletedCount: number;
  sameHiddenProfileCount: number;
  switchedHiddenProfileCount: number;
  averageBehaviorChangeCareAvoidance: number;
};

type AdminSubmission = {
  id: string;
  sessionId: string;
  submittedAt: string;
  assignedHiddenProfile: string | null;
  payload: unknown;
};

type AdminSubmissionPageResponse = {
  ok: boolean;
  error?: string;
  items: AdminSubmission[];
  nextCursor?: string;
};

type DownloadKind = "json" | "csv";

const SESSION_TOKEN_KEY = "hidden-cost-game-admin-export-token";
const REMEMBERED_TOKEN_KEY = "hidden-cost-game-admin-export-token-remembered";

const overviewCards = [
  ["Total submissions", "totalSubmissions"],
  ["Completed submissions", "completedSubmissions"],
  ["High coverage count", "highCoverageCount"],
  ["Low coverage count", "lowCoverageCount"],
  ["First submission", "firstSubmissionAt"],
  ["Last submission", "lastSubmissionAt"],
] as const;

const metricCards = [
  ["Average burden", "averageBurden"],
  ["Average care avoidance", "averageCareAvoidance"],
  ["Average responsibility shift", "averageResponsibilityShift"],
  ["Average constraint recognition shift", "averageConstraintRecognitionShift"],
  ["Average protest legitimacy shift", "averageProtestLegitimacyShift"],
  [
    "Average rule correction support shift",
    "averageRuleCorrectionSupportShift",
  ],
  ["Average redistribution support shift", "averageRedistributionSupportShift"],
] as const;

const experimentSections = [
  {
    title: "Revision experiment",
    cards: [
      ["Attempted revision", "attemptedRevisionCount"],
      ["Revision unlocked", "revisionUnlockedCount"],
      ["Revision locked", "revisionLockedCount"],
      ["Used revision opportunity", "usedRevisionOpportunityCount"],
      ["Average revision magnitude", "averageRevisionMagnitude"],
    ],
  },
  {
    title: "Delayed reveal",
    cards: [
      ["Immediate reveal", "immediateRevealCount"],
      ["Delayed reveal", "delayedRevealCount"],
      [
        "Average stand-by-initial rating",
        "averageStandByInitialInterpretation",
      ],
    ],
  },
  {
    title: "Memory distortion",
    cards: [
      [
        "Average remembered responsibility error",
        "averageRememberedResponsibilityError",
      ],
      [
        "Average remembered constraint error",
        "averageRememberedConstraintError",
      ],
      [
        "Remembered attribution matched original",
        "rememberedAttributionMatchPercentage",
        "percentage",
      ],
    ],
  },
  {
    title: "Cost visibility",
    cards: [
      ["No cost info", "noCostInfoCount"],
      ["Partial cost hint", "partialCostHintCount"],
      ["Full cost preview", "fullCostPreviewCount"],
    ],
  },
  {
    title: "Explanation frame",
    cards: [
      ["Explain to self", "explainToSelfCount"],
      ["Explain to other", "explainToOtherCount"],
    ],
  },
  {
    title: "Replay game",
    cards: [
      ["Replay offered", "replayOfferedCount"],
      ["Replay completed", "replayCompletedCount"],
      ["Same hidden profile", "sameHiddenProfileCount"],
      ["Switched hidden profile", "switchedHiddenProfileCount"],
      [
        "Average behavior change care avoidance",
        "averageBehaviorChangeCareAvoidance",
      ],
    ],
  },
] as const satisfies readonly {
  title: string;
  cards: readonly (readonly [
    string,
    keyof AdminStatsResponse,
    "percentage"?,
  ])[];
}[];

export function AdminDashboard() {
  const [token, setToken] = useState("");
  const [rememberToken, setRememberToken] = useState(false);
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const curlBaseUrl = useMemo(
    () =>
      typeof window === "undefined"
        ? "https://your-domain.com"
        : window.location.origin,
    [],
  );
  const jsonCurl = `curl -H "Authorization: Bearer $ADMIN_EXPORT_TOKEN" \\\n  "${curlBaseUrl}/api/admin/submissions?limit=500" \\\n  -o submissions.json`;
  const csvCurl = `curl -H "Authorization: Bearer $ADMIN_EXPORT_TOKEN" \\\n  "${curlBaseUrl}/api/admin/submissions.csv" \\\n  -o submissions.csv`;

  useEffect(() => {
    const sessionToken = window.sessionStorage.getItem(SESSION_TOKEN_KEY);
    const rememberedToken = window.localStorage.getItem(REMEMBERED_TOKEN_KEY);
    const savedToken = sessionToken || rememberedToken || "";

    setToken(savedToken);
    setRememberToken(Boolean(rememberedToken));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedToken = token.trim();

    if (!trimmedToken) {
      setError("Enter the admin export token.");
      return;
    }

    setStatus("Loading dashboard…");
    setError("");
    setStats(null);
    setSubmissions([]);

    try {
      const [nextStats, nextSubmissions] = await Promise.all([
        fetchAdminJson<AdminStatsResponse>("/api/admin/stats", trimmedToken),
        fetchAdminJson<AdminSubmissionPageResponse>(
          "/api/admin/submissions?limit=20",
          trimmedToken,
        ),
      ]);

      window.sessionStorage.setItem(SESSION_TOKEN_KEY, trimmedToken);
      if (rememberToken) {
        window.localStorage.setItem(REMEMBERED_TOKEN_KEY, trimmedToken);
      } else {
        window.localStorage.removeItem(REMEMBERED_TOKEN_KEY);
      }

      setStats(nextStats);
      setSubmissions(nextSubmissions.items ?? []);
      setStatus("Dashboard loaded.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load dashboard.",
      );
      setStatus("");
    }
  }

  async function handleDownload(kind: DownloadKind) {
    const trimmedToken = token.trim();
    const url =
      kind === "json"
        ? "/api/admin/submissions?limit=500"
        : "/api/admin/submissions.csv";
    const fileName = kind === "json" ? "submissions.json" : "submissions.csv";

    setStatus(`Preparing ${kind.toUpperCase()} download…`);
    setError("");

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${trimmedToken}` },
      });

      if (!response.ok) {
        await throwAdminFetchError(response);
      }

      const blob =
        kind === "json"
          ? new Blob([JSON.stringify(await response.json(), null, 2)], {
              type: "application/json",
            })
          : await response.blob();
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = fileName;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(href);
      setStatus(`${kind.toUpperCase()} download ready.`);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : `Unable to download ${kind.toUpperCase()}.`,
      );
      setStatus("");
    }
  }

  async function handleCopy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopyStatus(label);
    window.setTimeout(() => setCopyStatus(null), 1600);
  }

  function handleForgetToken() {
    window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
    window.localStorage.removeItem(REMEMBERED_TOKEN_KEY);
    setToken("");
    setRememberToken(false);
    setStats(null);
    setSubmissions([]);
    setStatus("Token removed from this browser.");
    setError("");
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-8">
        <form
          onSubmit={handleSubmit}
          className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end"
        >
          <div className="space-y-2">
            <label
              htmlFor="admin-token"
              className="text-sm font-semibold text-slate-800"
            >
              Admin export token
            </label>
            <input
              id="admin-token"
              name="admin-token"
              type="password"
              autoComplete="off"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-research-600 focus:ring-2 focus:ring-research-100"
              placeholder="Paste ADMIN_EXPORT_TOKEN"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={rememberToken}
                onChange={(event) => setRememberToken(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-research-600 focus:ring-research-600"
              />
              Remember for this browser using localStorage
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-research-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-research-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-research-600"
            >
              Load dashboard
            </button>
            <button
              type="button"
              onClick={handleForgetToken}
              className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-research-600 hover:text-research-700"
            >
              Forget token
            </button>
          </div>
        </form>
        {error ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}
        {status ? (
          <p className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800">
            {status}
          </p>
        ) : null}
      </section>

      {stats ? (
        <>
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-ink">Overview</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {overviewCards.map(([label, key]) => (
                <StatCard
                  key={key}
                  label={label}
                  value={formatStatValue(stats[key])}
                />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-ink">Average metrics</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metricCards.map(([label, key]) => (
                <StatCard
                  key={key}
                  label={label}
                  value={formatNumber(stats[key])}
                />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-ink">
                Experimental condition analytics
              </h2>
              <p className="text-sm text-slate-600">
                Blank legacy fields are ignored in averages and condition
                counts.
              </p>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {experimentSections.map((section) => (
                <MetricSection
                  key={section.title}
                  title={section.title}
                  cards={section.cards}
                  stats={stats}
                />
              ))}
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-bold text-ink">
                  Recent submissions
                </h2>
                <p className="text-sm text-slate-600">
                  First 20 submissions sorted newest first.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleDownload("json")}
                  className="rounded-full bg-research-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-research-700"
                >
                  Download JSON
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("csv")}
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-research-600 hover:text-research-700"
                >
                  Download CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    {[
                      "submittedAt",
                      "sessionId",
                      "assignedHiddenProfile",
                      "finalFinancialScore",
                      "finalHealthScore",
                      "burden",
                      "careAvoidance",
                      "responsibilityShift",
                      "protestLegitimacyShift",
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="whitespace-nowrap px-3 py-3"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="text-slate-700">
                      <td className="whitespace-nowrap px-3 py-3">
                        {formatDate(submission.submittedAt)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-mono text-xs">
                        {shortenSessionId(submission.sessionId)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {submission.assignedHiddenProfile || "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {formatUnknownNumber(
                          getPath(submission.payload, [
                            "gameSummary",
                            "finalFinancialScore",
                          ]),
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {formatUnknownNumber(
                          getPath(submission.payload, [
                            "gameSummary",
                            "finalHealthScore",
                          ]),
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {formatUnknownNumber(
                          getPath(submission.payload, [
                            "computedMetrics",
                            "burden",
                          ]),
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {formatUnknownNumber(
                          getPath(submission.payload, [
                            "computedMetrics",
                            "careAvoidance",
                          ]),
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {formatUnknownNumber(
                          getPath(submission.payload, [
                            "computedMetrics",
                            "responsibilityShift",
                          ]),
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {formatUnknownNumber(
                          getPath(submission.payload, [
                            "computedMetrics",
                            "protestLegitimacyShift",
                          ]),
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <CurlCard
              title="curl JSON"
              command={jsonCurl}
              copied={copyStatus === "json"}
              onCopy={() => handleCopy("json", jsonCurl)}
            />
            <CurlCard
              title="curl CSV"
              command={csvCurl}
              copied={copyStatus === "csv"}
              onCopy={() => handleCopy("csv", csvCurl)}
            />
          </section>
        </>
      ) : null}
    </div>
  );
}

function MetricSection({
  title,
  cards,
  stats,
}: {
  title: string;
  cards: readonly (readonly [
    string,
    keyof AdminStatsResponse,
    "percentage"?,
  ])[];
  stats: AdminStatsResponse;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <tbody className="divide-y divide-slate-100">
            {cards.map(([label, key, format]) => (
              <tr key={key}>
                <th
                  scope="row"
                  className="py-2 pr-4 text-left font-semibold text-slate-600"
                >
                  {label}
                </th>
                <td className="whitespace-nowrap py-2 text-right font-bold text-ink">
                  {formatExperimentValue(stats[key], format)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 break-words text-2xl font-bold text-ink">{value}</p>
    </article>
  );
}

function CurlCard({
  title,
  command,
  copied,
  onCopy,
}: {
  title: string;
  command: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-research-600 hover:text-research-700"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
        <code>{command}</code>
      </pre>
    </article>
  );
}

async function fetchAdminJson<T extends { ok: boolean; error?: string }>(
  url: string,
  token: string,
): Promise<T> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    await throwAdminFetchError(response);
  }

  const data = (await response.json()) as T;
  if (!data.ok) {
    throw new Error(data.error || "Unable to load admin data.");
  }

  return data;
}

async function throwAdminFetchError(response: Response): Promise<never> {
  if (response.status === 401) {
    throw new Error("Invalid admin token.");
  }

  let message =
    response.status === 500
      ? "Database is unavailable or admin export is not configured."
      : "Unable to load admin data.";
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = (await response.json()) as { error?: string };
    if (data.error) {
      message = data.error;
    }
  }

  throw new Error(message);
}

function formatExperimentValue(
  value: AdminStatsResponse[keyof AdminStatsResponse],
  format?: "percentage",
): string {
  if (typeof value !== "number") {
    return "—";
  }

  return format === "percentage"
    ? `${formatNumber(value)}%`
    : formatNumber(value);
}

function formatStatValue(value: number | string | null): string {
  if (typeof value === "number") {
    return value.toLocaleString();
  }

  return formatDate(value);
}

function formatUnknownNumber(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value)
    ? formatNumber(value)
    : "—";
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(
    value,
  );
}

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function shortenSessionId(sessionId: string): string {
  if (sessionId.length <= 12) {
    return sessionId;
  }

  return `${sessionId.slice(0, 8)}…${sessionId.slice(-4)}`;
}

function getPath(value: unknown, path: string[]): unknown {
  let current = value;

  for (const segment of path) {
    if (!isRecord(current) || !(segment in current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
