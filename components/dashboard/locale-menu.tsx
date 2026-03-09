"use client";

import { supportedLocales } from "@/config/ui";
import { DropdownMenu } from "@/components/dashboard/dropdown-menu";
import type { AppLocale } from "@/lib/contracts/ui";

interface LocaleMenuProps {
  locale: AppLocale;
  onChange: (locale: AppLocale) => void;
  label: string;
}

export function LocaleMenu({ locale, onChange, label }: LocaleMenuProps) {
  return (
    <DropdownMenu
      value={locale}
      onChange={(value) => onChange(value as AppLocale)}
      ariaLabel={label}
      align="right"
      compact
      triggerClassName="uppercase tracking-[0.12em]"
      panelClassName="w-28"
      options={supportedLocales.map((option) => ({ value: option, label: option.toUpperCase() }))}
    />
  );
}