import { Provider } from "react-redux";
import { Suspense } from "react";
import { createBrowserRouter, Navigate, NavLink, RouterProvider, type UIMatch } from "react-router";
import { store } from "./store/store";
import ErrorBoundary from "./pages/ErrorBoundary";
import Layout from "./components/layout/Layout";
import type { BreadcrumbHandle } from "./types/router";
import type { EventDetail, Offer } from "./types/types";
import type { AdminEvent } from "./admin/types";
import { useI18n } from "./i18n/I18nProvider";
import type { TranslationDescriptor } from "./i18n/I18nProvider";
import type { TranslationKey } from "./i18n/translations";

const TranslatedNavLink = ({ to, i18nKey }: { to: string; i18nKey: TranslationKey }) => {
  const { t } = useI18n();
  return <NavLink to={to}>{t(i18nKey)}</NavLink>;
};

const EventBreadcrumb = ({ path, event }: { path: string; event?: EventDetail }) => {
  const { t } = useI18n();
  const title = event ? event.loc_name : t("breadcrumb.event");
  return (
    <NavLink to={path} title={title} end>
      {title}
    </NavLink>
  );
};

const TranslatedText = ({
  i18nKey,
  params,
}: {
  i18nKey: TranslationKey;
  params?: Record<string, string>;
}) => {
  const { t } = useI18n();
  return <>{t(i18nKey, params)}</>;
};

const AdminEventBreadcrumb = (match: UIMatch<AdminEvent>) => {
  const event = match.loaderData as AdminEvent | undefined;
  return (
    <NavLink to={match.pathname} end>
      {event ? event.name : <TranslatedText i18nKey="admin.events.links.edit" />}
    </NavLink>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    handle: {
      breadcrumb: () => <TranslatedNavLink to="/" i18nKey="breadcrumb.home" />,
    },
    children: [
      {
        index: true,
        lazy: async () => import("./pages/EventsList"),
      },
      {
        path: "/events/:id",
        id: "event-detail",
        lazy: async () => {
          // we want the loader, but not the Component here.
          return { loader: (await import("./pages/EventDetail")).loader };
        },
        handle: {
          breadcrumb: (match) => (
            <EventBreadcrumb
              path={match.pathname}
              event={match.loaderData as EventDetail | undefined}
            />
          ),
          title: (match) => {
            const event = match.loaderData as EventDetail | undefined;
            if (event) return event.loc_name;
            return { key: "breadcrumb.event" } as TranslationDescriptor;
          },
        } as BreadcrumbHandle<EventDetail>,
        children: [
          {
            path: "",
            lazy: async () => import("./pages/EventDetail"),
          },
          {
            // Event detail with map focused on offer
            path: "offers/:offerId",
            lazy: async () => import("./pages/EventDetail"),
          },
          {
            path: "offers/new",
            lazy: async () => import("./pages/NewOffer"),
            handle: {
              breadcrumb: (match) => (
                <TranslatedNavLink to={match.pathname} i18nKey="breadcrumb.newOffer" />
              ),
              title: { key: "offerForm.title.new" } as TranslationDescriptor,
            } as BreadcrumbHandle<Offer>,
          },
          {
            path: "offers/:offerId/edit",
            lazy: async () => import("./pages/EditOffer"),
            handle: {
              breadcrumb: (match) => {
                const offer = match.loaderData as Offer | undefined;
                return (
                  <NavLink to={match.pathname}>
                    {offer ? offer.name : <TranslatedText i18nKey="breadcrumb.editOffer" />}
                  </NavLink>
                );
              },
              title: (match) => {
                const offer = match.loaderData as Offer | undefined;
                if (offer) {
                  return {
                    key: "offerForm.title.editWithName",
                    params: { name: offer.name },
                  } as TranslationDescriptor;
                }
                return { key: "offerForm.title.edit" } as TranslationDescriptor;
              },
            } as BreadcrumbHandle<Offer>,
          },
        ],
      },
    ],
  },
  {
    path: "/admin",
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/events" replace />,
      },
      {
        path: "login",
        lazy: async () => import("./pages/admin/AdminLogin"),
      },
      {
        path: "",
        handle: {
          breadcrumb: () => <TranslatedNavLink to="/admin/events" i18nKey="admin.title" />,
        },
        lazy: async () => {
          const module = await import("./pages/admin/AdminLayout");
          return { Component: module.default };
        },
        children: [
          {
            index: true,
            element: <Navigate to="/admin/events" replace />,
          },
          {
            path: "events",
            lazy: async () => {
              const module = await import("./pages/admin/AdminEventsPage");
              return {
                Component: module.Component,
                loader: module.loader,
                handle: {
                  breadcrumb: (match: UIMatch) => (
                    <TranslatedNavLink to={match.pathname} i18nKey="admin.nav.events" />
                  ),
                },
              };
            },
          },
          {
            path: "events/new",
            lazy: async () => {
              const module = await import("./pages/admin/AdminEventCreatePage");
              return {
                Component: module.Component,
                loader: module.loader,
                action: module.action,
                handle: {
                  breadcrumb: (match: UIMatch) => (
                    <TranslatedNavLink to={match.pathname} i18nKey="admin.events.new" />
                  ),
                },
              };
            },
          },
          {
            path: "events/:eventId/edit",
            lazy: async () => {
              const module = await import("./pages/admin/AdminEventEditPage");
              return {
                Component: module.Component,
                loader: module.loader,
                action: module.action,
                handle: {
                  breadcrumb: (match: UIMatch<AdminEvent>) => AdminEventBreadcrumb(match),
                } as BreadcrumbHandle<AdminEvent>,
              };
            },
          },
        ],
      },
    ],
  },
]);

function App() {
  const { t } = useI18n();
  return (
    <Provider store={store}>
      <Suspense fallback={<div className="p-4">{t("app.loading")}</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </Provider>
  );
}

export default App;
