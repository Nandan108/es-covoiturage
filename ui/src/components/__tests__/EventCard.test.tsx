import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import EventCard from "@/components/EventCard";
import { describe, it, expect } from "vitest";

vi.mock("react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a data-testid="router-link" href={typeof to === "string" ? to : "#"}>
      {children}
    </a>
  ),
}));

vi.mock("@/store/api", () => ({
  getImageUrl: (value: string) => {
    if (value == null) return "";
    if (typeof value === "string" && value.startsWith("/")) return value;
    return `/images/${value}`;
  },
}));

const mockEvent = {
  hashId: "event_abc123",
  name: "Retraite de printemps",
  type: "retreat",
  start_date: "2025-03-15",
  days: 3,
  original_event_id: null,
  loc_name: "Nantes",
  loc_address: "123 Rue des Fleurs",
  loc_lat: 1,
  loc_lng: 2,
  loc_original_link: "https://example.com",
  image_id: "img-42",
  image_url: "/images/events/img-42",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
} as const;

describe("EventCard", () => {
  it("renders the event summary and links to the detail page", () => {
    render(<EventCard e={mockEvent} />);

    expect(screen.getByRole("heading", { name: mockEvent.name })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: mockEvent.name })).toHaveAttribute(
      "src",
      mockEvent.image_url
    );
    expect(screen.getByTestId("router-link")).toHaveAttribute(
      "href",
      `/events/${mockEvent.hashId}`
    );
    expect(screen.getByText(mockEvent.loc_name)).toBeInTheDocument();
  });
});
