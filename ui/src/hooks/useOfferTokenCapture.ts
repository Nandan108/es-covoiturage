import { useEffect } from "react";
import { useSearchParams } from "react-router";
import type { EventDetail } from "@/types/types";
import { rememberOfferToken } from "@/utils/offerTokens";
import { eventEndIso } from "@/utils/date";

export function useOfferTokenCapture(event: EventDetail, offerId: number | null) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!offerId) return;
    const token = searchParams.get("token");
    if (!token) return;

    rememberOfferToken(offerId, token, eventEndIso(event));

    const next = new URLSearchParams(searchParams);
    next.delete("token");
    setSearchParams(next, { replace: true });
  }, [event, offerId, searchParams, setSearchParams]);
}
