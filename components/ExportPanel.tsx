"use client";

import { useEffect, useMemo, useState } from "react";
import { buildResearchExport, getResearchExportCompleteness } from "@/utils/researchMetrics";
import { STORAGE_KEY, createInitialSession, getStoredSession, safeJsonStringify, saveStoredSession } from "@/utils/session";
import type { ResearchExport, ResearchSession } from "@/types/research";

type ExportPanelProps = {
  session?: ResearchSession | null;
  title?: string;
};

const emptySession: ResearchSession = {
  sessionId: "pending-local-session",
  createdAt: "pending",
  currentStage: "export",
  background: {},
  responses: {},
};

export function ExportPanel({ session: providedSession, title = "Research JSON export" }: ExportPanelProps) {
  const [storedSession, setStoredSession] = useState<ResearchSession>(emptySession);
  const [copyStatus, setCopyStatus] = useState("Copy JSON");
  const session = providedSession ?? storedSession;
  const completeness = useMemo(() => getResearchExportCompleteness(session), [session]);
  const exportData = useMemo<ResearchExport | ResearchSession>(() => buildResearchExport(session, new Date().toISOString()) ?? session, [session]);
  const json = useMemo(() => safeJsonStringify(exportData), [exportData]);
  const fileName = "computedMetrics" in exportData ? `${exportData.sessionId}-research-export.json` : `${session.sessionId}-partial-session.json`;

  useEffect(() => {
    if (providedSession) {
      return;
    }

    try {
      const exportSession = { ...getStoredSession("export"), currentStage: "export" as const };
      saveStoredSession(exportSession);
      setStoredSession(exportSession);
    } catch {
      const initialSession = createInitialSession("export");
      saveStoredSession(initialSession);
      setStoredSession(initialSession);
    }
  }, [providedSession]);

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

      <pre className="max-h-[28rem] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100 sm:p-5 sm:text-sm"><code>{json}</code></pre>
    </div>
  );
}
