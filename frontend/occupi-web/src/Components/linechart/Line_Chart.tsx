import "./styles.css";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  {
    name: "Monday",

    attendees: 2400,
    amt: 2400,
  },
  {
    name: "Tuesday",

    attendees: 1398,
    amt: 2210,
  },
  {
    name: "Wed",

    attendees: 9800,
    amt: 2290,
  },
  {
    name: "Thur",

    attendees: 3908,
    amt: 2000,
  },
  {
    name: "Friday",

    attendees: 4800,
    amt: 2181,
  },
  {
    name: "Sat",

    attendees: 3800,
    amt: 2500,
  },
  {
    name: "Sunday",

    attendees: 4300,
    amt: 2100,
  },
];

export default function Line_Chart() {
  return (
    <LineChart width={850} height={400} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" padding={{ left: 30, right: 30 }} />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="attendees"
        stroke="#8884d8"
        fill=" #8884d8 "
        activeDot={{ r: 8 }}
      />
    </LineChart>
  );
}
