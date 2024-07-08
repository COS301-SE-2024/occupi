import { test, expect } from "bun:test";
import { render, screen } from "@testing-library/react";
import Analysis from "./Analysis";

test("Analysis renders correctly", () => {
  render(<Analysis />);
  const analysis = screen.getByTestId("analysis");
  expect(analysis).not.toBeNull();
});