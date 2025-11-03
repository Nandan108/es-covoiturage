import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import LoadingTimer from "../LoadingTimer";

/* eslint-disable react-refresh/only-export-components */

type NotificationType = "success" | "error";

type Notification = {
  id: number;
  message: string;
  description?: string;
  type: NotificationType;
  isVisible: boolean;
  duration: number;
};

type NotificationContextValue = {
  notify: (message: string, type?: NotificationType, opts?: { description?: string; duration?: number }) => void;
};

const NotificationContext = createContext<NotificationContextValue>({
  notify: () => undefined,
});

export const useNotifications = () => useContext(NotificationContext);

// notification timeout is 4 seconds in prod, 15 sec in dev
const NOTIFICATION_TIMEOUT = import.meta.env.DEV ? 15000 : 4000;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notification[]>([]);
  const counter = useRef(0);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const removeNow = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    const timer = timers.current[id];
    if (timer) {
      clearTimeout(timer);
      delete timers.current[id];
    }
  }, []);

  const beginHide = useCallback(
    (id: number) => {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, isVisible: false } : item)));
      setTimeout(() => removeNow(id), 250);
    },
    [removeNow],
  );

  const notify = useCallback(
    (
      message: string,
      type: NotificationType = "success",
      opts?: { description?: string; duration?: number },
    ) => {
      const id = ++counter.current;
      const duration = opts?.duration ?? NOTIFICATION_TIMEOUT;
      setItems((prev) => [
        ...prev,
        { id, message, description: opts?.description, type, isVisible: false, duration },
      ]);
      // The double requestAnimationFrame ensures the toast renders once in
      // its hidden state before animating to visible
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, isVisible: true } : item)),
          );
        });
      });
      timers.current[id] = setTimeout(() => beginHide(id), duration);
    },
    [beginHide],
  );

  const value = useMemo<NotificationContextValue>(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-6 left-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 flex-col items-center gap-3 px-4 py-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300
              ${item.type === "error" ? "bg-red-400/80" : "bg-emerald-600/80"}
              ${item.isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}
          >
            <div className="flex flex-1 flex-col gap-1">
              <span>{item.message}</span>
              {item.description && (
                <span className="text-xs font-semibold text-white/90">{item.description}</span>
              )}
            </div>
            <button
              type="button"
              className="ml-3 inline-flex items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
              onClick={() => beginHide(item.id)}
            >
              <span className="relative block h-8 w-8 cursor-pointer">
                <LoadingTimer
                  duration={item.duration}
                  color={item.type === "error" ? "#fecaca" : "#bbf7d0"}
                  backgroundColor="rgba(255,255,255,0.25)"
                  className="absolute inset-0"
                />
                <span className="absolute inset-0 flex items-center justify-center text-lg">×</span>
              </span>
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
