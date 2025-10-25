import { Checkbox } from "radix-ui";
import { CheckIcon } from "@radix-ui/react-icons";
import { useEffect, useReducer, useRef } from "react";
import { useI18n } from "@/i18n/I18nProvider";

const MAX = { passenger: 10, driver: 10 };

type State = { pssgnr: number; driver: number };
type Act =
  | { type: "togglePassenger"; checked: boolean }
  | { type: "toggleDriver"; checked: boolean }
  | { type: "setPassenger"; value: number }
  | { type: "setDriver"; value: number };

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

// Single source of truth for the invariant: at least one role > 0.
// Preference: if both would be 0, set driver=3 (fallback) or passenger=1 depending on context.
function reducer(s: State, act: Act): State {
  switch (act.type) {
    case "togglePassenger": {
      const pssgnr = act.checked ? Math.max(1, s.pssgnr) : 0;
      const driver = pssgnr === 0 && s.driver === 0 ? 3 : s.driver;
      return { pssgnr, driver };
    }
    case "toggleDriver": {
      const driver = act.checked ? Math.max(1, s.driver || 3) : 0;
      const pssgnr = s.pssgnr === 0 && driver === 0 ? 1 : s.pssgnr;
      return { pssgnr, driver };
    }
    case "setPassenger": {
      const pssgnr = clamp(act.value, 0, MAX.passenger);
      const driver = pssgnr === 0 && s.driver === 0 ? 3 : s.driver;
      return { pssgnr, driver };
    }
    case "setDriver": {
      const driver = clamp(act.value, 0, MAX.driver);
      const pssgnr = s.pssgnr === 0 && driver === 0 ? 1 : s.pssgnr;
      return { pssgnr, driver };
    }
  }
}

export default function OfferRoles() {
  const [state, dispatch] = useReducer(reducer, { pssgnr: 1, driver: 0 });
  const { pssgnr, driver } = state;
  const { t } = useI18n();

  const passengerRef = useRef<HTMLInputElement>(null);
  const driverRef = useRef<HTMLInputElement>(null);
  const prev = useRef(state);

  // Focus when rising 0 -> >0 for either field
  useEffect(() => {
    if (prev.current.pssgnr === 0 && pssgnr > 0) passengerRef.current?.focus();
    if (prev.current.driver === 0 && driver > 0) driverRef.current?.focus();
    prev.current = state;
  }, [state, pssgnr, driver]);

  const passengerChecked = pssgnr > 0;
  const driverChecked = driver > 0;

  return (
    <div className="flex flex-col mb-4">
      <p>{t("offerRoles.prompt")}</p>

      <div className="flex flex-row gap-4 mb-1">
        <div className="w-32 flex items-center gap-2">
          <Checkbox.Root
            id="pasngr_chk"
            checked={passengerChecked}
            onCheckedChange={(c) => dispatch({ type: "togglePassenger", checked: c === true })}
          >
            <Checkbox.Indicator>{passengerChecked && <CheckIcon className="text-lg" />}</Checkbox.Indicator>
          </Checkbox.Root>
          <label htmlFor="pasngr_chk">{t("offerRoles.passenger")}</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={passengerRef}
            type="number"
            id="pasngr_seats"
            name="pasngr_seats"
            className="input inline-block text-center w-16 read-only:text-gray-600 read-only:bg-gray-300"
            readOnly={!passengerChecked}
            value={pssgnr}
            min={0}
            max={MAX.passenger}
            onChange={(e) => dispatch({ type: "setPassenger", value: Number(e.target.value || 0) })}
            inputMode="numeric"
            required
          />
          <label htmlFor="pasngr_seats">{t("offerRoles.passengerSeats")}</label>
        </div>
      </div>

      <div className="flex flex-row gap-4 mb-1">
        <div className="w-32 flex items-center gap-2">
          <Checkbox.Root
            id="driver_chk"
            checked={driverChecked}
            onCheckedChange={(c) => dispatch({ type: "toggleDriver", checked: c === true })}
          >
            <Checkbox.Indicator>{driverChecked && <CheckIcon className="text-lg" />}</Checkbox.Indicator>
          </Checkbox.Root>
          <label htmlFor="driver_chk">{t("offerRoles.driver")}</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={driverRef}
            type="number"
            id="driver_seats"
            name="driver_seats"
            className="input inline-block text-center w-16 read-only:text-gray-600 read-only:bg-gray-300"
            readOnly={!driverChecked}
            value={driver}
            min={0}
            max={MAX.driver}
            onChange={(e) => dispatch({ type: "setDriver", value: Number(e.target.value || 0) })}
            inputMode="numeric"
            required
          />
          <label htmlFor="driver_seats">{t("offerRoles.driverSeats")}</label>
        </div>
      </div>
    </div>
  );
}
