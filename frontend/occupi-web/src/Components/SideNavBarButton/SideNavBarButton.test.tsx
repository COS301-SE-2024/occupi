/// <reference lib="dom" />
import { describe, test, expect, afterEach, mock } from "bun:test";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import SideNavBarButton from "./SideNavBarButton";

afterEach(() => {
  cleanup();
});

const MockIcon = () => <svg data-testid="mock-icon"></svg>;

describe("SideNavBarButton", () => {
  test("renders correctly when minimized", () => {
    render(
      <SideNavBarButton
        icon={MockIcon}
        text="Dashboard"
        isMinimized={true}
        selected_panel=""
        setSelectedPanelF={() => {}}
      />
    );
    const iconElement = screen.getByTestId("mock-icon");
    expect(iconElement).toBeTruthy(); // Ensure icon is present
    expect(screen.queryByText("Dashboard")).toBeNull(); // Text should not be present when minimized
  });

  test("renders correctly when not minimized", () => {
    render(
      <SideNavBarButton
        icon={MockIcon}
        text="Dashboard"
        isMinimized={false}
        selected_panel=""
        setSelectedPanelF={() => {}}
      />
    );
    const iconElement = screen.getByTestId("mock-icon");
    const textElement = screen.getByText("Dashboard");
    expect(iconElement).toBeTruthy(); // Ensure icon is present
    expect(textElement).toBeTruthy(); // Text should be present when not minimized
  });

  test("applies selected styles when selected", () => {
    render(
      <SideNavBarButton
        icon={MockIcon}
        text="Dashboard"
        isMinimized={false}
        selected_panel="Dashboard"
        setSelectedPanelF={() => {}}
      />
    );
    const buttonElement = screen.getByText("Dashboard").closest("div");
    // Check for the presence of a unique attribute or text that would indicate the selected state
    expect(buttonElement?.className).toContain("selected_buttons");
  });

  test("calls setSelectedPanelF on click", () => {
    const setSelectedPanelFMock = mock(() => {});
    render(
      <SideNavBarButton
        icon={MockIcon}
        text="Dashboard"
        isMinimized={false}
        selected_panel=""
        setSelectedPanelF={setSelectedPanelFMock}
      />
    );
    const buttonElement = screen.getByText("Dashboard").closest("div");
    if (buttonElement) {
      fireEvent.click(buttonElement);
      expect(setSelectedPanelFMock).toHaveBeenCalledWith("Dashboard");
    } else {
      throw new Error('buttonElement is null');
    }
  });
});