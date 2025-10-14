import { Link, useRouteLoaderData } from "react-router";
import type { EventDetail, Offer } from "@/types/types";

// icons
import { MdOutlineLocationSearching } from "react-icons/md";
import { ImBubble2 } from "react-icons/im";
import { FaRegEdit } from "react-icons/fa";


function OfferCard({ offer: o }: { offer: Offer }) {
  const event = useRouteLoaderData("event-detail") as EventDetail;

  return (
    <div className="relative rounded-lg bg-white p-2 shadow-lg" key={o.id}>
      <div className="flex flex-row border-b-1 border-gray-200 gap-3 py-1 pr-1">
        <div className="flex-grow">{o.name}</div>
        {o.notes && (
          <div className="group flex text-slate-600 border-slate-200">
            <ImBubble2 className="fa-regular fa-comment text-red-700" />
            <span
              className="absolute left-1/2 -translate-x-1/2 z-10 w-4/5
                opacity-0 group-hover:opacity-100 transition-opacity
                bg-gray-800 text-xs text-gray-100 rounded-md m-4 px-2 py-2 mx-auto"
            >
              <div className="mb-2 font-bold text-center pb-2 border-b border-gray-500">
                Notes / précisions
              </div>
              {o.notes}
            </span>
          </div>
        )}
        <Link to={`/events/${event.hashId}/offers/${o.id}`} className="block cursor-pointer">
          <MdOutlineLocationSearching
            className="fa-solid fa-magnifying-glass cursor-pointer"
          />
        </Link>
        <Link to={`/events/${event.hashId}/offers/${o.id}/edit`} className="block cursor-pointer">
          <FaRegEdit />
        </Link>
      </div>
      <div className="text-xs text-slate-600 leading-5 relative">
        {o.pasngr_seats ? (
          <div>
            <b>Passager</b> ({o.pasngr_seats} place souhaitée)
          </div>
        ) : (
          ""
        )}
        {o.driver_seats ? (
          <div>
            <b>Conducteur</b> ({o.driver_seats} place disponible(s))
          </div>
        ) : (
          ""
        )}
        <div>{o.address}</div>
        {o.email_is_public ? (
          <div>
            <b>Courriel:</b> {o.email}
          </div>
        ) : (
          ""
        )}
        <div className="flex-grow">
          <b>Tél:</b> {o.phone}
        </div>
      </div>
    </div>
  );
}

export default OfferCard;
