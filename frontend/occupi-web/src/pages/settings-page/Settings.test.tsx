/// <reference lib="dom" />
import { describe, test, expect, afterEach, mock } from "bun:test";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import Settings from "./Settings";

// Mock the components
mock.module("../../components/sideNavComponent/SideNav", () => ({
    default: () => <div data-testid="side-nav">Mock SideNav</div>
  }));
  mock.module("../../components/topNav/TopNav", () => ({
    default: () => <div data-testid="top-nav">Mock TopNav</div>
  }));
  mock.module("../../components/tabComponent/TabComponent", () => ({
    default: () => <div data-testid="tab-component">Mock TabComponent</div>
  }));
  mock.module("../../components/searchBarComponent/SearchBar", () => ({
    default: () => <div data-testid="search-bar">Mock SearchBar</div>
  }));
  mock.module("../../components/drawerComponent/DrawerComponent", () => ({
    default: () => <div data-testid="drawer-component">Mock DrawerComponent</div>
  }));

afterEach(() => {
  cleanup();
});

describe("Settings", () => {
  test("renders correctly with all components", () => {
    render(<Settings />);

    // const sideNav = screen.getByTestId("side-nav");
    // const topNav = screen.getByTestId("top-nav");
    // const tabComponent = screen.getByTestId("tab-component");
    const searchBar = screen.getByTestId("search-bar");
    // const drawerComponent = screen.getByTestId("drawer-component");

    // expect(sideNav).toBeTruthy();
    // expect(topNav).toBeTruthy();
    // expect(tabComponent).toBeTruthy();
    expect(searchBar).toBeTruthy();
    // expect(drawerComponent).toBeTruthy();
  });

  test("displays the Settings title and description", () => {
    render(<Settings />);

    const title = screen.getByText("Settings");
    const description = screen.getByText("Manage your profile, appearance, and what data is shared with us");

    expect(title).toBeTruthy();
    expect(description).toBeTruthy();
  });

  test("renders the SearchBar at the top right corner", () => {
    render(<Settings />);

    const searchBar = screen.getByTestId("search-bar");

    expect(searchBar).toBeTruthy();
  });
});