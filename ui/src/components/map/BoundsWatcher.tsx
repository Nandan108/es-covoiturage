import { useMap } from 'react-leaflet'
import { useEffect, useRef } from 'react'

export default function BoundsWatcher({
  onBoundsChange, debounceMs = 50,
}: { onBoundsChange: (b: L.LatLngBounds) => void; debounceMs?: number }) {
  const map = useMap()
  const t = useRef<number | null>(null)
  useEffect(() => {
    const fire = () => onBoundsChange(map.getBounds())
    const onMove = () => { if (t.current) clearTimeout(t.current!); t.current = window.setTimeout(fire, debounceMs) }
    map.on('move', onMove); fire()
    return () => { if (t.current) clearTimeout(t.current!); map.off('move', onMove) }
  }, [map, onBoundsChange, debounceMs])
  return null
}
