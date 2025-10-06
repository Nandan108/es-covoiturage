import type { UIMatch } from "react-router";

export interface BreadcrumbHandle<Data = unknown> {
  breadcrumb?: (match: UIMatch<Data, BreadcrumbHandle<Data>>) => React.ReactNode;
  title?: string | ((match: UIMatch<Data, BreadcrumbHandle<Data>>) => string);
}