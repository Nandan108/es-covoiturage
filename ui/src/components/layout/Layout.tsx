import { Outlet } from "react-router";
import PageHeader from "./PageHeader";
import Footer from "./Footer";
import { useI18n } from "@/i18n/I18nProvider";
import { useDynamicTitle } from "@/hooks/useDynamicTitle";
import { useFlashNotice } from "@/hooks/useFlashNotice";

function Layout() {
  const { t } = useI18n();
  useDynamicTitle(t("app.title"));
  useFlashNotice();

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
