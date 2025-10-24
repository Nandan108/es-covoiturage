import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import EventsList from "@/components/EventsList";
import type { EventSummary } from "@/types/types";

const mockEventCard = vi.fn(
  ({ e }: { e: EventSummary; className?: string }) => <li data-testid="event-card">{e.name}</li>
);

vi.mock("@/components/EventCard", () => ({
  __esModule: true,
  default: (props: { e: EventSummary; className?: string }) => {
    mockEventCard(props);
    return <li data-testid="event-card">{props.e.name}</li>;
  },
}));

function makeEvent(overrides: Partial<EventSummary> = {}): EventSummary {
  return {
    hashId: overrides.hashId ?? `event_${Math.random().toString(16).slice(2)}`,
    name: overrides.name ?? "Retraite estivale",
    type: overrides.type ?? "retreat",
    start_date: overrides.start_date ?? "2025-06-01",
    days: overrides.days ?? 3,
    original_event_id: overrides.original_event_id ?? 1,
    loc_name: overrides.loc_name ?? "Paris",
    loc_address: overrides.loc_address ?? "123 rue Principale",
    loc_lat: overrides.loc_lat ?? 48.8566,
    loc_lng: overrides.loc_lng ?? 2.3522,
    loc_original_link: overrides.loc_original_link ?? "https://maps.example.com",
    image_url: overrides.image_url ?? "/images/events/sample.jpg",
    offers_count: overrides.offers_count,
    created_at: overrides.created_at ?? "2025-01-01T00:00:00Z",
    updated_at: overrides.updated_at ?? "2025-01-02T00:00:00Z",
  };
}

describe("EventsList", () => {
  beforeEach(() => {
    mockEventCard.mockClear();
  });

  it("renders a friendly fallback when there are no events", () => {
    render(<EventsList events={[]} />);
    expect(screen.getByText("No events found")).toBeInTheDocument();
    expect(mockEventCard).not.toHaveBeenCalled();
  });

  it("groups events by year and orders them chronologically", () => {
    const events = [
      makeEvent({
        hashId: "evt-2024-a",
        name: "Rencontre de février",
        start_date: "2024-02-10",
      }),
      makeEvent({
        hashId: "evt-2025-a",
        name: "Stage de janvier",
        start_date: "2025-01-15",
      }),
      makeEvent({
        hashId: "evt-2024-b",
        name: "Retraite de mars",
        start_date: "2024-03-02",
      }),
    ];

    render(<EventsList events={events} />);

    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.map((h) => h.textContent)).toEqual(["2024", "2025"]);

    expect(mockEventCard).toHaveBeenCalledTimes(events.length);
    const renderedOrder = mockEventCard.mock.calls.map(([props]) => (props as any).e.name);
    expect(renderedOrder).toEqual([
      "Rencontre de février",
      "Retraite de mars",
      "Stage de janvier",
    ]);
  });
});
