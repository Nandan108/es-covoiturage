import { store } from '../store/store'
import { api } from '../store/api'

export default async function loader() {
  const sub = store.dispatch(api.endpoints.getEvents.initiate())
  try {
    await sub.unwrap()
  } catch {
    throw new Response("Désolé, impossible de charger la liste des événements", { status: 500 });
  } finally {
    sub.unsubscribe()
  }
  return null // we just primed the cache
}
