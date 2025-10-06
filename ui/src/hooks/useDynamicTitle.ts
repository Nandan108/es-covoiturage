// src/hooks/useDynamicTitle.ts
import { useEffect } from "react";
import { useMatches } from "react-router";
import type { UIMatch } from "react-router";
import type { BreadcrumbHandle } from "../types/router";

export function useDynamicTitle(base: string = "Home") {
  const matches = useMatches() as UIMatch<unknown, BreadcrumbHandle>[];

  useEffect(() => {
    const titles: string[] = [base];

    for (const match of matches) {
      const t = match.handle?.title;
      if (!t) continue;

      if (typeof t === "function") {
        const resolved = t(match);
        if (resolved) titles.push(resolved);
      } else {
        titles.push(t);
      }
    }


    // Reverse so breadcrumb hierarchy reads left-to-right visually,
    // but page title shows leaf-first
    document.title = titles.reverse().join(" | ");
  }, [matches, base]);
}
