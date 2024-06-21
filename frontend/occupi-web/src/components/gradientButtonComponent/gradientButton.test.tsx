// /// <reference lib="dom" />
// import { test, expect, mock } from 'bun:test';
// import { render, fireEvent } from '@testing-library/react';
// import GradientButton from '../gradientButtonComponent/gradientButton'; // Adjust the import based on your file structure

// test('GradientButton should render text correctly', () => {
//   const { getByText } = render(<GradientButton Text="Click Me" isClickable={true} clickEvent={() => {}} />);
//   const buttonElement = getByText("Click Me");
//   expect(buttonElement).toBeTruthy();
// });


// test('GradientButton should call clickEvent when clicked and clickable', () => {
//   const clickEventMock = mock(() => {});
//   const { getByText } = render(<GradientButton Text="Click Me" isClickable={true} clickEvent={clickEventMock} />);
//   const buttonElement = getByText("Click Me");
//   fireEvent.click(buttonElement);
//   expect(clickEventMock).toHaveBeenCalled();
// });

// test('GradientButton should not call clickEvent when not clickable', () => {
//   const clickEventMock = mock(() => {});
//   const { getByText } = render(<GradientButton Text="Click Me" isClickable={false} clickEvent={clickEventMock} />);
//   const buttonElement = getByText("Click Me");
//   fireEvent.click(buttonElement);
//   expect(clickEventMock).not.toHaveBeenCalled();
// });