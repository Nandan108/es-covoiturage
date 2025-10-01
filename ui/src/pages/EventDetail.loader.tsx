// ui/src/pages/EventDetail.tsx
import { type LoaderFunctionArgs } from "react-router-dom";
import { store } from "../store/store";
import { api } from "../store/api";
import type { HashId } from "../types";

export default async function loader({ params }: LoaderFunctionArgs) {
  const hashId = params.id as HashId;
  const sub = store.dispatch(api.endpoints.getEvent.initiate(hashId));
  try {
    await sub.unwrap();
  } catch {
    throw new Response("Not Found", { status: 404 });
  } finally {
    sub.unsubscribe();
  }
  return null;
}
