import { render, screen } from "@testing-library/react";
import AboutPage from "./AboutPage";
import { jest } from "bun:test";

// Mock `three-stdlib`
jest.mock('three-stdlib', () => ({
  ...jest.requireActual('three-stdlib'),
  ImagePreloader: jest.fn(),
}));

// Manually mock `canvas.getContext`
beforeAll(() => {
  global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
  }));
});

test("AboutPage renders correctly", () => {
  render(<AboutPage />);
  const aboutPage = screen.getByTestId("AboutPage");
  expect(aboutPage).not.toBeNull();
});
