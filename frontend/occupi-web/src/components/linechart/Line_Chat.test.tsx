// import { describe, expect, test } from "bun:test";
// import { render, screen,  cleanup } from "@testing-library/react";
// import App from "../../App";


// afterEach(() => {
//   cleanup();
// });

// describe("App Component Tests", () => {
//   test("renders the chart and download button", () => {
//     render(<App />);
//     expect(screen.getByText("Download Chart")).toBeTruthy(); // Checks if the button is rendered
//     expect(screen.getByRole("button")).toBeTruthy(); // Further verifies the button's presence
//   });

// //   test("download button triggers download when clicked", () => {
// //     render(<App />);
// //     const button = screen.getByText("Download Chart");
    
// //     // Mocking the click event
// //     const mockClickEvent = jest.fn();
// //     button.onclick = mockClickEvent;
// //     fireEvent.click(button);
    
// //     expect(mockClickEvent).toHaveBeenCalled(); // Verify that the click event is triggered
// //   });
// });