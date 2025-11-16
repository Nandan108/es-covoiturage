import { redirect } from "react-router";

export function redirectToAdminLogin(request: Request, fallback = "/admin/events") {
  try {
    const url = new URL(request.url);
    const target = url.pathname + url.search;
    return redirect(`/admin/login?from=${encodeURIComponent(target || fallback)}`);
  } catch {
    return redirect(`/admin/login?from=${encodeURIComponent(fallback)}`);
  }
}
