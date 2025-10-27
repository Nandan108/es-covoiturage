import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from "vitest";
import OfferForm from "@/components/OfferForm";
import type { EventDetail } from "@/types/types";
import type { ReactNode } from "react";

type LatLngPoint = {
  lat: number;
  lng: number;
};

type EventMapMockProps = {
  setLocation?: (point: LatLngPoint) => void;
} & Record<string, unknown>;

const navigationState = vi.hoisted(() => ({ state: "idle" }));
const fetcherState = vi.hoisted(() => ({ state: "idle" }));
const mapState = vi.hoisted(() => {
  let latestProps: EventMapMockProps | null = null;
  const centerOn = vi.fn();
  const locate = vi.fn();
  return {
    get latestProps() {
      return latestProps;
    },
    setLatestProps(props: EventMapMockProps) {
      latestProps = props;
    },
    reset() {
      latestProps = null;
      centerOn.mockReset();
      locate.mockReset();
    },
    centerOn,
    locate,
  };
});

const originalResizeObserver = globalThis.ResizeObserver;

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterAll(() => {
  globalThis.ResizeObserver = originalResizeObserver;
});

// Stub Leaflet utilities so OfferForm can create lat/lng objects without loading the real library.
vi.mock("leaflet", () => {
  const latLng = (lat: number, lng: number) => ({ lat, lng });
  return { __esModule: true, default: { latLng }, latLng };
});

// Replace the full EventCard layout with a minimal div that tests assert against via data-testid.
vi.mock("@/components/EventCard", () => ({
  __esModule: true,
  default: ({ e }: { e: EventDetail }) => <div data-testid="event-card">{e.name}</div>,
}));

// Legend renders SVG/icon assets; here we just expose a sentinel element so layout assertions keep working.
vi.mock("@/components/map/Legend", () => ({
  Legend: () => <div data-testid="legend" />,
}));

// Swap the autocomplete widget for a button that immediately calls onSelectLocation, letting the test control the map.
vi.mock("@/components/locationSearch", () => ({
  __esModule: true,
  default: ({ onSelectLocation }: { onSelectLocation: (lat: number, lng: number) => void }) => (
    <button
      type="button"
      data-testid="location-search"
      onClick={() => onSelectLocation(46.1, 3.2)}
    >
      Choisir un lieu
    </button>
  ),
}));

// Tests hit a lazy-loaded <EventMap /> wrapped in Suspense. The lazy boundary resolves on
// a microtask, so without this helper we'd see the usual "wrap updates in act" warning.
// Flushing one microtask inside act() lets assertions observe the ready tree without noise.
const flushSuspense = () => act(async () => { await Promise.resolve(); });

// Intercept the lazy EventMap component so we can capture its props/ref and avoid loading Leaflet in tests.
vi.mock("@/components/map/EventMap", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { forwardRef, useImperativeHandle } = require("react") as typeof import("react");
  const MockEventMap = forwardRef<unknown, EventMapMockProps>((props, ref) => {
    mapState.setLatestProps(props);
    useImperativeHandle(ref, () => ({
      focusOffer: vi.fn(),
      centerOn: vi.fn(),
      locate: vi.fn(),
    }));
    return <div data-testid="event-map" />;
  });
  return { __esModule: true, default: MockEventMap };
});

// Mock react-router hooks/components that OfferForm consumes so tests can drive navigation/fetcher state.
vi.mock("react-router", () => {
  return {
    Form: ({ children, ...props }: { children: ReactNode }) => <form {...props}>{children}</form>,
    useFetcher: () => ({
      state: fetcherState.state,
      Form: ({ children, ...props }: { children: ReactNode }) => <form {...props}>{children}</form>,
    }),
    useNavigation: () => ({ state: navigationState.state }),
    Link: ({ children, to }: { children: ReactNode; to: string }) => (
      <a href={typeof to === "string" ? to : "#"}>{children}</a>
    ),
  };
});

function makeEvent(overrides: Partial<EventDetail> = {}): EventDetail {
  return {
    hashId: overrides.hashId ?? "event_hash",
    name: overrides.name ?? "Grand rassemblement",
    type: overrides.type ?? "retreat",
    start_date: overrides.start_date ?? "2025-06-10",
    days: overrides.days ?? 3,
    original_event_id: overrides.original_event_id ?? 1,
    loc_name: overrides.loc_name ?? "Lyon",
    loc_address: overrides.loc_address ?? "10 place Bellecour",
    loc_lat: overrides.loc_lat ?? 45.757,
    loc_lng: overrides.loc_lng ?? 4.835,
    loc_original_link: overrides.loc_original_link ?? "https://maps.example.com",
    image_url: overrides.image_url ?? "/images/events/sample.jpg",
    created_at: overrides.created_at ?? "2025-01-01T00:00:00Z",
    updated_at: overrides.updated_at ?? "2025-01-01T00:00:00Z",
    offers: overrides.offers ?? [],
  };
}

describe("OfferForm", () => {
  beforeEach(() => {
    navigationState.state = "idle";
    fetcherState.state = "idle";
    mapState.reset();
  });

  it("marks essential fields as required", async () => {
    render(<OfferForm event={makeEvent()} />);
    await flushSuspense();

    expect(screen.getByLabelText("Nom")).toBeRequired();
    expect(screen.getByLabelText("Email")).toBeRequired();
  });

  it("updates lat/lng inputs when a map location is selected", async () => {
    render(<OfferForm event={makeEvent()} />);
    await flushSuspense();

    const props = mapState.latestProps;
    expect(props).toBeTruthy();

    const fakePoint = { lat: 46.1, lng: 3.2 };
    await act(async () => {
      props?.setLocation?.(fakePoint);
    });

    const latInput = document.getElementById("lat") as HTMLInputElement;
    const lngInput = document.getElementById("lng") as HTMLInputElement;
    expect(latInput.value).toBe(fakePoint.lat.toString());
    expect(lngInput.value).toBe(fakePoint.lng.toString());
  });

  it("shows submission progress based on navigation state", async () => {
    navigationState.state = "submitting";
    render(<OfferForm event={makeEvent()} />);
    await flushSuspense();

    const submitButton = screen.getByRole("button", { name: "Création…" });
    expect(submitButton).toBeDisabled();
  });
});
