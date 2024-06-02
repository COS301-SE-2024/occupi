// import { render, screen, fireEvent } from "@testing-library/react";
// import InputBox from "./InputBox";

// describe("InputBox", () => {
//   test("should call submitValue with valid email", () => {
//     const submitValueMock = jest.fn();
//     render(
//       <InputBox
//         type="email"
//         label="Email"
//         placeholder="Enter your email"
//         submitValue={submitValueMock}
//       />
//     );

//     const inputElement = screen.getByPlaceholderText("Enter your email");
//     fireEvent.change(inputElement, { target: { value: "test@example.com" } });

//     expect(submitValueMock).toHaveBeenCalledWith("test@example.com", true);
//   });

//   test("should call submitValue with invalid email", () => {
//     const submitValueMock = jest.fn();
//     render(
//       <InputBox
//         type="email"
//         label="Email"
//         placeholder="Enter your email"
//         submitValue={submitValueMock}
//       />
//     );

//     const inputElement = screen.getByPlaceholderText("Enter your email");
//     fireEvent.change(inputElement, { target: { value: "invalid-email" } });

//     expect(submitValueMock).toHaveBeenCalledWith("invalid-email", false);
//   });

//   test("should call submitValue with valid password", () => {
//     const submitValueMock = jest.fn();
//     render(
//       <InputBox
//         type="password"
//         label="Password"
//         placeholder="Enter your password"
//         submitValue={submitValueMock}
//       />
//     );

//     const inputElement = screen.getByPlaceholderText("Enter your password");
//     fireEvent.change(inputElement, { target: { value: "Password123" } });

//     expect(submitValueMock).toHaveBeenCalledWith("Password123", true);
//   });

//   test("should call submitValue with invalid password", () => {
//     const submitValueMock = jest.fn();
//     render(
//       <InputBox
//         type="password"
//         label="Password"
//         placeholder="Enter your password"
//         submitValue={submitValueMock}
//       />
//     );

//     const inputElement = screen.getByPlaceholderText("Enter your password");
//     fireEvent.change(inputElement, { target: { value: "invalid" } });

//     expect(submitValueMock).toHaveBeenCalledWith("invalid", false);
//   });
// });