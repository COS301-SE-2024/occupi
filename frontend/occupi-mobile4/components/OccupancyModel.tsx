import React, { useRef } from 'react';
import { View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { Box } from '@react-three/drei/native';
import { useColorScheme } from 'react-native';
import { useTheme } from '@/components/ThemeContext';

const Floor = ({ position, scale, color }) => {
  return (
    <Box position={position} scale={scale}>
      <meshStandardMaterial color={color} />
    </Box>
  );
};

const Building = ({ occupancyData, buildingWidth, buildingHeight }) => {
  const floorHeight = buildingHeight / occupancyData.length;

  const getColorForOccupancy = (occupancy) => {
    if (occupancy >= 0.8) return '#FF0000'; // Red
    if (occupancy >= 0.6) return '#FFA500'; // Orange
    if (occupancy >= 0.4) return '#FFFF00'; // Yellow
    if (occupancy >= 0.2) return '#90EE90'; // Light Green
    return '#008000'; // Green
  };

  return (
    <group>
      {occupancyData.map((item, index) => (
        <Floor
          key={index}
          position={[0, index * floorHeight - buildingHeight / 2 + floorHeight / 2, 0]}
          scale={[buildingWidth, floorHeight * 0.95, buildingWidth / 2]}
          color={getColorForOccupancy(item.occupancy)}
        />
      ))}
    </group>
  );
};

const Scene = ({ occupancyData }) => {
  const ref = useRef();

  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.2;
  });

  return (
    <group ref={ref}>
      <Building occupancyData={occupancyData} buildingWidth={1} buildingHeight={2} />
    </group>
  );
};

const OccupancyModel = ({ occupancyData }) => {
  const colorScheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorScheme : theme;
  const isDarkMode = currentTheme === 'dark';

  if (!occupancyData || occupancyData.length === 0) {
    return null;
  }

  return (
    <View style={{ width: 300, height: 400 }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Scene occupancyData={occupancyData} />
      </Canvas>
    </View>
  );
};

export default OccupancyModel;