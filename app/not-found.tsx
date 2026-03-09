export default function NotFound() {
  return (
    <div className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-6 py-10 text-center">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">Not found</p>
      <h1 className="mt-3 [font-family:var(--font-display)] text-3xl text-[var(--text-primary)]">This analyst view does not exist.</h1>
    </div>
  );
}
