import { expect, test, mock } from "bun:test";
import { render, screen, act } from "@testing-library/react";
import { Header } from "@components/index";
import { UserProvider, useUser } from "userStore";
import React from "react";

// Mock localStorage
const localStorageMock = {
  getItem: mock(() => null),
  setItem: mock(() => {}),
  removeItem: mock(() => {}),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Helper component to set user details
const UserSetter = ({ email }: { email: string }) => {
  const { setUserDetails } = useUser();
  React.useEffect(() => {
    setUserDetails({ email });
  }, []);
  return null;
};

test("Header renders with user email", async () => {
  await act(async () => {
    render(
      <UserProvider>
        <UserSetter email="test@example.com" />
        <Header />
      </UserProvider>
    );
  });

  expect(screen.getByText(/Hi test@example.com 👋/)).toBeDefined();
  expect(screen.getByText("Welcome to Occupi")).toBeDefined();
  expect(screen.getByText("Office bookings")).toBeDefined();
});

test("Header renders with custom props", async () => {
  await act(async () => {
    render(
      <UserProvider>
        <UserSetter email="test@example.com" />
        <Header
          greeting="Hello"
          welcomeMessage="Welcome back"
          actionText="Book now"
        />
      </UserProvider>
    );
  });

  expect(screen.getByText(/Hello test@example.com 👋/)).toBeDefined();
  expect(screen.getByText("Welcome back")).toBeDefined();
  expect(screen.getByText("Book now")).toBeDefined();
});

test("Header renders for guest user", async () => {
  await act(async () => {
    render(
      <UserProvider>
        <Header />
      </UserProvider>
    );
  });

  expect(screen.getByText(/Hi Guest 👋/)).toBeDefined();
});

test("UserContext updates localStorage", async () => {
  await act(async () => {
    render(
      <UserProvider>
        <UserSetter email="test@example.com" />
      </UserProvider>
    );
  });

  expect(localStorageMock.setItem).toHaveBeenCalledWith(
    "userDetails",
    JSON.stringify({ email: "test@example.com" })
  );
});
