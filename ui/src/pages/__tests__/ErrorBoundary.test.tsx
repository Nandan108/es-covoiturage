import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import ErrorBoundary from "@/pages/ErrorBoundary";

type RouterErrorResponse = { status: number; data?: unknown };

const routeErrorRef = vi.hoisted<{ value: unknown }>(() => ({
  value: new Error("default"),
}));

vi.mock("react-router", () => ({
  useRouteError: () => routeErrorRef.value,
  isRouteErrorResponse: (error: unknown): error is RouterErrorResponse =>
    typeof error === "object" &&
    error !== null &&
    typeof (error as { status?: unknown }).status === "number",
}));

vi.mock("@/components/layout/PageHeader", () => ({
  __esModule: true,
  default: () => <header data-testid="page-header" />,
}));

describe("ErrorBoundary page", () => {
  beforeEach(() => {
    routeErrorRef.value = new Error("Route failure");
  });

  it("renders a PageHeader and basic information for generic errors", () => {
    render(<ErrorBoundary error={new Error("Boom")} />);

    expect(screen.getByTestId("page-header")).toBeInTheDocument();
    expect(screen.getByText("Erreur 500")).toBeInTheDocument();
    expect(screen.getByText("Boom")).toBeInTheDocument();
  });

  it("displays router error responses with their status and detail", () => {
    const notFoundError: RouterErrorResponse = { status: 404, data: "Introuvable" };
    routeErrorRef.value = notFoundError;

    render(<ErrorBoundary />);

    expect(screen.getByText("Erreur 404")).toBeInTheDocument();
    expect(screen.getByText("Introuvable")).toBeInTheDocument();
  });
});
