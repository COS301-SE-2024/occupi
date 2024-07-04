// /// <reference lib="dom" />
// import { describe, test, expect, afterEach } from "bun:test";
// import { render, screen, fireEvent, cleanup } from "@testing-library/react";
// import LoginForm from "./LoginForm";






// afterEach(() => {
//   cleanup();
// });

// describe("LoginForm", () => {
//   test("renders correctly", () => {
//     render(<LoginForm />);
//     const imgElement = screen.getByAltText("welcomes") as HTMLImageElement;
//     expect(imgElement.src).toContain("mocked-login-png");
//     expect(screen.getByTestId("occupi-logo")).toBeTruthy();
//     expect(screen.getByText("Welcome back to Occupi.")).toBeTruthy();
//     expect(screen.getByText("Predict. Plan. Perfect")).toBeTruthy();
//   });

//   test("updates form state when InputBox values change", () => {
//     render(<LoginForm />);
//     const emailInput = screen.getByTestId("inputbox-Email Address") as HTMLInputElement;
//     const passwordInput = screen.getByTestId("inputbox-Password") as HTMLInputElement;

//     fireEvent.change(emailInput, { target: { value: "test@example.com" } });
//     fireEvent.change(passwordInput, { target: { value: "password123" } });

//     expect(emailInput.value).toBe("test@example.com");
//     expect(passwordInput.value).toBe("password123");
//   });

//   test("toggles GradientButton based on form validity", () => {
//     render(<LoginForm />);
//     const emailInput = screen.getByTestId("inputbox-Email Address") as HTMLInputElement;
//     const passwordInput = screen.getByTestId("inputbox-Password") as HTMLInputElement;
//     const gradientButton = screen.getByTestId("gradient-button") as HTMLButtonElement;

//     expect(gradientButton.disabled).toBe(true);

//     fireEvent.change(emailInput, { target: { value: "test@example.com" } });
//     fireEvent.change(passwordInput, { target: { value: "password123" } });

//     expect(gradientButton.disabled).toBe(false);
//   });

//   test("renders and interacts with Checkbox", () => {
//     render(<LoginForm />);
//     const checkbox = screen.getByTestId("checkbox") as HTMLInputElement;
//     fireEvent.click(checkbox);
//     expect(checkbox.checked).toBe(true);
//   });
// });