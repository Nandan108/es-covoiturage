// src/components/Breadcrumbs.tsx
import { useMatches, type UIMatch } from "react-router";
import { Fragment } from "react";
import type { BreadcrumbHandle } from "@/types/router";
import { lightblueCar } from "../map/markerIcons";

export default function Breadcrumbs() {
  const matches = useMatches() as UIMatch<unknown, BreadcrumbHandle>[];

  const crumbs = matches
    .filter((m) => m.handle?.breadcrumb)
    .map((match, index) => {
      const Breadcrumb = match.handle.breadcrumb;
      return <Fragment key={index}>{Breadcrumb!(match)}</Fragment>;
    });

  return (
    <nav className="py-2 px-4 text-sm text-gray-600 flex flex-wrap items-center gap-1">
      {crumbs.map((crumb, i) => (
        <div className='text-nowrap max-w-[250px] overflow-ellipsis overflow-clip' key={i}>
          {i > 0 && <span className="text-gray-400">
            <img src={lightblueCar} className="inline-block mx-2" width="25" />
            </span>}
          {crumb}
        </div>
      ))}
    </nav>
  );
}
