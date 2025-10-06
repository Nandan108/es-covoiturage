import OfferForm from "@/components/OfferForm";
import { useParams, useRouteLoaderData } from "react-router";
import type { EventDetail, Offer } from "@/types/types";
import { throwError } from "@/utils";

export default function EditOffer() {
  // get event from parent route loader data
  const event = useRouteLoaderData("event-detail") as EventDetail;

  const { offerId: offerIdString } = useParams();
  const offerId = Number(offerIdString);

  const offer = event?.offers.find((o: Offer) => o.id === offerId);

  // throw a 404 Error if no event or offer
  if (!event || !offer) {
    throwError("Désolé, cette offre est introuvable", 404);
  }

  return <OfferForm offer={offer} event={event} />;
}
