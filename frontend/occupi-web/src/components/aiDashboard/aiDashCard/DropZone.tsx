// src/DropZone.tsx
import React from 'react';
import { useDrop } from 'react-dnd';

export const DropZone: React.FC<{ onDrop: (item: any) => void; children?: React.ReactNode }> = ({ onDrop, children }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'GRID_ITEM',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} className={`border-${isOver ? '2' : '0'} border-dashed border-gray-500`}>
      {children}
    </div>
  );
};
