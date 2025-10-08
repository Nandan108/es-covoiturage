import OfferForm from "@/components/OfferForm";
import { useParams, useRouteLoaderData } from "react-router";
import type { EventDetail, Offer } from "@/types/types";
import { runMutation } from "@/utils";
import { redirect, type ActionFunctionArgs } from "react-router";
import type { HashId } from "@/types/types";
import { store } from "@/store/store";
import { api } from "@/store/api";

export function Component() {
  // get event from parent route loader data
  const event = useRouteLoaderData("event-detail") as EventDetail;

  const { offerId: offerIdString } = useParams();
  const offerId = Number(offerIdString);
  const offer = event?.offers.find((o: Offer) => o.id === offerId);

  return <OfferForm offer={offer} event={event} />;
}

/* eslint-disable react-refresh/only-export-components */

// This action handles both UPDATE (PATCH) and DELETE methods
export async function action({ params, request }: ActionFunctionArgs) {
  const eventHash = params.id as HashId;
  const formData = await request.formData();
  const offerId = Number(params.offerId);

  // get existing offer if any
  if (offerId == null) {
    throw new Response("Missing offer ID", { status: 400 });
  }

  if (request.method === "DELETE") {
    await deleteOffer(eventHash, offerId);
  } else {
    await updateOffer(eventHash, offerId, formData);
  }

  return redirect(`/events/${eventHash}`); // back to event detail
}

async function deleteOffer(eventHash: string, offerId: number) {
  const sub = store.dispatch(api.endpoints.deleteOffer.initiate({ id: offerId, eventHash }));

  return runMutation(sub, "Unable to delete offer", 500);
}

async function updateOffer(eventHash: string, offerId: number, formData: FormData) {
  const entries = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue>;

  const patch = {
    name: String(entries.name),
    address: String(entries.address),
    lat: Number(entries.lat),
    lng: Number(entries.lng),
    email: String(entries.email),
    email_is_public: entries.email_is_public === "true",
    driver_seats: Number(entries.driver_seats),
    pasngr_seats: Number(entries.pasngr_seats),
    notes: String(entries.notes || null),
    phone: String(entries.phone || null),
  };

  const sub = store.dispatch(api.endpoints.updateOffer.initiate({ offerId, eventHash, patch }));

  return runMutation(sub, "Unable to update offer", 500);
}
