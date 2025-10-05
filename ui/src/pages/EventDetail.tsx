import { useGetEventQuery } from "../store/api";
import { useParams } from 'react-router';
import type { HashId } from "../types";
import { throwError } from '../utils';

import EventDetailBody from "../components/EventDetailBody";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: event } = useGetEventQuery(id as HashId);
  if (!event) {
    throwError("Désolé, cet événement est introuvable", 404);
  }

  return <EventDetailBody {...{ event }} />;
}
