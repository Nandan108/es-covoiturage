import { useI18n } from "@/i18n/I18nProvider";
import { GrLanguage } from "react-icons/gr";

function Footer() {
  const { locale, setLocale, t, locales } = useI18n();

  return (
    <footer className="mt-8 border-t bg-white/50 opacity-80 border-slate-200 px-4 py-6 text-sm text-slate-600 flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p>{t("footer.signature")}</p>
      <label className="flex items-center gap-2 text-slate-700">
        <span className="min-w-fit">
          <ul className="flex flex-nowrap items-center gap-1">
            <li><GrLanguage /></li>
            {locales.map((loc, i) => (
              <>
                {i > 0 ? <span className="opacity-60">|</span> : ""}
                <li key={loc} onClick={() => setLocale(loc)} className={`cursor-pointer ml-1 ${loc === locale ? "font-bold underline" : ""}`}>
                  {loc.toUpperCase()}
                </li>
              </>
            ))}
          </ul>
        </span>
      </label>
    </footer>
  );
}

export default Footer;
