"use client";

import { DropdownMenu } from "@/components/dashboard/dropdown-menu";
import { useUiPreferences } from "@/features/shell/ui-preferences";

export function AnalystFilterBar() {
  const { filters, setFilter, resetFilters, t } = useUiPreferences();

  return (
    <div className="border-b border-[var(--border-soft)] px-3 py-3 md:px-4">
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect label={t("filters.outletType")} value={filters.outletScope} onChange={(value) => setFilter("outletScope", value as typeof filters.outletScope)} options={[{ value: "all", label: t("filters.all") }, { value: "national", label: t("filters.national") }, { value: "local", label: t("filters.local") }]} />
        <FilterSelect label={t("filters.region")} value={filters.region} onChange={(value) => setFilter("region", value)} options={[{ value: "all", label: t("filters.all") }, { value: "bucharest", label: t("filters.bucharest") }, { value: "moldova", label: t("filters.moldova") }, { value: "transylvania", label: t("filters.transylvania") }]} />
        <FilterSelect label={t("filters.topic")} value={filters.topic} onChange={(value) => setFilter("topic", value)} options={[{ value: "all", label: t("filters.all") }, { value: "elections", label: t("filters.elections") }, { value: "energy", label: t("filters.energy") }, { value: "defense", label: t("filters.defense") }, { value: "health", label: t("filters.health") }]} />
        <FilterSelect label={t("filters.tone")} value={filters.tone} onChange={(value) => setFilter("tone", value as typeof filters.tone)} options={[{ value: "all", label: t("filters.all") }, { value: "negative", label: t("filters.negative") }, { value: "mixed", label: t("filters.mixed") }, { value: "positive", label: t("filters.positive") }]} />
        <FilterSelect label={t("filters.frame")} value={filters.frame} onChange={(value) => setFilter("frame", value)} options={[{ value: "all", label: t("filters.all") }, { value: "institutional", label: t("filters.institutional") }, { value: "conflict", label: t("filters.conflict") }, { value: "emotional", label: t("filters.emotional") }]} />
        <FilterSelect label={t("filters.ghosting")} value={filters.ghosting} onChange={(value) => setFilter("ghosting", value)} options={[{ value: "all", label: t("filters.all") }, { value: "high", label: t("filters.high") }, { value: "medium", label: t("filters.medium") }]} />
        <button type="button" onClick={resetFilters} className="rounded-full border border-[var(--border-soft)] px-3 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">{t("filters.reset")}</button>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <DropdownMenu
      value={value}
      onChange={onChange}
      options={options}
      triggerLabel={label}
      ariaLabel={label}
      triggerClassName="text-xs"
      panelClassName="min-w-[12rem]"
    />
  );
}
