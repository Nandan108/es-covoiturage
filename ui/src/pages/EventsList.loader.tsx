// ui/src/pages/EventsList.tsx
import { store } from '../store/store'
import { api } from '../store/api'

export default async function loader() {
  const sub = store.dispatch(api.endpoints.getEvents.initiate())
  try { await sub.unwrap() } finally { sub.unsubscribe() }
  return null // we just primed the cache
}
