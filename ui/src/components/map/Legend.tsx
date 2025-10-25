import { greenMan, lightblueCar, redCar, eventMarker } from "./markerIcons";
// get standard leaflet marker icons
import marker from "leaflet/dist/images/marker-icon.png";
import { useI18n } from "@/i18n/I18nProvider";

export function Legend({ mode = "view" }: { mode?: "view" | "edit" }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-row flex-wrap gap-x-10 gap-y-1 my-3 items-center justify-center sm:text-nowrap">
      <div className="flex flex-col items-center sm:flex-row sm:gap-2">
        <img src={greenMan} className="inline-block" width="15" />
        <span className="text-center">{t("legend.passenger")}</span>
      </div>
      <div className="flex flex-col items-center sm:flex-row sm:gap-2">
        <img src={redCar} className="inline-block" width="40" />
        <span className="text-center">{t("legend.driver")}</span>
      </div>
      <div className="flex flex-col items-center sm:flex-row sm:gap-2">
        <img src={lightblueCar} className="inline-block" width="40" />
        <span className="text-center">{t("legend.both")}</span>
      </div>
      {mode === "edit" && (
        <>
          <div className="flex flex-col items-center sm:flex-row sm:gap-2">
            <img src={eventMarker} className="inline-block" width="20" />
            <span className="text-center">{t("legend.event")}</span>
          </div>
          <div className="flex flex-col items-center sm:flex-row sm:gap-2">
            <img src={marker} className="inline-block" width="20" />
            <span className="text-center">{t("legend.origin")}</span>
          </div>
        </>
      )}
    </div>
  );
}
