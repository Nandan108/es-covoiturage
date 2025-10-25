import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { translations, type Locale, type TranslationKey } from "./translations";

const STORAGE_KEY = "es:locale";

type Params = Record<string, string | number> | undefined;

type TranslationDescriptor = {
  key: TranslationKey;
  params?: Params;
};

type I18nContextValue = {
  locale: Locale;
  locales: Locale[];
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Params) => string;
};

const fallbackTranslate = (key: TranslationKey, params?: Params, locale: Locale = "fr"): string => {
  const dict = translations[locale] ?? translations.fr;
  const template = dict[key] ?? translations.fr[key] ?? key;
  return typeof template === "string" ? template.replace(/\{(\w+)\}/g, (_, token) => {
    const value = params?.[token];
    return value !== undefined ? String(value) : "";
  }) : String(template);
};

const locales = Object.keys(translations) as Locale[];

const I18nContext = createContext<I18nContextValue>({
  locale: "fr",
  locales,
  setLocale: () => undefined,
  t: (key, params) => fallbackTranslate(key, params),
});

const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && value in translations;

const getInitialLocale = (): Locale => {
  if (typeof window === "undefined") return "fr";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (isLocale(stored)) return stored;
  return navigator.language?.startsWith("en") ? "en" : "fr";
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  };

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    locales,
    setLocale,
    t: (key, params) => fallbackTranslate(key, params, locale),
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useI18n = () => useContext(I18nContext);
export type { TranslationDescriptor };
