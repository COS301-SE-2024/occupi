import { useState, useEffect, useRef } from "react";
import { Button } from "@nextui-org/react";
import html2canvas from "html2canvas";
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
import { fetchCapacityData, CapacityData } from "CapacityService";
import axios from "axios";

const getDayName = (dayOfWeek: number): string => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayOfWeek] || "";
};

const convertRangeToNumber = (range: string): number => {
  const [min, max] = range.split("-").map(Number);
  return Math.round((min + max) / 2);
};

const CapacityComparisonBarChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const thisWeekData = await fetchCapacityData();
        const lastWeekData = await fetchPreviousWeekData();

        const combinedData = thisWeekData.map((item, index) => ({
          name: item.day,
          Today: item.predicted,
          LastWeek: lastWeekData[index % 7].predicted, // Use modulo to ensure we don't go out of bounds
        }));

        setData(combinedData);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchPreviousWeekData = async (): Promise<CapacityData[]> => {
    const today = new Date();
    const previousWeekData: CapacityData[] = [];

    for (let i = 7; i <= 13; i++) {
      const previousDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const formattedDate = previousDay.toISOString().split('T')[0];

      try {
        const response = await axios.get(`https://ai.occupi.tech/predict_date?date=${formattedDate}`);
        const item = response.data;
        previousWeekData.push({
          day: getDayName(item.Day_of_Week),
          predicted: convertRangeToNumber(item.Predicted_Attendance_Level),
          date: formattedDate,
          dayOfMonth: item.Day_of_month,
          isWeekend: item.Is_Weekend,
          month: item.Month,
          predictedClass: item.Predicted_Class,
          specialEvent: item.Special_Event === 1,
        });
      } catch (error) {
        console.error(`Error fetching data for ${formattedDate}:`, error);
      }
    }

    return previousWeekData;
  };

  const handleDownload = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = imgData;
        downloadLink.download = "capacity_comparison_chart.png";
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
    <div data-testid="graph">
      <div ref={chartRef} style={{ width: "100%", height: 400 }}>
        <Button
          data-testid="download-button1"
          className="-mt-10 mb-5 ml-3 bg-primary_alt font-medium text-text_col_alt"
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
            <Bar dataKey="LastWeek" fill="#FF5F5F" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Today" fill="#AFF16C" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CapacityComparisonBarChart;