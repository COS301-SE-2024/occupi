// /// <reference lib="dom" />
// import { describe, test, expect, afterEach } from "bun:test";
// import React from "react";
// import { render, screen, fireEvent, cleanup } from "@testing-library/react";
// import {TabComponent} from "@components/index";

// afterEach(() => {
//   cleanup();
// });

// describe("TabComponent", () => {
//   // test("renders with initial active tab 2", () => {
//   //   render(<TabComponent setSelectedTab={function (arg: string): void {
//   //     throw new Error("Function not implemented.");
//   //   } } />);
//   //   const activeTab = screen.getByRole("tab", { name: "Tab2" });
//   //   expect(activeTab.className).toContain("bg-white");
//   //   expect(activeTab.className).toContain("text-black");
//   // });

//   test("activates tab 1 when clicked", () => {
//     render(<TabComponent setSelectedTab={function (arg: string): void {
//       throw new Error("Function not implemented.");
//     } } />);
//     const tab1 = screen.getByRole("tab", { name: "Tab1" });
//     fireEvent.click(tab1);
//     expect(tab1.className).toContain("bg-white");
//     expect(tab1.className).toContain("text-black");
//   });

//   // test("activates tab 3 when clicked", () => {
//   //   render(<TabComponent setSelectedTab={function (arg: string): void {
//   //     throw new Error("Function not implemented.");
//   //   } } />);
//   //   const tab3 = screen.getByRole("tab", { name: "Tab3" });
//   //   fireEvent.click(tab3);
//   //   expect(tab3.className).toContain("bg-white");
//   //   expect(tab3.className).toContain("text-black");
//   // });

//   test("deactivates other tabs when a tab is clicked", () => {
//     render(<TabComponent setSelectedTab={function (arg: string): void {
//       throw new Error("Function not implemented.");
//     } } />);

//     const tab1 = screen.getByRole("tab", { name: "Tab1" });
//     const tab2 = screen.getByRole("tab", { name: "Tab2" });
//     const tab3 = screen.getByRole("tab", { name: "Tab3" });

//     fireEvent.click(tab1);
//     expect(tab1.className).toContain("bg-white");
//     expect(tab1.className).toContain("text-black");
//     expect(tab2.className).toContain("bg-gray-200");
//     expect(tab3.className).toContain("bg-gray-200");

//     fireEvent.click(tab3);
//     expect(tab3.className).toContain("bg-white");
//     expect(tab3.className).toContain("text-black");
//     expect(tab1.className).toContain("bg-gray-200");
//     expect(tab2.className).toContain("bg-gray-200");
//   });
// });