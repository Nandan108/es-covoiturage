import { useEffect, useRef, useState, type FormEvent } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { useNotifications } from "@/components/notifications/NotificationProvider";

function ContactDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const { notify } = useNotifications();
  const { t } = useI18n();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      }
    } else if (typeof dialog.close === "function") {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setMessage("");
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedMessage || !trimmedName || !trimmedEmail) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, message: trimmedMessage }),
      });
      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }
      notify(t("contactModal.success"), "success");
      onClose();
    } catch (error) {
      console.error(error);
      notify(t("contactModal.error"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      onClose={onClose}
      className="left-1/2 -translate-x-1/2 top-10 backdrop:bg-black/30 backdrop:backdrop-blur-xs shadow-xl w-full max-w-md bg-transparent px-2"
    >
      <div className="border border-slate-200 bg-white rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">{t("contactModal.title")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            {t("action.close")}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-600">
            {t("contactModal.nameLabel")}
            <input
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            {t("contactModal.emailLabel")}
            <input
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            {t("contactModal.messageLabel")}
            <textarea
              required
              rows={5}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-slate-500 focus:outline-none"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={!name.trim() || !email.trim() || !message.trim() || isSubmitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isSubmitting ? t("action.sending") : t("contactModal.submit")}
          </button>
        </form>
      </div>
    </dialog>
  );
}

export default ContactDialog;
