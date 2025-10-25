import { Link } from "react-router";
import logo from "@/assets/logo.svg";
import Breadcrumbs from "./Breadcrumbs";
import { useI18n } from "@/i18n/I18nProvider";

function PageHeader() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col mb-4">
      <div className="flex flex-row text-center h-20 gap-5 items-center mb-2">
        <Link to="/">
          <img src={logo} alt={t("header.logoAlt")} className="block h-full" />
        </Link>
        <h1 className="">
          <a href="#">
            {/* href = @hasSection('page-title')@yield('page-title-link')@else{{ route('events.index') }}@endif */}
            {t("app.title")}
            {/* @hasSection('page-title') - @yield('page-title') @endif */}
          </a>
        </h1>
      </div>
      <Breadcrumbs />
    </div>
  );
}
export default PageHeader;
