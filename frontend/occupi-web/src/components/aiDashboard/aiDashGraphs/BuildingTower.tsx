import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Vector3, Group, Color } from 'three';

interface FloorProps {
  position: [number, number, number];
  occupancy: number;
  floorNumber: number;
  width: number;
  depth: number;
}

interface Room {
  floorNo: string;
  maxOccupancy: number;
}

const Floor: React.FC<FloorProps> = ({ position, occupancy, floorNumber, width, depth }) => {
  const [, setHovered] = useState(false);

  const getColor = (value: number): Vector3 => {
    const colors = [
      [0.2, 0.8, 0.2], // Green (1)
      [0.5, 0.8, 0.2], // Yellow-green (2)
      [0.8, 0.8, 0.2], // Yellow (3)
      [0.8, 0.5, 0.2], // Orange (4)
      [0.8, 0.2, 0.2]  // Red (5)
    ];
    const index = Math.max(0, Math.min(Math.floor(value) - 1, 4));
    return new Vector3(...colors[index]);
  };

  return (
    <group position={new Vector3(...position)}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[width, 0.5, depth]} />
        <meshStandardMaterial color={new Color().fromArray(getColor(occupancy).toArray())} />
      </mesh>
      <Text
        position={[width / 2 + 0.2, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {`Floor ${floorNumber}`}
      </Text>
      <Text
        position={[-width / 2 - 0.2, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {`Occupancy: ${occupancy}/5`}
      </Text>
      <Text
        position={[0, 0, depth / 2 + 0.2]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {`Floor ${floorNumber}`}
      </Text>
      <Text
        position={[0, 0, -depth / 2 - 0.2]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {`Occupancy: ${occupancy}/5`}
      </Text>
    </group>
  );
};

interface BuildingProps {
  floors: number[];
}

const Building: React.FC<BuildingProps> = ({ floors }) => {
  const groupRef = useRef<Group>(null);
  const baseWidth = 4;
  const baseDepth = 4;
  const shrinkFactor = 0.05;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {floors.map((occupancy: number, index: number) => {
        const width = baseWidth - index * shrinkFactor;
        const depth = baseDepth - index * shrinkFactor;
        return (
          <Floor
            key={index}
            position={[0, index * 0.6, 0]}
            occupancy={occupancy}
            floorNumber={floors.length - index}
            width={width}
            depth={depth}
          />
        );
      })}
    </group>
  );
};

const BuildingTower: React.FC = () => {
  const [occupancyData, setOccupancyData] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real scenario, you would fetch this data from your API
        const response = await fetch('/api/view-rooms');
        const data = await response.json();
        
        const rooms: Room[] = data.data;
        const highestFloor = Math.max(...rooms.map(room => parseInt(room.floorNo)));
        
        // Calculate occupancy for each floor
        const occupancy = Array(highestFloor + 1).fill(0);
        rooms.forEach((room: Room) => {
          const floor = parseInt(room.floorNo);
          occupancy[floor] = Math.max(occupancy[floor], room.maxOccupancy);
        });
        
        // Remove the ground floor (index 0) and reverse the array so the highest floor is first
        setOccupancyData(occupancy.slice(1).reverse());
      } catch (error) {
        console.error('Error fetching room data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <Building floors={occupancyData} />
        <OrbitControls target={[0, 2, 0]} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
};

export default BuildingTower;