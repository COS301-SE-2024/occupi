/// <reference lib="dom" />
import { describe, test, expect, afterEach } from "bun:test";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import OtpPage from "./OtpPage";
import { OccupiLogo, login_image } from "@assets/index";
import { GradientButton, OtpComponent } from "@components/index";

// Mock the components and assets
jest.mock("@assets/index", () => ({
  login_image: "mocked-login-image",
  OccupiLogo: () => <div data-testid="occupi-logo">Mock OccupiLogo</div>,
}));

jest.mock("@components/index", () => ({
  GradientButton: (props: any) => <button data-testid="gradient-button" disabled={!props.isClickable}>{props.Text}</button>,
  OtpComponent: (props: any) => (
    <input
      data-testid="otp-component"
      type="text"
      onChange={(e) => props.setOtp(e.target.value, e.target.value.length === 6)}
    />
  ),
}));

afterEach(() => {
  cleanup();
});

describe("OtpPage", () => {
  test("renders correctly", () => {
    render(<OtpPage />);
    const imgElement = screen.getByAltText("welcomes") as HTMLImageElement;
    expect(imgElement.src).toContain("mocked-login-image");
    expect(screen.getByTestId("occupi-logo")).toBeTruthy();
    expect(screen.getByText("We sent you an email with a code")).toBeTruthy();
    expect(screen.getByText("Please enter it to continue")).toBeTruthy();
  });

  test("updates OTP state when OtpComponent value changes", () => {
    render(<OtpPage />);
    const otpInput = screen.getByTestId("otp-component") as HTMLInputElement;

    fireEvent.change(otpInput, { target: { value: "123456" } });
    expect(otpInput.value).toBe("123456");
  });

  test("toggles GradientButton based on OTP validity", () => {
    render(<OtpPage />);
    const otpInput = screen.getByTestId("otp-component") as HTMLInputElement;
    const gradientButton = screen.getByTestId("gradient-button") as HTMLButtonElement;

    expect(gradientButton.disabled).toBe(true);

    fireEvent.change(otpInput, { target: { value: "123456" } });
    expect(gradientButton.disabled).toBe(false);

    fireEvent.change(otpInput, { target: { value: "12345" } });
    expect(gradientButton.disabled).toBe(true);
  });
});