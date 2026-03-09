import { cookies } from "next/headers";
import { PageHeader } from "@/components/dashboard/page-header";
import { ShellCard } from "@/components/dashboard/shell-card";
import { defaultLocale, preferenceStorageKeys, supportedLocales } from "@/config/ui";
import { dictionaries } from "@/config/dictionaries";
import { AdminPage } from "@/features/platform/admin-page";
import { hasAdminAccess, lockAdmin, unlockAdmin } from "./actions";

function getAllowedLocale(value: string | undefined) {
  return value && supportedLocales.includes(value as (typeof supportedLocales)[number])
    ? (value as (typeof supportedLocales)[number])
    : defaultLocale;
}

export default async function AdminRoute({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const cookieStore = await cookies();
  const locale = getAllowedLocale(cookieStore.get(preferenceStorageKeys.locale)?.value);
  const t = dictionaries[locale];
  const params = await searchParams;

  if (await hasAdminAccess()) {
    return (
      <div className="grid gap-4">
        <div className="flex justify-end">
          <form action={lockAdmin}>
            <button type="submit" className="rounded-full border border-[var(--border-soft)] px-3 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              Lock admin
            </button>
          </form>
        </div>
        <AdminPage />
      </div>
    );
  }

  const summary =
    params.error === "missing"
      ? "Set ADMIN_PORTAL_PASSWORD in .env.local to enable this route."
      : params.error === "invalid"
        ? "The password was incorrect. Try again."
        : t["admin.summary"];

  return (
    <div className="grid gap-4">
      <PageHeader eyebrow={t["admin.heading"]} title={t["admin.heading"]} summary={summary} />
      <ShellCard className="max-w-xl">
        <form action={unlockAdmin} className="grid gap-4">
          <label className="grid gap-2 text-sm text-[var(--text-muted)]">
            <span>Admin password</span>
            <input
              type="password"
              name="password"
              className="rounded-[16px] border border-[var(--border-soft)] bg-[var(--panel-subtle)] px-4 py-3 text-[var(--text-primary)] outline-none"
              placeholder="Enter admin password"
            />
          </label>
          <button type="submit" className="rounded-full bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-contrast)]">
            Unlock admin
          </button>
        </form>
      </ShellCard>
    </div>
  );
}