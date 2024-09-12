import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import OverviewComponent from "./OverviewComponent";

// Mocking the useCentrifugeCounter hook from the CentrifugoService
jest.mock("CentrifugoService", () => ({
  useCentrifugeCounter: () => 150, // Provide a mock return value
}));

describe("OverviewComponent Tests", () => {
  beforeEach(() => {
    // Any setup steps before each test, if needed
  });

  test("renders the header component", () => {
    render(<OverviewComponent />);
    // Assuming Header component has a role like "banner" or specific text to check
    expect(screen.getByRole("banner")).toBeTruthy(); // Adjust based on actual implementation
  });

  test("renders greeting and welcome messages", () => {
    render(<OverviewComponent />);
    // Check if the welcome message is present
    expect(screen.getByText("Welcome to Occupi")).toBeTruthy();
  });

  test("renders Line Chart in GraphContainer", () => {
    render(<OverviewComponent />);
    // Assuming there's identifiable text or role in Line_Chart
    expect(screen.getByText(/line chart/i)).toBeTruthy(); // Modify based on actual Line_Chart content
  });

  test("renders Bar Graph in GraphContainer", () => {
    render(<OverviewComponent />);
    // Assuming there's identifiable text or role in BarGraph
    expect(screen.getByText(/bar graph/i)).toBeTruthy(); // Modify based on actual BarGraph content
  });

  test("renders StatCard components with correct information", () => {
    render(<OverviewComponent />);
    // Check for presence of StatCard elements
    expect(screen.getByText("Total bookings today")).toBeTruthy();
    expect(screen.getByText("143 people")).toBeTruthy();
    expect(screen.getByText("Up from yesterday")).toBeTruthy();

    expect(screen.getByText("Total visitations today")).toBeTruthy();
    expect(screen.getByText("150 people")).toBeTruthy(); // Value based on mocked counter
    expect(screen.getByText("Down from yesterday")).toBeTruthy();
  });

  test("renders images and checks their presence", () => {
    render(<OverviewComponent />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0); // Check that images are rendered
    expect(screen.getByAltText("Calendar")).toBeTruthy();
    expect(screen.getByAltText("Building")).toBeTruthy();
  });

  test("renders section title with icon", () => {
    render(<OverviewComponent />);
    expect(screen.getByText("Most Visitations")).toBeTruthy();
    const chevronIcon = screen.getByRole("img", { name: /chevron/i }); // Assuming ChevronRight renders as an image
    expect(chevronIcon).toBeTruthy();
  });
});
