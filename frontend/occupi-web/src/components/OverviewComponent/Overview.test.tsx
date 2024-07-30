import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import OverviewComponent from "./OverviewComponent";

describe("OverviewComponent Tests", () => {
  test("renders greeting and welcome messages", () => {
    render(<OverviewComponent />);
    expect(screen.getByText("Hi Tina 👋")).toBeTruthy(); // Checks if the greeting text is rendered
    expect(screen.getByText("Welcome to Occupi")).toBeTruthy(); // Checks if the welcome message is rendered
  });



  test("renders images and checks their presence", () => {
    render(<OverviewComponent />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0); // Checks if there are any images rendered
  });



  
});


