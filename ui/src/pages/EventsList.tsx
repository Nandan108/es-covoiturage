import { useEffect } from "react";
import { useLoaderData } from "react-router";
import type { EventSummary } from "@/types/types";
import { store } from "@/store/store";
import { api } from "@/store/api";
import EventsList from "@/components/EventsList";
import { runQuery } from "@/utils/runApi";

/* eslint-disable react-refresh/only-export-components */

export function Component() {
  const events = useLoaderData() as EventSummary[];
  const prefetchEvent = api.usePrefetch("getEvent");

  // Preload EventDetail componnet and first 3 events' details
  // for faster navigation
  useEffect(() => {
    import("./EventDetail").catch(() => {});

    events.slice(0, 3).forEach((event) => {
      prefetchEvent(event.hashId, { ifOlderThan: 60 * 30 });
    });
  }, [events, prefetchEvent]);

  return <EventsList events={events} />;
}

export async function loader() {
  const sub = store.dispatch(api.endpoints.getEvents.initiate());

  return runQuery(sub, "Désolé, impossible de charger la liste des événements", 500);
}
