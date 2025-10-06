import { useLoaderData } from "react-router";
import EventCard from "../components/EventCard";
import type { EventSummary } from "../types/types";

export default function EventsList() {
  const eventList = useLoaderData() as EventSummary[];

  // organize events by year ASC, sorted date ASC (upcoming first)
  const evtByYear = Object.entries(
    eventList.reduce((acc, e) => {
      const year = new Date(e.start_date).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(e);
      return acc;
    }, {} as Record<number, typeof eventList>)
  )
    .map(([year, evts]) => ({
      year: parseInt(year),
      events: evts.sort((a, b) => a.start_date.localeCompare(b.start_date)),
    }))
    .sort((a, b) => a.year - b.year);

  if (eventList.length === 0) {
    return <div className="p-4">No events found</div>;
  }

  return (
    <div className="w-full m-auto">
      {evtByYear.map(({ year, events }) => (
        <div key={year}>
          <h2 className="text-2xl mb-4 bg-opacity-50 rounded-xl shadow-lg font-bold text-slate-500 bg-slate-100 p-2 text-center">
            {year}
          </h2>
          <ul className="grid grid-cols-1 min-[500px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
            {events.map((e) => (
              <EventCard key={e.hashId} e={e} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
