// src/DragItem.tsx
import React from 'react';
import { useDrag, DragSourceMonitor } from 'react-dnd';

export const DragItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'GRID_ITEM',
    item: { type: 'GRID_ITEM' },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} className={`opacity-${isDragging ? '50' : '100'}`}>
      {children}
    </div>
  );
};
