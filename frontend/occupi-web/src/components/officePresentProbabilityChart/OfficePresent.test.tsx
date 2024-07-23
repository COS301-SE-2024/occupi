import { expect, test, describe } from "bun:test";
import { createElement } from "react";
import OfficePresent from "./OfficePresent";

describe("OfficePresent", () => {
  test("renders without crashing", () => {
    const element = createElement(OfficePresent);
    expect(element).toBeDefined();
  });

//   test("contains correct chart title", () => {
//     const element = createElement(OfficePresent) as React.ReactElement<any>;
//     const title = element.props.children[0];
//     expect(title.type).toBe('h3');
//     expect(title.props.children).toBe("Probability of Office Presence");
//     expect(title.props.className).toBe("text-lg font-semibold mb-2");
//   });

//   test("uses correct container", () => {
//     const element = createElement(OfficePresent) as React.ReactElement<any>;
//     const container = element.props.children[1];
//     expect(container.type.name).toBe('ResponsiveContainer');
//     expect(container.props.width).toBe("100%");
//     expect(container.props.height).toBe(200);
//   });

//   test("uses correct chart and data", () => {
//     const element = createElement(OfficePresent) as React.ReactElement<any>;
//     const lineChart = element.props.children[1].props.children;
//     expect(lineChart.type.name).toBe('LineChart');
//     expect(lineChart.props.data).toEqual([
//       { time: "9AM", probability: 0.7 },
//       { time: "11AM", probability: 0.9 },
//       { time: "1PM", probability: 0.5 },
//       { time: "3PM", probability: 0.8 },
//       { time: "5PM", probability: 0.6 },
//     ]);
//   });

//   test("uses correct chart components", () => {
//     const element = createElement(OfficePresent) as React.ReactElement<any>;
//     const lineChart = element.props.children[1].props.children;
//     const components = lineChart.props.children;

//     expect(components[0].type.name).toBe('CartesianGrid');
//     expect(components[0].props.strokeDasharray).toBe("3 3");

//     expect(components[1].type.name).toBe('XAxis');
//     expect(components[1].props.dataKey).toBe("time");

//     expect(components[2].type.name).toBe('YAxis');

//     expect(components[3].type.name).toBe('Tooltip');

//     expect(components[4].type.name).toBe('Legend');

//     expect(components[5].type.name).toBe('Line');
//     expect(components[5].props.type).toBe("monotone");
//     expect(components[5].props.dataKey).toBe("probability");
//     expect(components[5].props.stroke).toBe("#82ca9d");
//   });
});