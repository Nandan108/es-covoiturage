import { useLoaderData } from "react-router";
import type { EventSummary } from "@/types/types";
import { store } from "@/store/store";
import { api } from "@/store/api";
import EventsList from "@/components/EventsList";
import { runQuery } from "@/utils/runApi";

/* eslint-disable react-refresh/only-export-components */

export function Component() {
  const events = useLoaderData() as EventSummary[];

  return <EventsList events={events} />;
}

export async function loader() {
  const sub = store.dispatch(api.endpoints.getEvents.initiate());

  return runQuery(sub, "Désolé, impossible de charger la liste des événements", 500);
}
