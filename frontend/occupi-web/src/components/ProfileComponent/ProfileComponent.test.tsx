/// <reference lib="dom" />
import { describe, test, expect,afterEach } from "bun:test";
import React from "react";
import { render, screen ,cleanup} from "@testing-library/react";
import ProfileComponent from "./ProfileComponent";


afterEach(() => {
    cleanup();
  });

describe("ProfileComponent", () => {
  test("renders correctly", () => {
    render(<ProfileComponent />);
    const divElement = screen.getByText("ProfileComponent");
    expect(divElement).toBeTruthy();
  });
});