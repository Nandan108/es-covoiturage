import { Provider } from "react-redux";
import { Suspense } from "react";
import { createBrowserRouter, NavLink, RouterProvider } from "react-router";
import { store } from "./store/store";
import ErrorBoundary from "./pages/ErrorBoundary";
import Layout from "./components/layout/Layout";
import type { BreadcrumbHandle } from "./types/router";
import type { EventDetail, Offer } from "./types/types";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    handle: {
      breadcrumb: () => <NavLink to="/">Accueil</NavLink>,
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
          breadcrumb: (match) => {
            const event = match.loaderData as EventDetail | undefined;
            const title = event ? event.loc_name : "Événement";
            return <NavLink to={match.pathname} title={title} end>{title}</NavLink>;
          },
          title: (match) => {
            const event = match.loaderData as EventDetail | undefined;
            return event ? event.loc_name : "Événement";
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
              breadcrumb: (match) => <NavLink to={match.pathname}>Nouvelle offre</NavLink>,
              title: "Nouvelle offre",
            } as BreadcrumbHandle<Offer>,
          },
          {
            path: "offers/:offerId/edit",
            lazy: async () => import("./pages/EditOffer"),
            handle: {
              breadcrumb: (match) => {
                const offer = match.loaderData;
                return <NavLink to={match.pathname}>{offer ? offer.name : "Modifier l'offre"}</NavLink>;
              },
              title: (match) => {
                const offer = match.loaderData;
                return offer ? `Modifier l'offre - ${offer.name}` : "Modifier l'offre";
              },
            } as BreadcrumbHandle<Offer>,
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <Provider store={store}>
      <Suspense fallback={<div className="p-4">Loading…</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </Provider>
  );
}

export default App;
