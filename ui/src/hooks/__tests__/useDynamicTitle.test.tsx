import { render } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useDynamicTitle } from "@/hooks/useDynamicTitle";

type Match = {
  handle?: { title?: string | ((match: Match) => string | null) };
  params?: Record<string, string>;
};

const matchesRef = vi.hoisted(() => ({
  value: [] as Match[],
}));

vi.mock("react-router", () => ({
  useMatches: () => matchesRef.value,
}));

function TestComponent({ base }: { base: string }) {
  useDynamicTitle(base);
  return null;
}

describe("useDynamicTitle", () => {
  beforeEach(() => {
    matchesRef.value = [];
    document.title = "";
  });

  it("falls back to the base title when no matches provide titles", () => {
    render(<TestComponent base="Éveil" />);
    expect(document.title).toBe("Éveil");
  });

  it("combines dynamic titles from route handles", () => {
    matchesRef.value = [
      { handle: { title: "Événements" } },
      {
        handle: {
          title: (match: Match) => (match.params?.id ? `Détail ${match.params.id}` : null),
        },
        params: { id: "abc123" },
      },
    ];

    const { rerender } = render(<TestComponent base="Éveil" />);
    expect(document.title).toBe("Détail abc123 | Événements | Éveil");

    matchesRef.value = [{ handle: { title: "Accueil" } }];
    rerender(<TestComponent base="Éveil" />);
    expect(document.title).toBe("Accueil | Éveil");
  });
});
