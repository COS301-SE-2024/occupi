import {
    ResponsiveContainer,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Bar,
    Cell,
} from "recharts";



const PredictedCapacityGraph = () => {
  const levelColors: { [key: number]: string } = {
    1: "#4CAF50",
    2: "#FFC107",
    3: "#FF9800",
    4: "#F44336",
  };

  const capacityLevels = {
    1: "0-25%",
    2: "26-50%",
    3: "51-75%",
    4: "76-100%",
  };
  const predictedCapacityData = [
    { day: "Mon", level: 2 },
    { day: "Tue", level: 3 },
    { day: "Wed", level: 4 },
    { day: "Thu", level: 1 },
    { day: "Fri", level: 2 },
  ];

  return (
    <div className="h-full">
      <h3 className="text-lg font-semibold mb-4">Predicted Capacity Levels</h3>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={predictedCapacityData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} />
          <Tooltip />
          <Bar dataKey="level" fill="#8884d8">
            {predictedCapacityData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={levelColors[entry.level]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center mt-4">
        {Object.entries(capacityLevels).map(([level, range]) => (
          <div key={level} className="flex items-center mx-2">
            <div
              className="w-4 h-4 mr-1"
              style={{ backgroundColor: levelColors[Number(level)] }}
            ></div>
            <span className="text-xs">{range}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PredictedCapacityGraph;
