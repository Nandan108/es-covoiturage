import { useDynamicTitle } from "@/hooks/useDynamicTitle";
import { Outlet } from "react-router";
import PageHeader from "./PageHeader";
import Footer from "./Footer";
import { useI18n } from "@/i18n/I18nProvider";

function Layout() {
  const { t } = useI18n();
  useDynamicTitle(t("app.title"));

  return (
    <>
      <PageHeader />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default Layout;
