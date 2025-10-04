import { useGetEventQuery } from "../store/api";
import { useParams } from 'react-router';
import type { HashId } from "../types";

import EventDetailBody from "../components/EventDetailBody";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: event } = useGetEventQuery(id as HashId);
  if (!event) return <div className="p-4">Loading…</div>;

  return <EventDetailBody {...{ event }} />;
}
