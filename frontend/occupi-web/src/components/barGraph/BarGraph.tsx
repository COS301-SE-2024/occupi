import { Button } from "@nextui-org/react";
import html2canvas from "html2canvas";
import { useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
  const chartRef = useRef<HTMLDivElement | null>(null);

  const handleDownload = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = imgData;
        downloadLink.download = "chart.png";
        downloadLink.click();
      });
    }
  };

  return (
    <div data-testid="graph">
      <div ref={chartRef} style={{ width: "100%", height: 400 }}>
        <Button
          data-testid="download-button1"
          className=" -mt-10 mb-5 ml-3 bg-primary_alt text-text_col_alt"
          onClick={handleDownload}
        >
          Download Chart
        </Button>

        <ResponsiveContainer data-testid="bar-graph" width="100%" height={390}>
          <BarChart
          
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
        </ResponsiveContainer>
      </div>
    </div>
  );
}
