// /// <reference lib="dom" />
// import { describe, test, expect,afterEach } from "bun:test";
// import React from "react";
// import { render, screen,cleanup} from "@testing-library/react";
// import GraphContainer from "./GraphContainer";

// afterEach(() => {
//     cleanup();
//   });

//   describe("GraphContainer", () => {
//     test("renders with default width and height", () => {
//       render(<GraphContainer />);
//       const divElement = screen.getByTestId("graph-container");
//       const style = window.getComputedStyle(divElement);
//       expect(style.width).toBe("471px");
//       expect(style.height).toBe("259px");
//     });
  
//     // test("renders with provided width and height", () => {
//     //   render(<GraphContainer width="500px" height="300px" />);
//     //   const divElement = screen.getByTestId("graph-container");
//     //   const style = window.getComputedStyle(divElement);
//     //   expect(style.width).toBe("500px");
//     //   expect(style.height).toBe("300px");
//     // });
//   });