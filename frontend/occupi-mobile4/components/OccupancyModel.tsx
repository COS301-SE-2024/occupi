import React, { useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
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
  const floorHeight = buildingHeight / Math.max(occupancyData.length, 1);

  const getColorForOccupancy = (occupancy) => {
    if (occupancy >= 0.8) return '#FF0000'; // Red for high occupancy
    if (occupancy >= 0.6) return '#FFA500'; // Orange for moderate-high occupancy
    if (occupancy >= 0.4) return '#FFFF00'; // Yellow for medium occupancy
    if (occupancy >= 0.2) return '#90EE90'; // Light Green for low occupancy
    return '#008000'; // Green for very low occupancy
  };

  return (
    <group>
      {occupancyData.map((item, index) => (
        <Floor
          key={index}
          position={[0, index * floorHeight - buildingHeight / 2 + floorHeight / 2, 0]}
          scale={[buildingWidth, floorHeight * 0.97, buildingWidth / 2]}
          color={getColorForOccupancy(item.occupancy)}
        />
      ))}
    </group>
  );
};

const Scene = ({ occupancyData }) => {
  const ref = useRef();

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.8; // Rotates the building for a dynamic 3D effect
    }
  });

  return (
    <group ref={ref}>
      <Building occupancyData={occupancyData} buildingWidth={2} buildingHeight={4} />
    </group>
  );
};

const OccupancyModel = ({ occupancyData }) => {
  const colorScheme = useColorScheme();
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? colorScheme : theme;
  const isDarkMode = currentTheme === 'dark';
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
   

    if (!occupancyData || occupancyData.length === 0) {
      setError('No occupancy data available');
    } else if (!Array.isArray(occupancyData)) {
      setError('Invalid occupancy data format');
    } else {
      setError(null);
    }
  }, [occupancyData]);

  return (
    <View style={{ width: 300, height: 400, position: 'relative' }}>
      {error ? (
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Text style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}>{error}</Text>
        </View>
      ) : (
        <Canvas>
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} />
          <Scene occupancyData={occupancyData} />
        </Canvas>
      )}

    
    </View>
  );
};

export default OccupancyModel;
