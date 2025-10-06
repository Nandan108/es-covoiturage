import { Provider } from "react-redux";
import { Suspense } from "react";
import { createBrowserRouter, NavLink, RouterProvider } from "react-router";
import { store } from "./store/store";
import eventDetailLoader from "./pages/EventDetail.loader";
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
        lazy: async () => {
          const page = import("./pages/EventsList");
          const data = import("./pages/EventsList.loader");
          const [pageResult, dataResult] = await Promise.all([page, data]);
          return {
            Component: pageResult.default,
            loader: dataResult.default,
          };
        },
      },
      {
        path: "/events/:id",
        id: "event-detail",
        loader: eventDetailLoader,
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
            // index: true,
            path: "",
            lazy: async () => {
              const page = await import("./pages/EventDetail");
              return {
                Component: page.default,
                loader: eventDetailLoader,
              };
            },
          },
          {
            path: "offers/new",
            handle: {
              breadcrumb: (match) => <NavLink to={match.pathname}>Nouvelle offre</NavLink>,
              title: "Nouvelle offre",
            } as BreadcrumbHandle<Offer>,
            lazy: async () => {
              const page = await import("./pages/NewOffer");
              const action = await import("./components/OfferCreate.action");
              return {
                Component: page.default,
                action: action.default,
              };
            },
          },
          {
            path: "offers/:offerId/edit",
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
            lazy: async () => {
              const page = await import("./pages/EditOffer");
              const action = await import("./components/OfferPatch.action");
              return { Component: page.default, action: action.default };
            },
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
