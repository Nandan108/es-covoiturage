import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { OffersGrid } from "@/components/map/OffersGrid";
import type { Offer } from "@/types/types";

const mockOfferCard = vi.fn(({ offer }: { offer: Offer }) => (
  <div data-testid="offer-card">{offer.name}</div>
));

vi.mock("@/components/OfferCard", () => ({
  __esModule: true,
  default: (props: { offer: Offer }) => {
    mockOfferCard(props);
    return <div data-testid="offer-card">{props.offer.name}</div>;
  },
}));

function makeOffer(overrides: Partial<Offer> = {}): Offer {
  return {
    id: overrides.id ?? Math.floor(Math.random() * 1000),
    eventHash: overrides.eventHash ?? "event_hash",
    name: overrides.name ?? "Offer name",
    address: overrides.address ?? "1 rue des Lilas",
    lat: overrides.lat ?? 48.85,
    lng: overrides.lng ?? 2.35,
    notes: overrides.notes ?? null,
    phone: overrides.phone ?? null,
    email: overrides.email ?? null,
    email_is_public: overrides.email_is_public ?? true,
    driver_seats: overrides.driver_seats ?? 1,
    pasngr_seats: overrides.pasngr_seats ?? 0,
    created_at: overrides.created_at ?? "2025-01-01T00:00:00Z",
    updated_at: overrides.updated_at ?? "2025-01-01T00:00:00Z",
  };
}

describe("OffersGrid", () => {
  beforeEach(() => {
    mockOfferCard.mockClear();
  });

  it("renders a list of offer cards underneath the provided title", () => {
    const offers = [makeOffer({ name: "Alice" }), makeOffer({ name: "Bob" })];
    render(<OffersGrid title="Sur la carte" offers={offers} />);

    expect(screen.getByText("Sur la carte")).toBeInTheDocument();
    const cards = screen.getAllByTestId("offer-card");
    expect(cards.map((c) => c.textContent)).toEqual(["Alice", "Bob"]);
    expect(mockOfferCard).toHaveBeenCalledTimes(offers.length);
  });

  it("applies a dimming style when requested", () => {
    const offers = [makeOffer()];
    render(<OffersGrid title="Hors cadre" offers={offers} dim />);

    const grid = screen.getByTestId("offer-card").parentElement;
    expect(grid?.className).toContain("opacity-60");
  });
});
