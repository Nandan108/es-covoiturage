import { useParams } from 'react-router-dom';
import OfferForm from '../components/OfferForm';
import { useGetEventQuery } from '../store/api';
import type { HashId } from '../types';

export default function NewOffer() {
  // get event from parent route loader data
  const { id: eventHash } = useParams();
  const { data: event } = useGetEventQuery(eventHash as HashId);

  if (!event) {
    return <div>Error: the event was not found</div>;
  }

  return <OfferForm event={event}/>;
}
