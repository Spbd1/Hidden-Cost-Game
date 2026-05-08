import type { Metadata } from "next";
import Link from "next/link";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin dashboard | Hidden Cost Game",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <Link href="/" className="text-sm font-semibold text-research-700 hover:text-research-900">
          ← Back to home
        </Link>
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-research-700">Research admin</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">Admin dashboard</h1>
          <p className="max-w-3xl leading-7 text-slate-600">
            Enter the server-side export token to view submission counts, recent records, and browser downloads. This page does not expose the configured token in source and is not linked from the participant flow.
          </p>
        </div>
      </header>
      <AdminDashboard />
    </main>
  );
}
