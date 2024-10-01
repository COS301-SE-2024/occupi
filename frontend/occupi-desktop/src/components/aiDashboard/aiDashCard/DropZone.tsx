// src/DropZone.tsx
import React from 'react';
import { useDrop } from 'react-dnd';

// Define a generic interface for the dragged item
interface DragItem {
  type: string;
  [key: string]: unknown;  // Allow any additional properties
}

export const DropZone = <T extends DragItem>({ 
  onDrop, 
  children 
}: { 
  onDrop: (item: T) => void; 
  children?: React.ReactNode 
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'GRID_ITEM',
    drop: (item: T) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} className={`border-${isOver ? '2' : '0'} border-dashed border-gray-500`}>
      {children}
    </div>
  );
};