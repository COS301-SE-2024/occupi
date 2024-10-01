// src/AiDashCard.test.tsx
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AiDashCard from "./AiDashCard";
import { FaChartLine } from "react-icons/fa"; // Example icon

describe("AiDashCard", () => {
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    mockOnRemove.mockClear();
  });

  afterEach(() => {
    // Cleanup after each test to ensure a fresh DOM
    cleanup();
  });

  test("renders AiDashCard with correct props", () => {
    render(
      <AiDashCard
        title="Revenue"
        icon={<FaChartLine />}
        stat="10,000"
        trend={5}
        onRemove={mockOnRemove}
      />
    );

    // Check if title is rendered using getByText
    expect(screen.getByText("Revenue")).toBeDefined();

    // Check if the stat is rendered using getByText
    expect(screen.getByText("10,000")).toBeDefined();

    // Check if the trend is rendered correctly with Uptrend using getByText
    expect(screen.getByText("5% Since last month")).toBeDefined();
  });

  test("renders DownTrend when trend is negative", () => {
    render(
      <AiDashCard
        title="Sales"
        icon={<FaChartLine />}
        stat="5,000"
        trend={-3}
        onRemove={mockOnRemove}
      />
    );

    // Check if the stat and trend are rendered correctly using getByText
    expect(screen.getByText("5,000")).toBeDefined();
    expect(screen.getByText("3% Since last month")).toBeDefined();
  });

  test("calls onRemove when remove button is clicked", () => {
    render(
      <AiDashCard
        title="Profit"
        icon={<FaChartLine />}
        stat="15,000"
        trend={10}
        onRemove={mockOnRemove}
      />
    );

    // Simulate clicking the remove button using getByText
    fireEvent.click(screen.getByText("×"));

    // Ensure that the mockOnRemove function was called
    expect(mockOnRemove).toHaveBeenCalled();
  });
});
