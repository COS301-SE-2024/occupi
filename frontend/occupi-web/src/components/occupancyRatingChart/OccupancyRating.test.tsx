import { expect, test, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import OccupancyRating from "./OccupancyRating";
import React from "react";

// Define a type for the children prop
type ChildrenProp = {
  children?: React.ReactNode;
};

// Mock recharts components
mock.module("recharts", () => ({
  PieChart: ({ children }: ChildrenProp) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: ChildrenProp) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: ChildrenProp) => <div data-testid="responsive-container">{children}</div>,
}));

test("OccupancyRating renders correctly", () => {
  render(<OccupancyRating />);

  // Check if the title is rendered
  const title = screen.getByText("Occupancy Rating");
  expect(title).toBeDefined();
  expect(title.tagName).toBe("H3");
  expect(title.className).toInclude("text-lg font-semibold mb-2");

  // Check if the chart components are rendered
  expect(screen.getByTestId("responsive-container")).toBeDefined();
  expect(screen.getByTestId("pie-chart")).toBeDefined();
  expect(screen.getByTestId("pie")).toBeDefined();
  expect(screen.getAllByTestId("cell").length).toBe(2); // Two cells for two data points
  expect(screen.getByTestId("tooltip")).toBeDefined();
  expect(screen.getByTestId("legend")).toBeDefined();
});


test("OccupancyRating renders correct number of cells", () => {
//   render(<OccupancyRating />);

  const cells = screen.getAllByTestId("cell");
  expect(cells.length).toBe(2); // Two cells for two data points
});

