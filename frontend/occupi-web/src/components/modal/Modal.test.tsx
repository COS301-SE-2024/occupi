// import { render, screen, fireEvent } from "@testing-library/react";
// import Modal from "./Modal";

// test("Modal opens when button is clicked", () => {
//   render(<Modal />);
  
//   const openButton = screen.getByText("Open Modal");
//   fireEvent.click(openButton);

//   const modalTitle = screen.getByText("Modal Title");
//   expect(modalTitle).toBeInTheDocument();
// });

// test("Modal closes when Close button is clicked", () => {
//   render(<Modal />);
  
//   const openButton = screen.getByText("Open Modal");
//   fireEvent.click(openButton);

//   const closeButton = screen.getByText("Close");
//   fireEvent.click(closeButton);

//   const modalTitle = screen.queryByText("Modal Title");
//   expect(modalTitle).not.toBeInTheDocument();
// });

// test("Modal performs action when Action button is clicked", () => {
//   render(<Modal />);
  
//   const openButton = screen.getByText("Open Modal");
//   fireEvent.click(openButton);

//   const actionButton = screen.getByText("Action");
//   fireEvent.click(actionButton);

//   // Add your assertions for the action here
// });