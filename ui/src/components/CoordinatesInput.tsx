import { useEffect, useRef } from "react";
import * as Leaflet from "leaflet";
import { useI18n } from "@/i18n/I18nProvider";

const precision = Math.pow(10, 4);
const formatCoords = (lat: number, lng: number) => {
  return `${Math.round(lat * precision) / precision}, ${Math.round(lng * precision) / precision}`;
};

function latLngToString(latLng: Leaflet.LatLng | null): string {
  if (latLng == null || !Number.isFinite(latLng.lat) || !Number.isFinite(latLng.lng)) {
    return "";
  }
  return formatCoords(latLng.lat, latLng.lng);
}

function stringToLatLng(coords: string): Leaflet.LatLng | null {
  const [latPart, lngPart] = coords.split(",").map((part) => part.trim());
  const lat = Number(latPart);
  const lng = Number(lngPart);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return Leaflet.latLng(lat, lng);
  }
  return null;
}

type Props = {
  setLatLng: (latLng: Leaflet.LatLng) => void;
  latLng: Leaflet.LatLng | null;
  placeholder?: string;
  labelClassName?: string;
  inputClassName?: string;
  inputId?: string;
  latFieldName?: string;
  lngFieldName?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "onFocus" | "onBlur" | "defaultValue">;

export default function CoordinatesInput({
  setLatLng,
  latLng,
  placeholder = "12.345678, 2.345678",
  labelClassName,
  inputClassName,
  inputId = "coordinates-input",
  latFieldName = "loc_lat",
  lngFieldName = "loc_lng",
  ...props
}: Props) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const coords = stringToLatLng(inputRef.current?.value ?? "");
    if (inputRef.current && (coords?.lat !== latLng?.lat || coords?.lng !== latLng?.lng)) {
      inputRef.current.value = latLngToString(latLng);
    }
  }, [latLng]);

  const {
    className: restClassName,
    "aria-describedby": ariaDescribedBy,
    "aria-labelledby": ariaLabelledBy,
    autoComplete,
    style,
    title,
    ...inputProps
  } = props;

  const combinedInputClassName = [
    "w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-slate-500 focus:outline-none",
    inputClassName,
    restClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const combinedLabelClassName = ["block text-sm font-medium text-slate-600", labelClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <label
      className={combinedLabelClassName}
      htmlFor={inputId}
    >
      {t("admin.events.form.locCoordinates")}
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        className={combinedInputClassName}
        defaultValue={latLngToString(latLng)}
        placeholder={placeholder}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const coords = stringToLatLng(e.target.value);
          if (coords && (coords.lat !== latLng?.lat || coords.lng !== latLng?.lng)) {
            setLatLng(coords);
          }
        }}
        onBlur={(e) => {
          e.target.value = latLngToString(latLng);
        }}
        aria-describedby={ariaDescribedBy}
        aria-labelledby={ariaLabelledBy}
        autoComplete={autoComplete}
        style={style}
        title={title}
        {...inputProps}
      />
      <input type="hidden" name={latFieldName} value={latLng?.lat ?? ""} />
      <input type="hidden" name={lngFieldName} value={latLng?.lng ?? ""} />
    </label>
  );
}
