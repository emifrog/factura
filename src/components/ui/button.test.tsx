import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("rend le libellé et le type button par défaut", () => {
    render(<Button>Émettre</Button>);
    const btn = screen.getByRole("button", { name: "Émettre" });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("type", "button");
  });

  it("applique les classes de la variante success", () => {
    render(<Button variant="success">Payer</Button>);
    expect(screen.getByRole("button", { name: "Payer" })).toHaveClass(
      "bg-success",
    );
  });
});
