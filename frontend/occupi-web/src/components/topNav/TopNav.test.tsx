// /// <reference lib="dom" />
// import { describe, test, expect, afterEach, mock } from "bun:test";
// import React from "react";
// import { render, screen, fireEvent, cleanup } from "@testing-library/react";
// import TopNav from "./TopNav";

// afterEach(() => {
//   cleanup();
// });

// test("TopNav renders correctly", () => {
//   const mockOnChange = mock(() => {});
//   render(<TopNav searchQuery="" onChange={mockOnChange} />);
//   const topNav = screen.getByTestId("topnav");
//   expect(topNav).not.toBeNull();
// });