// /// <reference lib="dom" />
// import { describe, test, expect, afterEach } from "bun:test";
// import React from "react";
// import { render, screen, cleanup } from "@testing-library/react";
// import Layout from "./Layout";
// import SideNav from "../components/sideNavComponent/SideNav";

// // Mock the SideNav component
// jest.mock("../components/sideNavComponent/SideNav", () => () => <div data-testid="side-nav">Mock SideNav</div>);

// afterEach(() => {
//   cleanup();
// });

// describe("Layout", () => {
//   test("renders SideNav component", () => {
//     render(<Layout><div>Test Child</div></Layout>);
//     const sideNavElement = screen.getByTestId("side-nav");
//     expect(sideNavElement).toBeTruthy(); // Ensure SideNav is rendered
//   });

//   test("renders children correctly", () => {
//     render(<Layout><div data-testid="child">Test Child</div></Layout>);
//     const childElement = screen.getByTestId("child");
//     expect(childElement).toBeTruthy(); // Ensure children are rendered
//     expect(childElement.textContent).toBe("Test Child"); // Ensure correct child content
//   });
// });