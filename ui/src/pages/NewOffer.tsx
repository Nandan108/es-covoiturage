import { useParams } from 'react-router';
import OfferForm from '../components/OfferForm';
import { useGetEventQuery } from '../store/api';
import type { HashId } from '../types';
import { throwError } from '../utils';

export default function NewOffer() {
  // get event from parent route loader data
  const { id: eventHash } = useParams();
  const { data: event } = useGetEventQuery(eventHash as HashId);

  if (!event) {
    throwError("Désolé, cet événement est introuvable", 404);
  }

  return <OfferForm event={event}/>;
}
