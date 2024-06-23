// /// <reference lib="dom" />
// import { describe, test, expect, mock ,afterEach} from "bun:test";
// import React from "react";
// import { render, screen, fireEvent,cleanup } from "@testing-library/react";
// import SideNav from "./SideNav";
// import { OccupiLogo, CloseDrawer, OpenDrawer, Grid, Logout, Bell, ColorSwatch, Home, PieChart, SettingsIcon, UserProfileGroup } from "@assets/index";

// afterEach(() => {
//     cleanup();
//   });


// describe("SideNav", () => {
//   test("renders with Occupi logo and title when not minimized", () => {
//     render(<SideNav />);
//     const logoElement = screen.getByRole("img", { name: /occupi logo/i });
//     const titleElement = screen.getByText("Occupi");
//     expect(logoElement).toBeTruthy();
//     expect(titleElement).toBeTruthy();
//   });

// //   test("toggles sidebar minimization state on button click", () => {
// //     render(<SideNav />);
// //     const toggleButton = screen.getByRole("button", { name: /toggle sidebar/i });
// //     fireEvent.click(toggleButton);
// //     expect(screen.queryByText("Occupi")).toBeNull(); // Expect title to be hidden when minimized
// //   });

// //   test("renders all sidebar buttons", () => {
// //     render(<SideNav />);
// //     const sidebarButtons = [
// //       "Dashboard",
// //       "Analysis",
// //       "AI model",
// //       "Buildings",
// //       "Teams",
// //       "Notifications",
// //       "Settings",
// //       "Logout"
// //     ];
// //     sidebarButtons.forEach((buttonText) => {
// //       expect(screen.getByText(buttonText)).toBeTruthy();
// //     });
// //   });

// //   test("calls setSelectedPanelF on sidebar button click", () => {
// //     const setSelectedPanelFMock = mock(() => {});
// //     render(
// //       <SideNav
// //         selectedPanel="Dashboard"
// //         setSelectedPanelF={setSelectedPanelFMock}
// //       />
// //     );
// //     const dashboardButton = screen.getByText("Dashboard").closest("div");
// //     if (dashboardButton) {
// //       fireEvent.click(dashboardButton);
// //       expect(setSelectedPanelFMock).toHaveBeenCalledWith("Dashboard");
// //     } else {
// //       throw new Error('dashboardButton is null');
// //     }
// //   });
// 
//
//});