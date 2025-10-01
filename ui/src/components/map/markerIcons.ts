import L from 'leaflet'
import lightblueCar from '../../assets/markers/lightblue-car.png'
import redCar from '../../assets/markers/red-car.png'
import greenMan from '../../assets/markers/green-man.png'
import eventMarker from '../../assets/markers/marker-icon_red.png'
import eventMarkerRetina from '../../assets/markers/marker-icon_red-2x.png'
import eventMarkerShadow from '../../assets/markers/marker-shadow.png'

export const icons = {
  event: L.icon({ iconUrl: eventMarker, iconRetinaUrl: eventMarkerRetina, shadowUrl: eventMarkerShadow,
    shadowSize: [41,41], iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34] }),
  driver: L.icon({ iconUrl: redCar, iconRetinaUrl: redCar, iconSize: [50,26], iconAnchor: [25,23], popupAnchor: [1,-10] }),
  passenger: L.icon({ iconUrl: greenMan, iconRetinaUrl: greenMan, iconSize: [26,50], iconAnchor: [13,48], popupAnchor: [1,-34] }),
  both: L.icon({ iconUrl: lightblueCar, iconRetinaUrl: lightblueCar, iconSize: [50,26], iconAnchor: [25,23], popupAnchor: [1,-10] }),
}

export function iconForOffer(o: { driver_seats: number; pasngr_seats: number }) {
  return o.driver_seats && o.pasngr_seats ? icons.both : o.driver_seats ? icons.driver : icons.passenger
}

export type LatLngBounds = L.LatLngBounds | null;

export {
  L,
  lightblueCar,
  redCar,
  greenMan,
  eventMarker,
  eventMarkerRetina,
  eventMarkerShadow,
}