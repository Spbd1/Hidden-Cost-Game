import { Card } from "@/components/Card";

interface PlaceholderFormProps {
  title: string;
  description: string;
  fields: string[];
}

export function PlaceholderForm({ title, description, fields }: PlaceholderFormProps) {
  return (
    <Card className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-slate-600">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field} className="space-y-2">
            <span className="text-sm font-medium text-slate-700">{field}</span>
            <input
              disabled
              placeholder="To be implemented"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
            />
          </label>
        ))}
      </div>
    </Card>
  );
}
