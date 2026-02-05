import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders the main heading", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /mcp registry/i, level: 1 })
    ).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<HomePage />);

    expect(
      screen.getByText(/discover, share, and manage/i)
    ).toBeInTheDocument();
  });

  it("renders call-to-action buttons", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("link", { name: /browse registry/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /documentation/i })
    ).toBeInTheDocument();
  });

  it("renders feature cards", () => {
    render(<HomePage />);

    expect(screen.getByText("Discover")).toBeInTheDocument();
    expect(screen.getByText("Share")).toBeInTheDocument();
    expect(screen.getByText("Integrate")).toBeInTheDocument();
  });
});
