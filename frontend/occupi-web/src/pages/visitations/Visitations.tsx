import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';

interface Floor {
  capacity: number;
  maxCapacity: number;
}

const Building: React.FC = () => {
  const [floors, setFloors] = useState<Floor[]>([
    { capacity: 0, maxCapacity: 50 },
    { capacity: 0, maxCapacity: 40 },
    { capacity: 0, maxCapacity: 30 },
    { capacity: 0, maxCapacity: 20 },
    { capacity: 0, maxCapacity: 10 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFloors(prevFloors =>
        prevFloors.map(floor => ({
          ...floor,
          capacity: Math.floor(Math.random() * (floor.maxCapacity + 1))
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getColor = (capacity: number, maxCapacity: number) => {
    const ratio = capacity / maxCapacity;
    if (ratio < 0.3) return 'green';
    if (ratio < 0.7) return 'yellow';
    return 'red';
  };

  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />
      {floors.map((floor, index) => (
        <Box
          key={index}
          position={[0, index * 1.2, 0]}
          args={[3, 1, 2]}
        >
          <meshStandardMaterial color={getColor(floor.capacity, floor.maxCapacity)} />
        </Box>
      ))}
    </Canvas>
  );
};

export default function OfficeHeatmap() {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Canvas>
        <Building />
      </Canvas>
    </div>
  );
}