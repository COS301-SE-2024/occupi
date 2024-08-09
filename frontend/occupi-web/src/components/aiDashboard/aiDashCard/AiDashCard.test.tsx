import { expect, test, mock } from "bun:test";
import { render,cleanup } from "@testing-library/react";
import {AiDashCard} from "@components/index";
import { afterEach } from "bun:test";


afterEach(() => {
    cleanup();
  });

test("AiDashCard renders correctly", () => {
  const mockProps = {
    title: "Test Card",
    icon: <div>Icon</div>,
    stat: "100",
    trend: 5,
    onRemove: mock(() => {}),
  };

  const { getByText } = render(<AiDashCard {...mockProps} />);

  expect(getByText("Test Card")).toBeDefined();
  expect(getByText("100")).toBeDefined();
  expect(getByText("5% Since last month")).toBeDefined();
});



test("AiDashCard calls onRemove when close button is clicked", () => {
  const mockOnRemove = mock(() => {});
  const mockProps = {
    title: "Test Card",
    icon: <div>Icon</div>,
    stat: "100",
    trend: 5,
    onRemove: mockOnRemove,
  };

  const { getByText } = render(<AiDashCard {...mockProps} />);
  const closeButton = getByText("×");
  closeButton.click();

  expect(mockOnRemove).toHaveBeenCalled();
});

test("AiDashCard displays negative trend correctly", () => {
  const mockProps = {
    title: "Test Card",
    icon: <div>Icon</div>,
    stat: "100",
    trend: -5,
    onRemove: mock(() => {}),
  };

  const { getByText } = render(<AiDashCard {...mockProps} />);

  expect(getByText("5% Since last month")).toBeDefined();
});

