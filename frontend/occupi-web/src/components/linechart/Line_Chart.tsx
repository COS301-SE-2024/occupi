import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
} from "recharts";
import { Button } from "@nextui-org/react";
import { getCapacityComparisonData, CapacityData } from "CapacityService";

const CapacityComparisonGraph = () => {
  const [capacityComparisonData, setCapacityComparisonData] = useState<Pick<CapacityData, 'day' | 'predicted'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getCapacityComparisonData();
        setCapacityComparisonData(data);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDownload = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = imgData;
        downloadLink.download = "capacity_chart.png";
        downloadLink.click();
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div ref={chartRef} style={{ width: "100%", height: 400 }}>
      {/* <h3 className="text-lg font-semibold mb-4">AI Predicted Capacity</h3> */}
      <Button 
        className="mt-3 mb-3 ml-3 bg-primary_alt font-semibold text-text_col_alt"
        onClick={handleDownload}
      >
        Download Chart
      </Button>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart 
          data={capacityComparisonData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
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
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="#A1FF43"
            fill="url(#colorPredicted)"
            strokeWidth={3}
            name="Predicted"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CapacityComparisonGraph;