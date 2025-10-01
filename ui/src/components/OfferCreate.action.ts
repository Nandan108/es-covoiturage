import { redirect, type ActionFunctionArgs } from "react-router-dom";
import type { HashId } from "../types";
import { store } from "../store/store";
import { api } from "../store/api";

export default async function CreateOfferAction({ params, request }: ActionFunctionArgs) {
  const eventHash = params.id as HashId;

  const formData = await request.formData();
  const entries = Object.fromEntries(formData.entries());

  const sub = store.dispatch(
    api.endpoints.createOffer.initiate({
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
      },
    })
  );

  try {
    await sub.unwrap();
  } catch {
    throw new Response("Unable to create offer", { status: 400 });
  } finally {
    // sub.unsubscribe();
  }
  return redirect(`/events/${eventHash}`); // back to event detail
}
