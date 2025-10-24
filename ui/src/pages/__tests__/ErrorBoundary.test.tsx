import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import ErrorBoundary from "@/pages/ErrorBoundary";

const routeErrorRef = vi.hoisted(() => ({
  value: new Error("default"),
}));

vi.mock("react-router", () => ({
  useRouteError: () => routeErrorRef.value,
  isRouteErrorResponse: (error: unknown): error is { status: number; data?: unknown } =>
    typeof (error as any)?.status === "number",
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
    routeErrorRef.value = { status: 404, data: "Introuvable" } as any;

    render(<ErrorBoundary />);

    expect(screen.getByText("Erreur 404")).toBeInTheDocument();
    expect(screen.getByText("Introuvable")).toBeInTheDocument();
  });
});
