import { redirect, type ActionFunctionArgs } from "react-router-dom";
import type { HashId } from "../types";
import { store } from "../store/store";
import { api } from "../store/api";

export default async function action({ params, request }: ActionFunctionArgs) {
  const eventHash = params.id as HashId;

  // get form data
  const formData = await request.formData();
  const entries = Object.fromEntries(formData.entries());
  // get existing offer if any
  const offerId = params.offerId ? Number(params.offerId) : null;
  if (offerId == null) {
    throw new Response("Missing offer ID", { status: 400 });
  }

  const sub = store.dispatch(
    api.endpoints.updateOffer.initiate({
      id: offerId,
      eventHash,
      token: '',
      patch: {
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
      },
    })
  );

  try {
    await sub.unwrap();
  } catch {
    throw new Response("Unable to update offer", { status: 400 });
  } finally {
    // sub.unsubscribe();
  }
  return redirect(`/events/${eventHash}`); // back to event detail
}
