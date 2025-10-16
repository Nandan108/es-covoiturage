import { useParams, type LoaderFunctionArgs } from "react-router";
import { useLoaderData } from 'react-router';
import { type EventDetail, type HashId } from '@/types/types';
import { store } from "@/store/store";
import { api } from "@/store/api";
import { runQuery } from '@/utils';
import EventDetailBody from "@/components/EventDetailBody";

/* eslint-disable react-refresh/only-export-components */

export function Component() {
  const event = useLoaderData() as EventDetail;
  const { offerId } = useParams();
  const offer = offerId ? event.offers.find(o => o.id === Number(offerId)) : null;

  // if offerId is set but not found, we redirect back to event detail without offerId
  if (offerId && !offer) {
    window.history.replaceState({}, '', `/events/${event.hashId}`);
  }

  return <EventDetailBody event={event} offerId={offerId ? Number(offerId) : null} />;
}

export async function loader({ params }: LoaderFunctionArgs) {
  const hashId = params.id as HashId;
  const sub = store.dispatch(api.endpoints.getEvent.initiate(hashId));

  const result = runQuery(sub, "Désolé, cet événement est introuvable", 404);
  return result;
}
