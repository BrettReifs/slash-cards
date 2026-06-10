import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardVisual } from "../CardVisual";

describe("CardVisual — gallery surface", () => {
  it("renders the SVG with the registry alt text", () => {
    render(<CardVisual visualId="fix" surface="gallery" label="/fix" />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/robot/i)
    );
  });

  it("renders the label chip", () => {
    render(<CardVisual visualId="fix" surface="gallery" label="/fix" />);
    expect(screen.getByText("/fix")).toBeInTheDocument();
  });

  it("renders the scrim element", () => {
    const { container } = render(
      <CardVisual visualId="fix" surface="gallery" label="/fix" />
    );
    expect(container.querySelector(".card-visual__scrim")).toBeInTheDocument();
  });

  it("does not render a label chip when label is omitted", () => {
    const { container } = render(<CardVisual visualId="fix" surface="gallery" />);
    expect(container.querySelector(".card-visual__label-chip")).not.toBeInTheDocument();
  });
});

describe("CardVisual — study-front surface", () => {
  it("renders visual with accessible alt text", () => {
    render(<CardVisual visualId="compact" surface="study-front" label="/compact" />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders the label chip on study-front", () => {
    render(<CardVisual visualId="compact" surface="study-front" label="/compact" />);
    expect(screen.getByText("/compact")).toBeInTheDocument();
  });

  it("applies the study-front class", () => {
    const { container } = render(
      <CardVisual visualId="compact" surface="study-front" label="/compact" />
    );
    expect(container.querySelector(".card-visual--study-front")).toBeInTheDocument();
  });
});

describe("CardVisual — overlay surface", () => {
  it("renders without a label chip", () => {
    const { container } = render(<CardVisual visualId="model" surface="overlay" />);
    expect(container.querySelector(".card-visual__label-chip")).not.toBeInTheDocument();
  });

  it("applies the overlay class", () => {
    const { container } = render(<CardVisual visualId="model" surface="overlay" />);
    expect(container.querySelector(".card-visual--overlay")).toBeInTheDocument();
  });

  it("marks the overlay as aria-hidden", () => {
    const { container } = render(<CardVisual visualId="model" surface="overlay" />);
    const wrapper = container.querySelector(".card-visual--overlay");
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
  });
});

describe("CardVisual — unknown visualId", () => {
  it("renders nothing for an unknown visualId", () => {
    const { container } = render(
      <CardVisual visualId="not-a-real-id" surface="gallery" label="test" />
    );
    expect(container.firstChild).toBeNull();
  });
});

describe("CardVisual — accessibility", () => {
  it("alt text for gallery/study-front is concise and meaningful", () => {
    render(<CardVisual visualId="yolo" surface="gallery" label="/yolo" />);
    const img = screen.getByRole("img");
    const label = img.getAttribute("aria-label") ?? "";
    expect(label.length).toBeGreaterThan(10);
    expect(label.length).toBeLessThan(120);
  });

  it("overlay visual is hidden from assistive technology", () => {
    const { container } = render(<CardVisual visualId="diagnose" surface="overlay" />);
    const wrapper = container.querySelector(".card-visual");
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
  });
});

describe("CardVisual — static at launch (no animations)", () => {
  it("SVG has no animate elements in gallery surface", () => {
    const { container } = render(
      <CardVisual visualId="workspace" surface="gallery" label="@workspace" />
    );
    const animateEls = container.querySelectorAll("animate, animateTransform, animateMotion");
    expect(animateEls.length).toBe(0);
  });

  it("SVG has no animate elements in study-front surface", () => {
    const { container } = render(
      <CardVisual visualId="new-scaffold" surface="study-front" label="/new" />
    );
    const animateEls = container.querySelectorAll("animate, animateTransform, animateMotion");
    expect(animateEls.length).toBe(0);
  });
});
