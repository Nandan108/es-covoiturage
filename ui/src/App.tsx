import { Provider } from "react-redux";
import { Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import { store } from "./store/store";
import eventDetailLoader from "./pages/EventDetail.loader";
import PageHeader from "./components/PageHeader";
import ErrorBoundary from "./pages/ErrorBoundary";


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
            lazy: async () => {
              const page = await import("./pages/EventDetail");
              const data = await import("./pages/EventDetail.loader");
              return {
                Component: page.default,
                loader: data.default,
              };
            },
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
