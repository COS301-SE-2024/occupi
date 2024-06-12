import "./styles.css";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  {
    name: "Mon",
    Yesterday: 4000,
    Today: 400,
    amt: 2400,
  },
  {
    name: "Tue",
    Yesterday: 3000,
    Today: 1398,
    amt: 2210,
  },
  {
    name: "Wed",
    Yesterday: 2000,
    Today: 9800,
    amt: 2290,
  },
  {
    name: "Thur",
    Yesterday: 2780,
    Today: 3908,
    amt: 2000,
  },
  {
    name: "Fri",
    Yesterday: 1890,
    Today: 4800,
    amt: 2181,
  },
  {
    name: "Sat",
    Yesterday: 2390,
    Today: 3800,
    amt: 2500,
  },
  {
    name: "Sun",
    Yesterday: 3490,
    Today: 4300,
    amt: 2100,
  },
];

export default function App() {
  return (
    <BarChart
      width={850}
      height={400}
      data={data}
      margin={{
        top: 4,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="Yesterday" fill="#FF5F5F" radius={[6, 6, 0, 0]} />
      <Bar dataKey="Today" fill="#AFF16C" radius={[6, 6, 0, 0]} />
    </BarChart>
  );
}
