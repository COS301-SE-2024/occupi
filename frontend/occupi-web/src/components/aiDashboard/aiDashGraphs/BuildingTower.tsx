import { useState, useRef } from 'react';
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

function Floor({ position, occupancy, floorNumber, width, depth }: FloorProps) {
  const [, setHovered] = useState(false)

  const getColor = (value: number) => {
    const colors = [
      [0.2, 0.8, 0.2], // Green (1)
      [0.5, 0.8, 0.2], // Yellow-green (2)
      [0.8, 0.8, 0.2], // Yellow (3)
      [0.8, 0.5, 0.2], // Orange (4)
      [0.8, 0.2, 0.2] // Red (5)
    ]
    const index = Math.max(0, Math.min(Math.floor(value) - 1, 4))
    return new Vector3(...colors[index])
  }

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
      >
        {`Floor ${floorNumber}`}
      </Text>
      <Text
        position={[-width / 2 - 0.2, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.2}
        color="black"
      >
        {`Occupancy: ${occupancy}/5`}
      </Text>
      <Text
        position={[0, 0, depth / 2 + 0.2]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.2}
        color="black"
      >
        {`Floor ${floorNumber}`}
      </Text>
      <Text
        position={[0, 0, -depth / 2 - 0.2]}
        fontSize={0.2}
        color="black"
      >
        {`Occupancy: ${occupancy}/5`}
      </Text>
    </group>
  )
}

interface BuildingProps {
  floors: number[];
}

function Building({ floors }: BuildingProps) {
  const groupRef = useRef<Group>(null)
  const baseWidth = 4
  const baseDepth = 4
  const shrinkFactor = 0.05

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002 // Adjust this value to change rotation speed
    }
  })

  return (
    <group ref={groupRef}>
      {floors.map((occupancy: number, index: number) => {
        const width = baseWidth - index * shrinkFactor
        const depth = baseDepth - index * shrinkFactor
        return (
          <Floor
            key={index}
            position={[0, index * 0.6, 0]}
            occupancy={occupancy}
            floorNumber={floors.length - index}
            width={width}
            depth={depth}
          />
        )
      })}
    </group>
  )
}

export default function BuildingTower() {
  const occupancyData = [5, 4, 3, 3, 2, 2, 1]

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f0f0f0' }}>
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <color attach="background" args={['#87CEEB']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <Building floors={occupancyData} />
        <OrbitControls target={[0, 2, 0]} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  )
}