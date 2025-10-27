// src/hooks/useDynamicTitle.ts
import { useEffect } from "react";
import { useMatches } from "react-router";
import type { UIMatch } from "react-router";
import type { BreadcrumbHandle } from "@/types/router";
import { useI18n } from "@/i18n/I18nProvider";
import type { TranslationDescriptor } from "@/i18n/I18nProvider";

type TitleValue = string | TranslationDescriptor | null | undefined;

export function useDynamicTitle(base: string = "Home") {
  const matches = useMatches() as UIMatch<unknown, BreadcrumbHandle>[];
  const { t } = useI18n();

  useEffect(() => {
    const titles: string[] = [base];

    for (const match of matches) {
      const titleValue = match.handle?.title;
      if (!titleValue) continue;

      const resolved: TitleValue = typeof titleValue === "function" ? titleValue(match, t) : titleValue;
      if (!resolved) continue;

      if (typeof resolved === "string") {
        titles.push(resolved);
      } else {
        titles.push(t(resolved.key, resolved.params));
      }
    }


    // Reverse so breadcrumb hierarchy reads left-to-right visually,
    // but page title shows leaf-first
    document.title = titles.reverse().join(" | ");
  }, [matches, base, t]);
}
