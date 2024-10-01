// import { describe, test, afterEach } from "bun:test";
// import { render, cleanup } from "@testing-library/react";
// import { Line_Chart } from "@components/index";


// afterEach(() => {
//   cleanup();
// });

// describe("Line Chart Component Tests", () => {
//   test("renders the chart and download button", () => {
//     render(<Line_Chart/>);
//     //expect(screen.getByText("Download Chart")).toBeTruthy(); // Checks if the button is rendered
//     //expect(screen.getByRole("button")).toBeTruthy(); // Further verifies the button's presence
//   });

// });

// // test("Download button click triggers download function", () => {
// //     // Mock the handleDownload function
// //     const mockHandleDownload = mock(() => {});
  
// //     // Override the App component to use our mocked function
// //     // const MockedApp = () => {
// //     //   return (
// //     //     <div>
// //     //       <button onClick={mockHandleDownload}>Download Chart</button>
// //     //     </div>
// //     //   );
// //     // };
  
// //     const { getByText } = render(<Line_Chart />);
// //     const downloadButton = getByText("Download Chart");
  
// //     // Simulate clicking the button
// //     fireEvent.click(downloadButton);
  
// //     // Assert that our mocked function was called
// //     expect(mockHandleDownload).toHaveBeenCalled();
// //   });