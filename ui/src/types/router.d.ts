import type { UIMatch } from "react-router";
import type { TranslationDescriptor } from "@/i18n/I18nProvider";

export interface BreadcrumbHandle<Data = unknown> {
  breadcrumb?: (match: UIMatch<Data, BreadcrumbHandle<Data>>) => React.ReactNode;
  title?:
    | string
    | TranslationDescriptor
    | ((match: UIMatch<Data, BreadcrumbHandle<Data>>) => string | TranslationDescriptor);
}
