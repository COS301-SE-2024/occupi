/// <reference lib="dom" />

import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import InputBox from "./InputBox";
import { describe, test, expect, afterEach, mock } from "bun:test";

afterEach(() => {
  cleanup();
});

describe("InputBox", () => {
  test("renders with correct label and placeholder", () => {
    render(
      <InputBox
        type="email"
        label="Email"
        placeholder="Enter your email"
        submitValue={() => {}}
      />
    );
    const label = screen.getByText("Email");
    const input = screen.getByPlaceholderText("Enter your email");
    expect(label).toBeTruthy();
    expect(input).toBeTruthy();
  });

  // test("validates email input correctly", () => {
  //   const submitValueMock = mock(() => {});
  //   render(
  //     <InputBox
  //       type="email"
  //       label="Email"
  //       placeholder="Enter your email"
  //       submitValue={submitValueMock}
  //     />
  //   );

  //   const input = screen.getByPlaceholderText("Enter your email");
  //   fireEvent.change(input, { target: { value: "invalid-email" } });
  //   const error = screen.getByText("Invalid Email");
  //   expect(error).toBeTruthy();
  //   expect(submitValueMock).toHaveBeenCalledWith("invalid-email", false);

  //   fireEvent.change(input, { target: { value: "test@example.com" } });
  //   expect(screen.queryByText("Invalid Email")).toBeNull();
  //   expect(submitValueMock).toHaveBeenCalledWith("test@example.com", true);
  // });

  test("validates password input correctly", () => {
    const submitValueMock = mock(() => {});
    render(
      <InputBox
        type="password"
        label="Password"
        placeholder="Enter your password"
        submitValue={submitValueMock}
      />
    );

    const input = screen.getByPlaceholderText("Enter your password");
    fireEvent.change(input, { target: { value: "weakpwd" } });
    const error = screen.getByText("Invalid Password");
    expect(error).toBeTruthy();
    expect(submitValueMock).toHaveBeenCalledWith("weakpwd", false);

    fireEvent.change(input, { target: { value: "StrongPwd123" } });
    expect(screen.queryByText("Invalid Password")).toBeNull();
    expect(submitValueMock).toHaveBeenCalledWith("StrongPwd123", true);
  });

  // New tests added below

  test("renders correctly with password type", () => {
    const submitValueMock = mock(() => {});
    render(
      <InputBox
        type="password"
        label="Password"
        placeholder="Enter your password"
        submitValue={submitValueMock}
      />
    );

    expect(screen.getByText("Password")).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter your password")).toBeTruthy();
  });

  test("applies error styles when input is invalid", () => {
    const submitValueMock = mock(() => {});
    render(
      <InputBox
        type="email"
        label="Email"
        placeholder="Enter your email"
        submitValue={submitValueMock}
      />
    );

    const input = screen.getByPlaceholderText("Enter your email");

    fireEvent.change(input, { target: { value: "invalid-email" } });
    expect(input.className).toContain("border-[2px]");
    expect(input.className).toContain("border-red_salmon");

    fireEvent.change(input, { target: { value: "valid@email.com" } });
    expect(input.className).not.toContain("border-[2px]");
    expect(input.className).not.toContain("border-red_salmon");
  });

  test("clears error message when input becomes valid", () => {
    const submitValueMock = mock(() => {});
    render(
      <InputBox
        type="email"
        label="Email"
        placeholder="Enter your email"
        submitValue={submitValueMock}
      />
    );

    const input = screen.getByPlaceholderText("Enter your email");

    fireEvent.change(input, { target: { value: "invalid-email" } });
    expect(screen.getByText("Invalid Email")).toBeTruthy();

    fireEvent.change(input, { target: { value: "valid@email.com" } });
    expect(screen.queryByText("Invalid Email")).toBeNull();
  });
});