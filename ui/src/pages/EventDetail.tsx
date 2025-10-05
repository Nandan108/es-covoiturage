import { useLoaderData } from 'react-router';
import { type EventDetail } from "../types";
import { throwError } from '../utils';

import EventDetailBody from "../components/EventDetailBody";

export default function EventDetail() {
  const event = useLoaderData() as EventDetail;

  if (!event) {
    throwError("Désolé, cet événement est introuvable", 404);
  }

  return <EventDetailBody event={event} />;
}
