// import { expect, test } from "bun:test";
// import { render } from "@testing-library/react";
// import HeaderComponent from "./Header";

// test("HeaderComponent renders with default props", () => {
//   const { getByText } = render(<HeaderComponent />);
//   expect(getByText("Hi Guest 👋")).toBeDefined();
//   expect(getByText("Welcome to Occupi")).toBeDefined();
//   expect(getByText("Office bookings")).toBeDefined();
// });

// test("HeaderComponent renders with custom props", () => {
//   const { getByText } = render(
//     <HeaderComponent 
//       greeting="Hello" 
//       welcomeMessage="Welcome back" 
//       actionText="Book now"
//     />
//   );
//   expect(getByText("Hello Guest 👋")).toBeDefined();
//   expect(getByText("Welcome back")).toBeDefined();
//   expect(getByText("Book now")).toBeDefined();
// });