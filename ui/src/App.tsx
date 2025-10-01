import { Provider } from "react-redux";
import { Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { store } from "./store/store";
import eventDetailLoader from "./pages/EventDetail.loader";
import EventDetail from "./pages/EventDetail";
import PageHeader from "./components/PageHeader";
import ErrorBoundary from "./pages/Error";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <PageHeader />
        <main>
          <Outlet />
        </main>
      </>
    ),
    errorElement: <ErrorBoundary />,
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
        children: [
          {
            // index: true,
            path: "",
            Component: EventDetail,
            loader: eventDetailLoader,
          },
          {
            path: "offers/new",
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
