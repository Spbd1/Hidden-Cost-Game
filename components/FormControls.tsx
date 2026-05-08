import type { ReactNode } from "react";

const ratingValues = [1, 2, 3, 4, 5, 6, 7];

export function HelperNote({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warning" | "neutral" }) {
  const tones = {
    info: "border-research-100 bg-research-50 text-research-900",
    warning: "border-amber-100 bg-amber-50 text-amber-900",
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return <div className={`rounded-2xl border p-4 text-sm leading-6 md:p-5 ${tones[tone]}`}>{children}</div>;
}

export function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="inline-flex w-full items-center justify-center rounded-full bg-research-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-research-700 focus:outline-none focus:ring-4 focus:ring-research-100 sm:w-auto"
    >
      {children}
    </button>
  );
}

export function SingleChoiceQuestion({ legend, name, options, value, onChange }: { legend: string; name: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-base font-semibold text-ink">{legend}</legend>
      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option) => (
          <label key={option} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm leading-5 text-slate-700 transition hover:border-research-200 hover:bg-slate-50 has-[:checked]:border-research-500 has-[:checked]:bg-research-50 has-[:checked]:text-research-900">
            <input type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(option)} className="h-4 w-4 shrink-0 accent-research-600" />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function LikertQuestion({ name, legend, leftLabel, rightLabel, value, onChange }: { name: string; legend: string; leftLabel: string; rightLabel: string; value: number | null; onChange: (value: number) => void }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-base font-semibold text-ink">{legend}</legend>
      <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
        <div className="grid gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 sm:grid-cols-2">
          <span>1 = {leftLabel}</span>
          <span className="sm:text-right">7 = {rightLabel}</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {ratingValues.map((rating) => (
            <label key={rating} className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 transition hover:border-research-200 hover:bg-slate-50 has-[:checked]:border-research-500 has-[:checked]:bg-research-50 has-[:checked]:text-research-800">
              <input type="radio" name={name} value={rating} checked={value === rating} onChange={() => onChange(rating)} className="h-4 w-4 accent-research-600" />
              <span>{rating}</span>
            </label>
          ))}
        </div>
      </div>
    </fieldset>
  );
}

export function TextQuestion({ label, value, onChange, placeholder = "Write one sentence...", minLength, maxLength }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; minLength?: number; maxLength?: number }) {
  return (
    <label className="block space-y-3">
      <span className="text-base font-semibold text-ink">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-24 w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-slate-400 focus:border-research-500 focus:ring-4 focus:ring-research-100"
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
      />
      {maxLength ? <span className="block text-right text-xs text-slate-500">{value.length}/{maxLength} characters</span> : null}
    </label>
  );
}
