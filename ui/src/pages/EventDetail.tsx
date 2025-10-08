import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData } from 'react-router';
import { type EventDetail, type HashId } from '@/types/types';
import { store } from "@/store/store";
import { api } from "@/store/api";
import { runQuery } from '@/utils';
import EventDetailBody from "@/components/EventDetailBody";

/* eslint-disable react-refresh/only-export-components */

export function Component() {
  const event = useLoaderData() as EventDetail;

  if (!event) {
    throwError("Désolé, cet événement est introuvable", 404);
  }

  return <EventDetailBody event={event} />;
}

export async function loader({ params }: LoaderFunctionArgs) {
  const hashId = params.id as HashId;
  const sub = store.dispatch(api.endpoints.getEvent.initiate(hashId));

  return runQuery(sub, "Désolé, cet événement est introuvable", 404);
}
