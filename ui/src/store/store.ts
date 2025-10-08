// ui/src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { api as storeApi } from "./api";
import { locationApi } from "@/services/locationApi"; // RTKQ service

export const store = configureStore({
  reducer: {
    [storeApi.reducerPath]: storeApi.reducer,
    [locationApi.reducerPath]: locationApi.reducer,
  },
  middleware: (gDM) => gDM().concat(
    storeApi.middleware,
    locationApi.middleware
  ),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppStore = typeof store;
export type AppDispatch = AppStore["dispatch"];