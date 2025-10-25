import { translations, type TranslationKey } from "./translations";
import type { TranslationDescriptor } from "./I18nProvider";
import type { Locale } from "./translations";

const fallbackTranslate = (key: TranslationKey, params?: Record<string, string | number>, locale: Locale = "fr"): string => {
  const dict = translations[locale] ?? translations.fr;
  const template = dict[key] ?? translations.fr[key] ?? key;
  if (typeof template !== "string") return String(template);
  return template.replace(/\{(\w+)\}/g, (_, token) => {
    const value = params?.[token];
    return value !== undefined ? String(value) : "";
  });
};

export const translateDescriptor = (descriptor: TranslationDescriptor | string | null | undefined, locale: Locale): string | undefined => {
  if (!descriptor) return undefined;
  if (typeof descriptor === "string") return descriptor;
  return fallbackTranslate(descriptor.key, descriptor.params, locale);
};

export { fallbackTranslate };
