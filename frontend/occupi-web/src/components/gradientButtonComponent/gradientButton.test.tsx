// import { expect, test, describe } from "bun:test";
// import { render, screen } from "@testing-library/react";
// import { GradientButton } from "@components/index";

// describe("GradientButton Tests", () => {
//   test("renders the button with the correct text", () => {
//     render(<GradientButton isLoading={false} Text="Auth" isClickable={true} clickEvent={() => {}} />);
//     expect(screen.getByText("Auth")).toBeTruthy();
//   });


//   test("displays loading component when isLoading is true", () => {
//     render(<GradientButton isLoading={true} Text="Loading" isClickable={true} clickEvent={() => {}} />);
//     expect(screen.getByText("Loading")).toBeTruthy();
//     // This assumes that the Loading component renders something identifiable in the DOM, adjust as necessary.
//   });
// });