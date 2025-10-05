// ui/src/pages/EventsList.tsx
import { store } from '../store/store'
import { api } from '../store/api'

export default async function loader() {
  const sub = store.dispatch(api.endpoints.getEvents.initiate())
  try {
    const eventsList = await sub.unwrap();
    return eventsList;
  } catch {
    throw new Response("Désolé, impossible de charger la liste des événements", { status: 500 });
  } finally {
    sub.unsubscribe()
  }
}
