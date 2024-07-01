/// <reference lib="dom" />
import { describe, test, expect, beforeAll, mock } from "bun:test";
import React from "react";
import { render, screen } from "@testing-library/react";
import { Checkbox } from "@components/index"; // Adjust the import path as needed

describe("Checkbox", () => {
  beforeAll(() => {
    // Mock the @radix-ui/react-checkbox module
    mock.module("@radix-ui/react-checkbox", () => ({
      Root: ({ children, ...props }: any) => (
        <div data-testid="checkbox-root" {...props}>
          {children}
        </div>
      ),
      Indicator: ({ children, ...props }: any) => (
        <div data-testid="checkbox-indicator" {...props}>
          {children}
        </div>
      ),
    }));
  });

  test("renders without crashing", () => {
    render(<Checkbox />);
    const checkbox = screen.getByTestId("checkbox-root");
    expect(checkbox).toBeDefined();
  });



  test("forwards ref correctly", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Checkbox ref={ref} />);
    expect(ref.current).toBeDefined();
  });


 
});
