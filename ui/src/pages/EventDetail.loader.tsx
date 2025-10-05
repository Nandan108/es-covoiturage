import { type LoaderFunctionArgs } from "react-router";
import { store } from "../store/store";
import { api } from "../store/api";
import type { HashId } from "../types";

export default async function loader({ params }: LoaderFunctionArgs) {
  const hashId = params.id as HashId;
  const sub = store.dispatch(api.endpoints.getEvent.initiate(hashId));
  try {
    const event = await sub.unwrap();
    return event;
  } catch {
    throw new Response("Désolé, cet événement est introuvable", { status: 404 });
  } finally {
    sub.unsubscribe();
  }
}
