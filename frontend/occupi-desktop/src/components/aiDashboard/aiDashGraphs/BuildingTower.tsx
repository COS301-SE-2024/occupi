import React, { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { Vector3, Group, Color } from "three";

interface FloorProps {
  position: [number, number, number];
  maxOccupancy: number;
  totalBookings: number;
  floorNumber: number;
  width: number;
  depth: number;
}

interface Room {
  floorNo: string;
  maxOccupancy?: number;
  count: number;
}

const Floor: React.FC<FloorProps> = ({
  position,
  maxOccupancy,
  totalBookings,
  floorNumber,
  width,
  depth,
}) => {
  const [, setHovered] = useState(false);

  const getColor = (value: number, max: number): Vector3 => {
    const ratio = value / max;
    const colors = [
      [0.2, 0.8, 0.2], // Green (0-20%)
      [0.5, 0.8, 0.2], // Yellow-green (21-40%)
      [0.8, 0.8, 0.2], // Yellow (41-60%)
      [0.8, 0.5, 0.2], // Orange (61-80%)
      [0.8, 0.2, 0.2], // Red (81-100%)
    ];
    const index = Math.min(Math.floor(ratio * 5), 4);
    return new Vector3(...colors[index]);
  };

  return (
    <group position={new Vector3(...position)}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[width, 1, depth]} />
        <meshStandardMaterial
          color={new Color().fromArray(
            getColor(totalBookings, maxOccupancy).toArray()
          )}
        />
      </mesh>
      <Text
        position={[0, 0, depth / 2 + 0.2]}
        // rotation={[0, Math.PI, 0]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {`Floor ${floorNumber}`}
      </Text>
      <Text
        position={[0, 0, -depth / 2 - 0.2]}
        fontSize={0.3}
        rotation={[0, Math.PI, 0]}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {`Bookings: ${totalBookings}/${maxOccupancy}`}
      </Text>
    </group>
  );
};

interface BuildingProps {
  floors: { maxOccupancy: number; totalBookings: number }[];
}

const Building: React.FC<BuildingProps> = ({ floors }) => {
  const groupRef = useRef<Group>(null);
  const baseWidth = 6;
  const baseDepth = 6;
  const shrinkFactor = 0.1;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {floors.map(({ maxOccupancy, totalBookings }, index) => {
        const width = baseWidth - index * shrinkFactor;
        const depth = baseDepth - index * shrinkFactor;
        return (
          <Floor
            key={index}
            position={[0, index * 1.2, 0]}
            maxOccupancy={maxOccupancy}
            totalBookings={totalBookings}
            floorNumber={index}
            width={width}
            depth={depth}
          />
        );
      })}
    </group>
  );
};

const BuildingTower: React.FC = () => {
  const [floorData, setFloorData] = useState<
    { maxOccupancy: number; totalBookings: number }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsResponse, bookingsResponse] = await Promise.all([
          fetch("/api/view-rooms"),
          fetch("/analytics/top-bookings"),
        ]);

        if (!roomsResponse.ok || !bookingsResponse.ok) {
          throw new Error("Network response was not ok");
        }

        const roomsData = await roomsResponse.json();
        const bookingsData = await bookingsResponse.json();

        if (
          !Array.isArray(roomsData.data) ||
          !Array.isArray(bookingsData.data)
        ) {
          throw new Error("Data is not in the expected format");
        }

        const rooms: Room[] = roomsData.data;
        const bookings: Room[] = bookingsData.data;

        // Combine room and booking data
        const floorMap = new Map<
          string,
          { maxOccupancy: number; totalBookings: number }
        >();

        rooms.forEach((room: Room) => {
          const floor = room.floorNo;
          if (!floorMap.has(floor)) {
            floorMap.set(floor, { maxOccupancy: 0, totalBookings: 0 });
          }
          const floorInfo = floorMap.get(floor)!;
          floorInfo.maxOccupancy += room.maxOccupancy || 0;
        });

        bookings.forEach((booking: Room) => {
          const floor = booking.floorNo;
          if (floorMap.has(floor)) {
            const floorInfo = floorMap.get(floor)!;
            // Ensure totalBookings doesn't exceed maxOccupancy
            floorInfo.totalBookings = Math.min(
              floorInfo.totalBookings + booking.count,
              floorInfo.maxOccupancy
            );
          }
        });

        // Convert map to array and sort by floor number
        const sortedFloorData = Array.from(floorMap.entries())
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([, data]) => data);

        setFloorData(sortedFloorData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again later.");
      }
    };

    fetchData();
  }, []);

  // Add touch event handlers
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (floorData.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{ width: "100%", height: "100%", minHeight: "500px" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <Canvas
        camera={{ position: [15, 15, 15], fov: 50 }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener(
            "touchstart",
            (e) => e.preventDefault(),
            { passive: false }
          );
          gl.domElement.addEventListener(
            "touchmove",
            (e) => e.preventDefault(),
            { passive: false }
          );
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <Building floors={floorData} />
        <OrbitControls
          target={[0, (floorData.length * 1.2) / 2, 0]}
          maxPolarAngle={Math.PI / 2}
          enableDamping={false}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
        />
      </Canvas>
    </div>
  );
};

export default BuildingTower;
