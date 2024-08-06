/// <reference lib="dom" />
import { describe, test, expect, mock, beforeEach } from "bun:test";
import { render, screen } from "@testing-library/react";
import LoginForm from "./LoginForm"; // Adjust the import path as needed
import { ClassAttributes, InputHTMLAttributes } from "react";
import { JSX } from "react/jsx-runtime";

// Mock the necessary dependencies
mock.module("react-router-dom", () => ({
  useNavigate: () => mock(() => {}),
}));

mock.module("@assets/index", () => ({
  loginpng: "mock-login-image.png",
  OccupiLogo: () => <div data-testid="occupi-logo">Occupi Logo</div>,
}));

mock.module("@components/index", () => ({
  Checkbox: (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLInputElement> & InputHTMLAttributes<HTMLInputElement>) => <input type="checkbox" {...props} />,
  GradientButton: ({ Text, clickEvent, isLoading, isClickable }: { Text: string, clickEvent: () => void, isLoading: boolean, isClickable: boolean }) => (
    <button onClick={clickEvent} disabled={!isClickable || isLoading}>
      {Text}
    </button>
  ),
  InputBox: ({ type, placeholder, label, submitValue }: { type: string, placeholder: string, label: string, submitValue: (value: string, flag: boolean) => void }) => (
    <input
      type={type}
      placeholder={placeholder}
      aria-label={label}
      onChange={(e) => submitValue(e.target.value, true)}
    />
  ),
}));

mock.module("./WebAuthn", () => ({
  registerCredential: mock(() => Promise.resolve({ id: "mock-credential-id" })),
  authenticateWithCredential: mock(() => Promise.resolve({ id: "mock-assertion-id" })),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    // Restore all mocks before each test
    mock.restore();
  });

  test("renders LoginForm correctly", () => {
    render(<LoginForm />);
    expect(screen.getByText("Welcome back to Occupi.")).toBeDefined();
    expect(screen.getByText("Predict. Plan. Perfect")).toBeDefined();
    expect(screen.getByTestId("occupi-logo")).toBeDefined();
  });

  test('renders input fields correctly', () => {
    // render(<LoginForm />);
    const emailInputs = screen.getAllByPlaceholderText(/Enter your email address/);
    const passwordInputs = screen.getAllByPlaceholderText(/Enter your password/);
    expect(emailInputs).toHaveLength(1); // Ensure there's only one email input
    expect(passwordInputs).toHaveLength(1); // Ensure there's only one password input
  });


  //Intergration tests
  // test("disables buttons when form is invalid", () => {
  //   // render(<LoginForm />);
  //   const authButton = screen.getByText("Auth");
  //   const registerButton = screen.getByText("Register");
    
  //   expect(authButton).toHaveProperty("disabled", true);
  //   expect(registerButton).toHaveProperty("disabled", true);
  // });

  // test("enables buttons when form is valid", () => {
  //   // render(<LoginForm />);
  //   const emailInput = screen.getByPlaceholderText("Enter your email address");
  //   const passwordInput = screen.getByPlaceholderText("Enter your password");
    
  //   fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  //   fireEvent.change(passwordInput, { target: { value: "password123" } });
    
  //   const authButton = screen.getByText("Auth");
  //   const registerButton = screen.getByText("Register");
    
  //   expect(authButton).toHaveProperty("disabled", false);
  //   expect(registerButton).toHaveProperty("disabled", false);
  // });
});
