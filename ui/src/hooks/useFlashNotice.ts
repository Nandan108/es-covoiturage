import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useNotifications } from "@/components/notifications/NotificationProvider";
import { useI18n } from "@/i18n/I18nProvider";

const noticeMessages = {
  offer_created: "notifications.offerCreated",
  offer_updated: "notifications.offerUpdated",
  offer_deleted: "notifications.offerDeleted",
  admin_event_created: "notifications.eventCreated",
  admin_event_updated: "notifications.eventUpdated",
  admin_event_deleted: "notifications.eventDeleted",
} as const;

type NoticeKey = keyof typeof noticeMessages;

export function useFlashNotice() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const { t } = useI18n();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("notice") as NoticeKey | null;
    if (!code) {
      return;
    }

    const translationKey = noticeMessages[code];
    if (translationKey) {
      notify(t(translationKey));
    }

    params.delete("notice");
    const search = params.toString();
    const nextUrl = search ? `${location.pathname}?${search}` : location.pathname;
    navigate(nextUrl + (location.hash ?? ""), { replace: true });
  }, [location, navigate, notify, t]);
}
