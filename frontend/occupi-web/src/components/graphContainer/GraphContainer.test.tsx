/// <reference lib="dom" />
import { test, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import GraphContainer from "./GraphContainer";

afterEach(() => {
    cleanup();
  });

  test("GraphContainer renders correctly with default props", () => {
    const { getAllByTestId } = render(<GraphContainer />);
    const containers = getAllByTestId("graph-container");
  
    expect(containers.length).toBe(2);
    expect(containers[1].style.width).toBe("24.531vw");
    expect(containers[1].style.height).toBe("13.49vw");
  });
  
  test("GraphContainer renders with custom width and height", () => {
    const { getAllByTestId } = render(<GraphContainer width="30vw" height="20vw" />);
    const containers = getAllByTestId("graph-container");
  
    expect(containers.length).toBe(2);
    expect(containers[1].style.width).toBe("30vw");
    expect(containers[1].style.height).toBe("20vw");
  });

  test("GraphContainer renders main component", () => {
    const MainComponent = () => <div data-testid="main-component">Main Content</div>;
    const { getByTestId } = render(<GraphContainer mainComponent={<MainComponent />} />);
  
    expect(getByTestId("main-component")).toBeDefined();
    expect(getByTestId("main-component").textContent).toBe("Main Content");
  });

  test("GraphContainer has correct CSS classes", () => {
    const { getAllByTestId } = render(<GraphContainer />);
    const containers = getAllByTestId("graph-container");
  
    // expect(containers[1].className).toContain("card");
    expect(containers[1].className).toContain("card border-2");
    expect(containers[1].className).toContain("border-tertiary");
    expect(containers[1].className).toContain("rounded-[20px]");
    // expect(containers[1].className).toContain("bg-secondary");
    // expect(containers[1].className).toContain("shadow-2xl");
  });
  
  test("GraphContainer renders without main component", () => {
    const { getAllByTestId } = render(<GraphContainer />);
    const containers = getAllByTestId("graph-container");
  
    expect(containers.length).toBe(2);
    expect(containers[1].children.length).toBe(0);
  });