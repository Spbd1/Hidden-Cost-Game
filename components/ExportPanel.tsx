"use client";

import { useEffect, useMemo, useState } from "react";
import { createInitialSession, safeJsonStringify, STORAGE_KEY } from "@/utils/session";
import type { ResearchSession } from "@/types/research";

const emptySession: ResearchSession = {
  sessionId: "pending-local-session",
  createdAt: "pending",
  currentStage: "export",
  background: {},
  responses: {},
};

export function ExportPanel() {
  const [session, setSession] = useState<ResearchSession>(emptySession);
  const [copyStatus, setCopyStatus] = useState("Copy JSON");
  const json = useMemo(() => safeJsonStringify(session), [session]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored) {
      setSession(JSON.parse(stored) as ResearchSession);
      return;
    }

    const initialSession = createInitialSession("export");
    window.localStorage.setItem(STORAGE_KEY, safeJsonStringify(initialSession));
    setSession(initialSession);
  }, []);

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
    link.download = `${session.sessionId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-ink">JSON export</h2>
        <div className="flex gap-3">
          <button onClick={handleCopy} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-research-600 hover:text-research-700">
            {copyStatus}
          </button>
          <button onClick={handleDownload} className="rounded-full bg-research-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-research-700">
            Download
          </button>
        </div>
      </div>
      <pre className="max-h-[28rem] overflow-auto rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-slate-100"><code>{json}</code></pre>
    </div>
  );
}
