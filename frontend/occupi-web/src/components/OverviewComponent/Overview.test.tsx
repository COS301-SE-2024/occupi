import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import OverviewComponent from "./OverviewComponent";
import { UserProvider } from "userStore"; // Import the UserProvider

// Create a wrapper component that provides the UserContext
import { ReactNode } from "react";

const Wrapper = ({ children }: { children: ReactNode }) => (
  <UserProvider>
    {children}
  </UserProvider>
);

describe("OverviewComponent Tests", () => {
  // test("renders greeting and welcome messages", () => {
  //   render(<OverviewComponent />, { wrapper: Wrapper });
  //   // expect(screen.getByText("Hi Tina 👋")).toBeTruthy();
  //   expect(screen.getByText("Welcome to Occupi")).toBeTruthy();
  // });

  test("renders images and checks their presence", () => {
    render(<OverviewComponent />, { wrapper: Wrapper });
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
  });
});