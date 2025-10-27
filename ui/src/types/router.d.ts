import type { UIMatch } from "react-router";
import type { TranslationDescriptor, type Params } from "@/i18n/I18nProvider";
import type { TranslationKey } from "@/i18n/translations";

export interface BreadcrumbHandle<Data = unknown> {
  breadcrumb?: (match: UIMatch<Data, BreadcrumbHandle<Data>>) => React.ReactNode;
  title?:
    | string
    | TranslationDescriptor
    | ((
        match: UIMatch<Data, BreadcrumbHandle<Data>>,
        t: (key: TranslationKey, params?: Params) => string
      ) => string | TranslationDescriptor);
}
