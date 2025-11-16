import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { GrLanguage, GrMailOption } from "react-icons/gr";
import ContactDialog from "./contact/ContactDialog";

function Footer() {
  const { locale, setLocale, t, locales } = useI18n();
  const [isContactOpen, setContactOpen] = useState(false);

  return (
    <>
      <footer className="mt-8 border-t bg-white/50 opacity-80 border-slate-200 px-4 py-6 text-sm text-slate-600 flex flex-col-reverse items-center gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex flex-col opacity-60 text-xs items-center sm:items-start">
          {t("footer.signature")}
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="mt-1 inline-flex items-center gap-2 text-slate-700 underline-offset-2 hover:underline"
          >
            {t("footer.contact")}
            <GrMailOption className="inline-block" />
          </button>
        </p>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="min-w-fit">
            <ul className="flex flex-nowrap items-center gap-1.5">
              <li><GrLanguage /></li>
              {locales.map((loc, i) => (
                <li
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className={`cursor-pointer ${loc === locale ? "font-bold underline" : ""}${
                    i > 0 ? " border-l border-slate-400 pl-1.5" : ""
                  }`}
                >
                  {loc.toUpperCase()}
                </li>
              ))}
            </ul>
          </span>
        </div>
      </footer>
      <ContactDialog open={isContactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}

export default Footer;
