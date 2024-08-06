import { test, expect } from "bun:test";
import { render } from "@testing-library/react";
import OccupiLoader from "./OccupiLoader";

test("OccupiLoader renders correctly", () => {
    const { container } = render(<OccupiLoader />);
    expect(container.firstChild).toBeDefined();
  });
  
  test("OccupiLoader renders message when provided", () => {
    const message = "Loading...";
    const { getByText } = render(<OccupiLoader message={message} />);
    expect(getByText(message)).toBeDefined();
  });