interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
}

export function PageHeader({ eyebrow = "Hidden Cost Game", title, description }: PageHeaderProps) {
  return (
    <header className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-research-700">{eyebrow}</p>
      <div className="max-w-3xl space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-ink md:text-5xl">{title}</h1>
        <p className="text-lg leading-8 text-slate-600">{description}</p>
      </div>
    </header>
  );
}
