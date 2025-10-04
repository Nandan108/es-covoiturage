import OfferForm from '../components/OfferForm';
import { useParams } from "react-router";
import { useGetEventQuery } from "../store/api";
import type { HashId, Offer } from "../types";

export default function EditOffer() {
  // get event from parent route loader data
  // const loaderData = useRouteLoaderData('event-detail');

  const { id: eventHash, offerId: offerIdString } = useParams();
  const offerId = Number(offerIdString);

  const { data: event } = useGetEventQuery(eventHash as HashId);

  const offer = event?.offers.find((o: Offer) => o.id === offerId);

  if (!event || !offer) {
    return <div>Offre introuvable</div>;
  }

  return <OfferForm offer={offer} event={event}/>;
}
