import { useRouteLoaderData } from 'react-router';
import OfferForm from '@/components/OfferForm';
import type { EventDetail } from '@/types/types';
import { throwError } from '@/utils';

export default function NewOffer() {
  // get event from parent route loader data
  const event = useRouteLoaderData("event-detail") as EventDetail;

  if (!event) {
    throwError("Désolé, cet événement est introuvable", 404);
  }

  return <OfferForm event={event}/>;
}
