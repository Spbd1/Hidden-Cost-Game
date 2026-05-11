"use client";

import { useEffect, useMemo, useState } from "react";
import { buildResearchExport, getResearchExportCompleteness } from "@/utils/researchMetrics";
import { STORAGE_KEY, createInitialSession, getStoredSession, safeJsonStringify, saveStoredSession } from "@/utils/session";
import type { ResearchExport, ResearchSession, ServerSubmissionStatus } from "@/types/research";

type ExportPanelProps = {
  session?: ResearchSession | null;
  title?: string;
};

type SubmissionResponse = {
  ok: boolean;
  serverSubmissionId?: string;
  submittedAt?: string;
  error?: string;
};

const isServerSubmissionEnabled = process.env.NEXT_PUBLIC_ENABLE_SERVER_SUBMISSION === "true";

const emptySession: ResearchSession = {
  sessionId: "pending-local-session",
  createdAt: "pending",
  currentStage: "export",
  background: {},
  responses: {},
};

export function ExportPanel({ session: providedSession, title = "Research JSON export" }: ExportPanelProps) {
  const [storedSession, setStoredSession] = useState<ResearchSession>(providedSession ?? emptySession);
  const [copyStatus, setCopyStatus] = useState("Copy JSON");
  const session = storedSession;
  const completeness = useMemo(() => getResearchExportCompleteness(session), [session]);
  const exportData = useMemo<ResearchExport | ResearchSession>(() => buildResearchExport(session, new Date().toISOString()) ?? session, [session]);
  const json = useMemo(() => safeJsonStringify(exportData), [exportData]);
  const fileName = "computedMetrics" in exportData ? `${exportData.sessionId}-research-export.json` : `${session.sessionId}-partial-session.json`;

  useEffect(() => {
    if (providedSession) {
      const nextSession = normalizeSubmissionStatus(providedSession);
      saveStoredSession(nextSession);
      setStoredSession(nextSession);
      return;
    }

    try {
      const exportSession = normalizeSubmissionStatus({ ...getStoredSession("export"), currentStage: "export" as const });
      saveStoredSession(exportSession);
      setStoredSession(exportSession);
    } catch {
      const initialSession = normalizeSubmissionStatus(createInitialSession("export"));
      saveStoredSession(initialSession);
      setStoredSession(initialSession);
    }
  }, [providedSession]);

  function persistSubmissionMetadata(updates: Partial<ResearchSession>) {
    const updatedSession = {
      ...session,
      ...updates,
    };

    saveStoredSession(updatedSession);
    setStoredSession(updatedSession);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(json);
    setCopyStatus("Copied");
    window.setTimeout(() => setCopyStatus("Copy JSON"), 1600);
  }

  function handleReset() {
    if (!window.confirm("Reset this study session? This clears local progress and cannot be undone.")) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/";
  }

  function handleDownload() {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleSubmit({ force = false }: { force?: boolean } = {}) {
    if (!isServerSubmissionEnabled || !("computedMetrics" in exportData)) {
      return;
    }

    if (session.serverSubmissionStatus === "submitted" && !force) {
      return;
    }

    if (force && !window.confirm("Submit this anonymous session again? This may create a duplicate server record.")) {
      return;
    }

    const payloadJson = json;
    persistSubmissionMetadata({
      serverSubmissionStatus: "submitting",
      serverSubmissionError: undefined,
    });

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: payloadJson,
      });
      const responseBody = (await response.json().catch(() => null)) as SubmissionResponse | null;

      if (!response.ok || !responseBody?.ok || !responseBody.serverSubmissionId || !responseBody.submittedAt) {
        throw new Error(responseBody?.error ?? "Submission failed. Please try again.");
      }

      persistSubmissionMetadata({
        serverSubmissionStatus: "submitted",
        serverSubmissionId: responseBody.serverSubmissionId,
        serverSubmittedAt: responseBody.submittedAt,
        serverSubmissionError: undefined,
      });
    } catch (error) {
      persistSubmissionMetadata({
        serverSubmissionStatus: "failed",
        serverSubmissionError: error instanceof Error ? error.message : "Submission failed. Please try again.",
      });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Completed sessions export as a structured research JSON object. If a section is unfinished, this panel shows the recoverable local session instead.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button onClick={handleCopy} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-research-600 hover:text-research-700 focus:outline-none focus:ring-4 focus:ring-research-100">
            {copyStatus}
          </button>
          <button onClick={handleDownload} className="rounded-full bg-research-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-research-700 focus:outline-none focus:ring-4 focus:ring-research-100">
            Download JSON
          </button>
          <button onClick={handleReset} className="rounded-full border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-400 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100">
            Reset study session
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border p-4 text-sm leading-6 ${completeness.isComplete ? "border-emerald-100 bg-emerald-50 text-emerald-900" : "border-amber-100 bg-amber-50 text-amber-900"}`}>
        {completeness.isComplete ? "Export is complete and includes the background profile, game rounds, surveys, and computed metrics." : "Export is not complete yet. Continue the study flow to include all game rounds, surveys, and metrics."}
      </div>

      <ReplayPrompt session={session} />

      <SubmissionPanel
        status={session.serverSubmissionStatus ?? (isServerSubmissionEnabled ? "not_submitted" : "not_enabled")}
        serverSubmissionId={session.serverSubmissionId}
        serverSubmittedAt={session.serverSubmittedAt}
        serverSubmissionError={session.serverSubmissionError}
        canSubmit={completeness.isComplete && "computedMetrics" in exportData}
        onSubmit={() => handleSubmit()}
        onSubmitAgain={() => handleSubmit({ force: true })}
      />

      <pre className="max-h-[28rem] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100 sm:p-5 sm:text-sm"><code>{json}</code></pre>
    </div>
  );
}

function ReplayPrompt({ session }: { session: ResearchSession }) {
  const hasCompletedFirstFlow = Boolean(session.game?.completedAt && session.postRevealSurveyCompletedAt);

  if (!hasCompletedFirstFlow) {
    return null;
  }

  if (session.replayGame?.completedAt) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
        <p className="font-semibold">Optional replay completed.</p>
        <p>The JSON export and any later server submission now include replayGame and replay behavior-change metrics.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-research-100 bg-white p-5 text-sm leading-6 text-slate-700 shadow-sm">
      <h3 className="text-xl font-semibold text-ink">Optional second playthrough</h3>
      <p className="mt-2 max-w-3xl">
        You may play one more round sequence before submitting. No additional survey questions will be asked, and replay choices are saved separately from the first game.
      </p>
      {session.serverSubmissionStatus === "submitted" ? (
        <p className="mt-3 rounded-2xl bg-amber-50 p-4 font-medium text-amber-900">
          This browser session has already been submitted once. If you complete the replay and want the server copy to include it, use Submit again after returning here.
        </p>
      ) : (
        <p className="mt-3 rounded-2xl bg-research-50 p-4 font-medium text-research-900">
          If you want to add replay data, please do it before optional server submission. You can also skip this and submit normally.
        </p>
      )}
      <a href="/replay-game" className="mt-4 inline-flex rounded-full bg-research-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-research-700 focus:outline-none focus:ring-4 focus:ring-research-100">
        Play one more round sequence
      </a>
    </div>
  );
}

function normalizeSubmissionStatus(session: ResearchSession): ResearchSession {
  if (!isServerSubmissionEnabled) {
    return {
      ...session,
      serverSubmissionStatus: "not_enabled",
      serverSubmissionError: undefined,
    };
  }

  return {
    ...session,
    serverSubmissionStatus: session.serverSubmissionStatus === "not_enabled" ? "not_submitted" : session.serverSubmissionStatus ?? "not_submitted",
  };
}

function SubmissionPanel({
  status,
  serverSubmissionId,
  serverSubmittedAt,
  serverSubmissionError,
  canSubmit,
  onSubmit,
  onSubmitAgain,
}: {
  status: ServerSubmissionStatus;
  serverSubmissionId?: string;
  serverSubmittedAt?: string;
  serverSubmissionError?: string;
  canSubmit: boolean;
  onSubmit: () => void;
  onSubmitAgain: () => void;
}) {
  if (!isServerSubmissionEnabled) {
    return <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">Server submission is disabled in this build. You can still copy or download the JSON export.</p>;
  }

  return (
    <div className="rounded-3xl border border-research-100 bg-research-50 p-5 text-sm leading-6 text-research-950">
      <h3 className="text-xl font-semibold text-ink">Submit this anonymous session</h3>
      <p className="mt-2 max-w-3xl">
        Your data is currently stored only in this browser. You may optionally submit this completed anonymous session to the research server. Do not submit if you do not want this prototype data stored outside your device.
      </p>

      {status === "submitted" && serverSubmissionId && serverSubmittedAt ? (
        <div className="mt-4 space-y-3">
          <p className="rounded-2xl bg-white p-4 font-medium text-emerald-800">
            This session was submitted on {formatSubmittedAt(serverSubmittedAt)}. Submission ID: {serverSubmissionId}.
          </p>
          <button onClick={onSubmitAgain} className="rounded-full border border-research-300 bg-white px-4 py-2 text-xs font-semibold text-research-700 transition hover:border-research-600 focus:outline-none focus:ring-4 focus:ring-research-100">
            Submit again
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {status === "failed" && serverSubmissionError ? <p className="rounded-2xl bg-rose-50 p-4 font-medium text-rose-800">{serverSubmissionError}</p> : null}
          {!canSubmit ? <p className="rounded-2xl bg-amber-50 p-4 font-medium text-amber-900">Complete the session before submitting to the research server.</p> : null}
          <button
            onClick={onSubmit}
            disabled={!canSubmit || status === "submitting"}
            className="rounded-full bg-research-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-research-700 disabled:cursor-not-allowed disabled:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-research-100"
          >
            {status === "submitting" ? "Submitting..." : "Submit anonymous session"}
          </button>
        </div>
      )}
    </div>
  );
}

function formatSubmittedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}
