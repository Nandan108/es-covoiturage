import { useDynamicTitle } from "../../hooks/useDynamicTitle";
import { Outlet } from "react-router";
import PageHeader from "./PageHeader";

function Layout() {
  useDynamicTitle("Covoiturage Éveil Spirituel");

  return (
    <>
      <PageHeader />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;