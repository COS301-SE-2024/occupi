import { describe, expect, test, beforeEach } from "bun:test";
import { render, screen } from "@testing-library/react";
import OverviewComponent from "./OverviewComponent";

// Manually mock the `useCentrifugeCounter` function from the `CentrifugoService`
Object.defineProperty(import.meta, "CentrifugoService", {
  value: {
    useCentrifugeCounter: () => 150, // Provide a mock implementation
  },
});

describe("OverviewComponent Tests", () => {
  test("renders greeting and welcome messages", () => {
    render(<OverviewComponent />);
    expect(screen.getByText("Welcome to Occupi")).toBeTruthy();
  });

  test("renders images and checks their presence", () => {
    render(<OverviewComponent />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0); // Ensures at least one image is present
    expect(screen.getByAltText("Calendar")).toBeTruthy(); // Checks specific alt text for images
    expect(screen.getByAltText("Building")).toBeTruthy(); // Checks specific alt text for images
  });

  test("renders Line Chart in GraphContainer", () => {
    render(<OverviewComponent />);
    expect(screen.getByText(/line chart/i)).toBeTruthy(); // Adjust based on actual Line_Chart content
  });

  test("renders Bar Graph in GraphContainer", () => {
    render(<OverviewComponent />);
    expect(screen.getByText(/bar graph/i)).toBeTruthy(); // Adjust based on actual BarGraph content
  });

  test("renders StatCard components with correct information", () => {
    render(<OverviewComponent />);

    // Check StatCard for Total bookings today
    expect(screen.getByText("Total bookings today")).toBeTruthy();
    expect(screen.getByText("143 people")).toBeTruthy();
    expect(screen.getByText("Up from yesterday")).toBeTruthy();

    // Check StatCard for Total visitations today
    expect(screen.getByText("Total visitations today")).toBeTruthy();
    expect(screen.getByText("150 people")).toBeTruthy(); // Matches the mocked counter value
    expect(screen.getByText("Down from yesterday")).toBeTruthy();
  });

  test("renders section title with icon", () => {
    render(<OverviewComponent />);
    expect(screen.getByText("Most Visitations")).toBeTruthy();
    // Assuming ChevronRight renders as an image or can be identified with a role
    const chevronIcon = screen.getByRole("img", { name: /chevron/i });
    expect(chevronIcon).toBeTruthy();
  });
});
