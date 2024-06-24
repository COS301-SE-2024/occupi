// /// <reference lib="dom" />
// import { describe, test, expect, afterEach ,mock} from "bun:test";
// import React from "react";
// import { render, screen, fireEvent, cleanup } from "@testing-library/react";
// import TopNav from "./TopNav";

// afterEach(() => {
//   cleanup();
// });

// describe("TopNav", () => {
//   test("renders correctly with given props", () => {
//     render(<TopNav searchQuery="test" onChange={() => {}} />);
//     const inputElement = screen.getByPlaceholderText("ctrl/cmd-k to search") as HTMLInputElement;
//     expect(inputElement.value).toBe("test"); // Ensure the input value is set correctly
//   });

//   test("calls onChange handler when input value changes", () => {
//     const handleChange = mock(() => {});
//     render(<TopNav searchQuery="" onChange={handleChange} />);
//     const inputElement = screen.getByPlaceholderText("ctrl/cmd-k to search") as HTMLInputElement;
//     fireEvent.change(inputElement, { target: { value: "new value" } });
//     expect(handleChange).toHaveBeenCalled(); // Ensure the onChange handler is called
//   });

//   test("updates input value when searchQuery prop changes", () => {
//     const { rerender } = render(<TopNav searchQuery="initial" onChange={() => {}} />);
//     const inputElement = screen.getByPlaceholderText("ctrl/cmd-k to search") as HTMLInputElement;
//     expect(inputElement.value).toBe("initial");
    
//     rerender(<TopNav searchQuery="updated" onChange={() => {}} />);
//     expect(inputElement.value).toBe("updated"); // Ensure the input value updates when prop changes
//   });
// });