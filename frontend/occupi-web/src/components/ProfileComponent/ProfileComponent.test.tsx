// import { describe, expect, test } from "bun:test";
// import { render, screen } from "@testing-library/react";
// import ProfileComponent from "./ProfileComponent";

// describe("ProfileComponent Simple Tests", () => {
//   test("renders without crashing", () => {
//     render(<ProfileComponent />);
//     const image = screen.getByRole("img", { hidden: true }) as HTMLImageElement; // Adjusting for images that might be initially hidden
//     expect(image).toBeTruthy(); // Checks if the image element is successfully queried
//   });

//   test("profile image has the correct default source", () => {
//     render(<ProfileComponent />);
//     const image = screen.getByRole("img") as HTMLImageElement;
//     expect(image.src).toContain("https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg");
//   });
// });