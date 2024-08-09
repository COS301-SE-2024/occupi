import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { StyledProvider, Theme } from "@gluestack-ui/themed";
import Onboarding1 from "../assets/Onboarding1";

jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper"); // To prevent warnings about Animated module
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

const renderWithProvider = (component) => {
  return render(<StyledProvider theme={Theme}>{component}</StyledProvider>);
};

describe("Onboarding1 component", () => {
  it("renders correctly and matches snapshot", () => {
    const tree = renderWithProvider(<Onboarding1 />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders text correctly", () => {
    const { getByText } = renderWithProvider(<Onboarding1 />);
    expect(getByText("Capacity Prediction")).toBeTruthy();
    expect(
      getByText(
        "Predictive AI to help you plan when you go to the office better"
      )
    ).toBeTruthy();
  });

  it("navigates to the next screen on button press", () => {
    const { getByText } = renderWithProvider(<Onboarding1 />);
    const nextButton = getByText("Next");

    fireEvent.press(nextButton);

    expect(require("expo-router").router.replace).toHaveBeenCalledWith(
      "/onboarding2"
    );
  });
});
