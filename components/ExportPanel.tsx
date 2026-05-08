"use client";

import { useEffect, useMemo, useState } from "react";
import { buildResearchExport } from "@/utils/researchMetrics";
import { createInitialSession, safeJsonStringify, STORAGE_KEY } from "@/utils/session";
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
  const exportData = useMemo<ResearchExport | ResearchSession>(() => buildResearchExport(session, session.createdAt) ?? session, [session]);
  const json = useMemo(() => safeJsonStringify(exportData), [exportData]);
  const fileName = "computedMetrics" in exportData ? `${exportData.sessionId}-research-export.json` : `${session.sessionId}.json`;

  useEffect(() => {
    if (providedSession) {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored) {
      setStoredSession(JSON.parse(stored) as ResearchSession);
      return;
    }

    const initialSession = createInitialSession("export");
    window.localStorage.setItem(STORAGE_KEY, safeJsonStringify(initialSession));
    setStoredSession(initialSession);
  }, [providedSession]);

  async function handleCopy() {
    await navigator.clipboard.writeText(json);
    setCopyStatus("Copied");
    window.setTimeout(() => setCopyStatus("Copy JSON"), 1600);
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            This structured export is intended for prototype review and research workflow testing.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleCopy} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-research-600 hover:text-research-700">
            {copyStatus}
          </button>
          <button onClick={handleDownload} className="rounded-full bg-research-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-research-700">
            Download JSON
          </button>
        </div>
      </div>
      <pre className="max-h-[28rem] overflow-auto rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-slate-100"><code>{json}</code></pre>
    </div>
  );
}
