import "./styles.css";
import  { useRef } from "react";
import html2canvas from "html2canvas";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@nextui-org/react";

const data = [
  {
    name: "Monday",
    attendees: 2400,
    amt: 2400,
  },
  {
    name: "Tuesday",
    attendees: 398,
    amt: 210,
  },
  {
    name: "Wed",
    attendees: 4800,
    amt: 2290,
  },
  {
    name: "Thur",
    attendees: 3908,
    amt: 200,
  },
  {
    name: "Friday",
    attendees: 400,
    amt: 1181,
  },
  {
    name: "Sat",
    attendees: 800,
    amt: 2500,
  },
  {
    name: "Sunday",
    attendees: 4300,
    amt: 100,
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
    <div>
      <div ref={chartRef} style={{ width: "100%", height: 400 }}>
      <Button className="mt-3 mb-3 ml-3 bg-primary_alt text-text_col_alt"  onClick={handleDownload}>Download Chart</Button>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="rgba(161, 255, 67, 0.25)"
                  stopOpacity={1}
                />
                <stop
                  offset="100%"
                  stopColor="rgba(161, 255, 67, 0.00)"
                  stopOpacity={1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="amt"
              stroke="#A1FF43"
              fill="url(#colorUv)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


