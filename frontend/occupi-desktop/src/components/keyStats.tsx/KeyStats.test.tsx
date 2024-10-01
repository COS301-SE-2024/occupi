// import { expect, test } from "bun:test";
// import { render, screen } from "@testing-library/react";
// import KeyStats from "./KeyStats";

// test("KeyStats renders correctly", () => {
//   render(<KeyStats />);

//   // Check if the title is rendered
//   const title = screen.getByText("Key Stats");
//   expect(title).toBeDefined();
//   expect(title.tagName).toBe("H3");
//   expect(title.className).toInclude("text-lg font-semibold mb-2");

//   // Check if the stats are rendered
//   const avgWeeklyHours = screen.getByText("Average Weekly Hours: 7.6");
//   expect(avgWeeklyHours).toBeDefined();
//   expect(avgWeeklyHours.tagName).toBe("P");

//   const mostLikelyOfficeTime = screen.getByText("Most Likely Office Time: 11AM");
//   expect(mostLikelyOfficeTime).toBeDefined();
//   expect(mostLikelyOfficeTime.tagName).toBe("P");

//   const occupancyRating = screen.getByText("Occupancy Rating: 70%");
//   expect(occupancyRating).toBeDefined();
//   expect(occupancyRating.tagName).toBe("P");
// });

// test("KeyStats has correct CSS classes", () => {
// //   render(<KeyStats />);

//   const mainDiv = screen.getByText("Key Stats").closest('div');
//   expect(mainDiv).toBeDefined();
//   expect(mainDiv?.className).toInclude("text-text_col flex flex-col justify-center items-center");

//   const statsDiv = screen.getByText("Average Weekly Hours: 7.6").closest('div');
//   expect(statsDiv).toBeDefined();
//   expect(statsDiv?.className).toInclude("text-text_col");

//   const paragraphs = screen.getAllByText(/:/);
//   paragraphs.forEach(p => {
//     expect(p.className).toInclude("text-text_col");
//   });
// });

// test("KeyStats contains correct number of elements", () => {
// //   render(<KeyStats />);

//   //const allElements = screen.getAllByText(/.+/);
//   //expect(allElements.length).toBe(4); // 1 title + 3 stats

//   const statElements = screen.getAllByText(/:/);
//   expect(statElements.length).toBe(3);
// });