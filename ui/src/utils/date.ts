import type { EventDetail, EventSummary } from "@/types/types";

type EventLike = Pick<EventSummary, "start_date" | "days"> | Pick<EventDetail, "start_date" | "days">;

export function eventEndIso(event: EventLike): string {
  const start = new Date(event.start_date);
  const days = Math.max(1, Number(event.days ?? 1));
  const end = new Date(start);
  end.setDate(start.getDate() + days - 1);
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}
