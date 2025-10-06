// ui/src/pages/EventDetail.tsx
import { type LoaderFunctionArgs } from "react-router";
import { store } from "@/store/store";
import { api } from "@/store/api";
import type { HashId } from "@/types/types";

export default async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id as HashId;
  const sub = store.dispatch(api.endpoints.getEvent.initiate(id));
  try {
    const offer = await sub.unwrap();
    return offer;
  } catch {
    throw new Response("Désolé, cette offre est introuvable", { status: 404 });
  } finally {
    sub.unsubscribe();
  }
}
