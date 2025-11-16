import { render, waitFor, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import EventDetailBody from "@/components/EventDetailBody";
import type { EventDetail, Offer } from "@/types/types";
import type { ReactNode } from "react";
import type L from "leaflet";

type EventMapMockProps = {
  onBoundsChange: (bounds: L.LatLngBounds) => void;
  onOfferPopupClose?: (offerId: number) => void;
} & Record<string, unknown>;

const state = vi.hoisted(() => ({
  partitionMock: vi.fn(),
  focusOfferMock: vi.fn(),
  offersGridCalls: [] as Array<{ title: string; offers: Offer[]; dim?: boolean }>,
  latestMapProps: null as EventMapMockProps | null,
  navigateMock: vi.fn(),
}));

vi.mock("leaflet", () => {
  const latLng = (lat: number, lng: number) => ({ lat, lng });
  return { __esModule: true, default: { latLng }, latLng };
});

vi.mock("@/hooks/usePartitionOffersByBounds", () => ({
  usePartitionOffersByBounds: state.partitionMock,
}));

vi.mock("@/components/EventCard", () => ({
  __esModule: true,
  default: ({ e }: { e: EventDetail }) => <div data-testid="event-card">{e.name}</div>,
}));

vi.mock("@/components/map/EventMap", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { forwardRef, useImperativeHandle } = require("react") as typeof import("react");
  const MockEventMap = forwardRef<unknown, EventMapMockProps>((props, ref) => {
    state.latestMapProps = props as EventMapMockProps;
    useImperativeHandle(ref, () => ({
      focusOffer: state.focusOfferMock,
      centerOn: vi.fn(),
      locate: vi.fn(),
    }));
    return <div data-testid="event-map" />;
  });
  return { __esModule: true, default: MockEventMap };
});

vi.mock("@/components/map/OffersGrid", () => ({
  OffersGrid: (props: { title: string; offers: Offer[]; dim?: boolean }) => {
    state.offersGridCalls.push(props);
    return (
      <div data-testid={`grid-${props.title}`} data-dimmed={props.dim ? "true" : "false"}>
        {props.offers.map((o) => (
          <span key={o.id}>{o.name}</span>
        ))}
      </div>
    );
  },
}));

vi.mock("@/components/map/Legend", () => ({
  Legend: () => <div data-testid="legend" />,
}));

vi.mock("react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a data-testid="router-link" href={typeof to === "string" ? to : "#"}>
      {children}
    </a>
  ),
  useNavigate: () => state.navigateMock,
}));

function makeOffer(overrides: Partial<Offer> = {}): Offer {
  return {
    id: overrides.id ?? Math.floor(Math.random() * 10_000),
    eventHash: overrides.eventHash ?? "event_hash",
    name: overrides.name ?? "Offre",
    address: overrides.address ?? "1 rue des Lilas",
    lat: overrides.lat ?? 48.85,
    lng: overrides.lng ?? 2.35,
    notes: overrides.notes ?? null,
    phone: overrides.phone ?? null,
    email: overrides.email ?? null,
    email_is_public: overrides.email_is_public ?? true,
    driver_seats: overrides.driver_seats ?? 1,
    pasngr_seats: overrides.pasngr_seats ?? 0,
    token_hash: overrides.token_hash ?? null,
    token_expires_at: overrides.token_expires_at ?? null,
    created_at: overrides.created_at ?? "2025-01-01T00:00:00Z",
    updated_at: overrides.updated_at ?? "2025-01-01T00:00:00Z",
  };
}

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
    offers: overrides.offers ?? [makeOffer({ id: 1, name: "Offre 1" })],
  };
}

const originalRAF = globalThis.requestAnimationFrame;

describe("EventDetailBody", () => {
  beforeEach(() => {
    state.partitionMock.mockReset();
    state.focusOfferMock.mockReset();
    state.offersGridCalls.length = 0;
    state.latestMapProps = null;
    state.navigateMock.mockReset();
    globalThis.requestAnimationFrame = (cb: FrameRequestCallback): number => {
      cb(0);
      return 0;
    };
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRAF;
  });

  it("focuses the selected offer on the map when an offerId is provided", async () => {
    const event = makeEvent({
      offers: [
        makeOffer({ id: 42, name: "Offre ciblée", lat: 45.76, lng: 4.84 }),
        makeOffer({ id: 99, name: "Autre offre" }),
      ],
    });

    state.partitionMock.mockReturnValue({ inBounds: event.offers, outOfBounds: [] });

    render(<EventDetailBody event={event} offerId={42} />);

    await waitFor(() => {
      expect(state.focusOfferMock).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ openPopup: true })
      );
    });
  });

  it("re-partitions offers when map bounds change", () => {
    const offers = [
      makeOffer({ id: 1, name: "Carte A" }),
      makeOffer({ id: 2, name: "Carte B" }),
      makeOffer({ id: 3, name: "Hors cadre" }),
    ];
    const event = makeEvent({ offers });
    const fakeBounds = { id: "bounds" } as unknown as L.LatLngBounds;

    state.partitionMock.mockImplementation((allOffers: Offer[] = [], bounds) => {
      if (bounds === fakeBounds) {
        return { inBounds: allOffers.slice(0, 2), outOfBounds: allOffers.slice(2) };
      }
      return { inBounds: [], outOfBounds: allOffers };
    });

    render(<EventDetailBody event={event} offerId={null} />);

    expect(state.latestMapProps).toBeTruthy();
    const latestProps = state.latestMapProps;
    if (!latestProps) {
      throw new Error("Expected EventMap mock props to be captured");
    }
    act(() => {
      latestProps.onBoundsChange(fakeBounds);
    });

    const inBoundsCall = state.offersGridCalls
      .filter((c) => c.title === "Sur la carte")
      .at(-1);
    const outCall = state.offersGridCalls
      .filter((c) => c.title === "Autres offres (hors cadre)")
      .at(-1);

    expect(inBoundsCall).toMatchObject({
      title: "Sur la carte",
      offers: offers.slice(0, 2),
    });
    expect(outCall).toMatchObject({
      title: "Autres offres (hors cadre)",
      offers: offers.slice(2),
      dim: true,
    });
  });

  it("navigates back to the base event URL when the selected offer popup closes", () => {
    const event = makeEvent({
      hashId: "event_123",
      offers: [
        makeOffer({ id: 10, name: "Offre ciblée" }),
        makeOffer({ id: 20, name: "Autre" }),
      ],
    });

    state.partitionMock.mockReturnValue({ inBounds: event.offers, outOfBounds: [] });

    render(<EventDetailBody event={event} offerId={10} />);

    expect(state.latestMapProps?.onOfferPopupClose).toBeTruthy();
    state.latestMapProps?.onOfferPopupClose?.(10);

    expect(state.navigateMock).toHaveBeenCalledWith("/events/event_123", { replace: true });

    state.navigateMock.mockClear();
    state.latestMapProps?.onOfferPopupClose?.(20);
    expect(state.navigateMock).not.toHaveBeenCalled();
  });
});
