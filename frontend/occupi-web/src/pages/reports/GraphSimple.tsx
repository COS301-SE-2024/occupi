import React, { useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import domtoimage from 'dom-to-image';

// Sample data
const data = [
  { name: 'Occupied', value: 400 },
  { name: 'Vacant', value: 300 },
];

// Colors
const COLORS = ['#0088FE', '#00C49F'];

const SimplePieChart: React.FC = () => {
  // Define the ref with the correct type, including null as an acceptable value
  const chartRef = useRef<HTMLDivElement | null>(null);

  const downloadImage = () => {
    if (chartRef.current) {
      domtoimage.toPng(chartRef.current)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'my-image-name.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((error) => {
          console.error('oops, something went wrong!', error);
        });
    } else {
      console.error('Chart ref is null');
    }
  };

  return (
    <div>
      <button onClick={downloadImage}>Download Image</button>
      <div ref={chartRef}>
        <PieChart width={400} height={400}>
          <Pie
            data={data}
            cx={200}
            cy={200}
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {
              data.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
            }
          </Pie>
          <Tooltip />
        </PieChart>
      </div>
    </div>
  );
};

export default SimplePieChart;
