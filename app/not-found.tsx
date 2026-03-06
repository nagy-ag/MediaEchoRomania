import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-[32px] border border-[var(--border-soft)] bg-[var(--panel-bg)] p-8 shadow-[var(--shadow-shell)] motion-safe:animate-[dashboardIn_var(--motion-slow)_var(--ease-fluid)]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">MediaEcho</p>
      <h1 className="mt-3 [font-family:var(--font-display)] text-4xl text-[var(--text-primary)]">Route not found</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-[var(--text-muted)]">This dashboard route is not available in the current mock-data build.</p>
      <Link href="/" className="mt-6 inline-flex rounded-[18px] bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-contrast)] transition hover:-translate-y-0.5">
        Return to dashboard
      </Link>
    </div>
  );
}
