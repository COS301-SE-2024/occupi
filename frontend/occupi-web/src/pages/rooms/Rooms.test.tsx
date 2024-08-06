import { render } from "@testing-library/react";
import Rooms from "./Rooms";


test("Rooms component renders correctly", () => {
    const { getByText } = render(<Rooms />);
    expect(getByText("Rooms")).toBeDefined();
  });

//   test("Filter dropdown is present", () => {
//     const { getByText } = render(<Rooms />);
//     expect(getByText("Filter by Floor")).toBeDefined();
//   });