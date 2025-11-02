import { useRouteLoaderData } from "react-router";
import OfferForm from "@/components/OfferForm";
import type { EventDetail } from "@/types/types";
import { redirect, type ActionFunctionArgs } from "react-router";
import type { HashId } from "@/types/types";
import { api } from "@/store/api";
import { runMutation, runQuery } from "@/utils";
import { store } from "@/store/store";
import { appendNotice } from "@/utils/url";
import { MutationError, mutationErrorResponse } from "@/utils/runApi";

export function Component() {
  const event = useRouteLoaderData("event-detail") as EventDetail;

  return <OfferForm event={event} />;
}

/* eslint-disable react-refresh/only-export-components */

export async function action({ params, request }: ActionFunctionArgs) {
  const eventHash = params.id as HashId;

  const formData = await request.formData();

  const entries = Object.fromEntries(formData.entries());

  let eventDetail = api.endpoints.getEvent.select(eventHash)(store.getState())?.data;
  if (!eventDetail) {
    const eventSub = store.dispatch(api.endpoints.getEvent.initiate(eventHash));
    eventDetail = await runQuery(eventSub, "Événement introuvable", 404);
  }

  const sub = store.dispatch(api.endpoints.createOffer.initiate({
    eventHash,
    payload: {
      name: entries.name as string,
      address: entries.address as string,
      lat: Number(entries.lat),
      lng: Number(entries.lng),
      email: entries.email as string,
      email_is_public: entries.email_is_public === "true",
      driver_seats: Number(entries.driver_seats),
      pasngr_seats: Number(entries.pasngr_seats),
      notes: (entries.notes as string) || null,
      phone: (entries.phone as string) || null,
      token_hash: null,
      token_expires_at: null,
    },
  }));

  try {
    const { offer } = await runMutation(sub, "Unable to create offer", 500);
    return redirect(appendNotice(`/events/${eventHash}/offers/${offer.id}`, "offer_created"));
  } catch (error) {
    if (error instanceof MutationError) {
      return mutationErrorResponse(error);
    }
    throw error;
  }
}
