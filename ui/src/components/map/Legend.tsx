import { greenMan, lightblueCar, redCar, eventMarker } from "./markerIcons";
// get standard leaflet marker icons
import marker from "leaflet/dist/images/marker-icon.png";

export function Legend({ mode = "view" }: { mode?: "view" | "edit" }) {
  return (
    <div className="flex flex-row flex-wrap gap-x-10 gap-y-1 my-3 items-center justify-center sm:text-nowrap">
      <div className="flex flex-col items-center sm:flex-row sm:gap-2">
        <img src={greenMan} className="inline-block" width="15" />
        <span className="text-center">Passager</span>
      </div>
      <div className="flex flex-col items-center sm:flex-row sm:gap-2">
        <img src={redCar} className="inline-block" width="40" />
        <span className="text-center">Conducteur</span>
      </div>
      <div className="flex flex-col items-center sm:flex-row sm:gap-2">
        <img src={lightblueCar} className="inline-block" width="40" />
        <span className="text-center">Conducteur ou&nbsp;Passager</span>
      </div>
      {mode === "edit" && (
        <>
          <div className="flex flex-col items-center sm:flex-row sm:gap-2">
            <img src={eventMarker} className="inline-block" width="20" />
            <span className="text-center">Lieu de la rencontre</span>
          </div>
          <div className="flex flex-col items-center sm:flex-row sm:gap-2">
            <img src={marker} className="inline-block" width="20" />
            <span className="text-center">Votre point de départ</span>
          </div>
        </>
      )}
    </div>
  );
}
