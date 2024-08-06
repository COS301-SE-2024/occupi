import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import ProfileComponent from "./ProfileComponent";

describe("ProfileComponent Simple Tests", () => {
  // test("renders without crashing", () => {
  //   render(<ProfileComponent />);
  //   const image = screen.getByRole("img", { hidden: true }) as HTMLImageElement; // Adjusting for images that might be initially hidden
  //   expect(image).toBeTruthy(); // Checks if the image element is successfully queried
  // });


});

 
describe("ProfileComponent", () => {
    // test("renders profile image", () => {
    //   render(<ProfileComponent />);
    //   const imgs = screen.getAllByRole("img");
    //   expect(imgs.length).toBeGreaterThan(0);
    //   expect(imgs[0].getAttribute("src")).toBe("https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg");
    // });
  
  
    // test("renders with default props when not provided", () => {
    //   render(<ProfileComponent />);
    //   const imgs = screen.getAllByRole("img");
    //   expect(imgs.length).toBeGreaterThan(0);
    //   expect(imgs[0].getAttribute("src")).toBe("https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg");
    // });
  
    test("renders avatar with online status", () => {
      render(<ProfileComponent />);
      const avatarDivs = screen.getAllByTestId("profile");
      expect(avatarDivs.length).toBeGreaterThan(0);
      const avatarDiv = avatarDivs[0].querySelector(".avatar");
      expect(avatarDiv).toBeDefined();
      expect(avatarDiv?.classList.contains("online")).toBe(true);
    });
  });
