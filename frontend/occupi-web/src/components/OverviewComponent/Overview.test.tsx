import { describe, expect, test } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import OverviewComponent from "./OverviewComponent";

describe("OverviewComponent Tests", () => {
  test("renders greeting and welcome messages", () => {
    render(<OverviewComponent />);
    expect(screen.getByText("Hi Tina 👋")).toBeTruthy(); // Checks if the greeting text is rendered
    expect(screen.getByText("Welcome to Occupi")).toBeTruthy(); // Checks if the welcome message is rendered
  });

//   test("renders buttons and checks hover effects", () => {
//     render(<OverviewComponent />);
//     const button = screen.getByText("See more"); // Assuming 'See more' button is visible
//     expect(button).toBeTruthy();

//     // Check initial style or class
//     // expect(button).toHaveClass("bg-primary_alt");

//     // Simulate hover
//     fireEvent.mouseOver(button);
//     // Check style changes or class changes if any on hover
//     // Note: This requires your testing environment to support style/class computation which might not be straightforward in Jest or similar environments without additional setup
//   });

  test("renders images and checks their presence", () => {
    render(<OverviewComponent />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0); // Checks if there are any images rendered
  });
});