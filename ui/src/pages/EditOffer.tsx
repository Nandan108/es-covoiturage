import OfferForm from '../components/OfferForm';
import { useParams } from "react-router";
import { useGetEventQuery } from "../store/api";
import { throwError } from "../utils";

export default function EditOffer() {
  // get event from parent route loader data
  // const loaderData = useRouteLoaderData('event-detail');

  const { id: eventHash, offerId: offerIdString } = useParams();
  const offerId = Number(offerIdString);

  const { data: event } = useGetEventQuery(eventHash as HashId);

  const offer = event?.offers.find((o: Offer) => o.id === offerId);

  // throw a 404 Error if no event or offer
  if (!event || !offer) {
    throwError("Désolé, cette offre est introuvable", 404);
  }

  return <OfferForm offer={offer} event={event}/>;
}
