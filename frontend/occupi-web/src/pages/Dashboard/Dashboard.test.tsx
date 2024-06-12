// /// <reference lib="dom" />
// import { describe, test, expect, afterEach } from "bun:test";
// import React from "react";
// import { render, screen, fireEvent, cleanup } from "@testing-library/react";
// import Dashboard from "./Dashboard";
// import { TopNav } from "@components/index";

// // Mock the TopNav component
// jest.mock("@components/index", () => ({
//   TopNav: (props: any) => (
//     <input
//       data-testid="top-nav-input"
//       type="text"
//       placeholder="ctrl/cmd-k to search"
//       value={props.searchQuery}
//       onChange={props.onChange}
//     />
//   ),
// }));

// afterEach(() => {
//   cleanup();
// });

// describe("Dashboard", () => {
//   test("renders TopNav component with initial empty search query", () => {
//     render(<Dashboard />);
//     const inputElement = screen.getByTestId("top-nav-input") as HTMLInputElement;
//     expect(inputElement.value).toBe(""); // Ensure the initial search query is empty
//   });

//   test("updates searchQuery state when input value changes", () => {
//     render(<Dashboard />);
//     const inputElement = screen.getByTestId("top-nav-input") as HTMLInputElement;
//     fireEvent.change(inputElement, { target: { value: "new value" } });
//     expect(inputElement.value).toBe("new value"); // Ensure the search query state is updated
//   });
// });