import React from 'react';

interface GraphContainerProps {
  width?: string;
  height?: string;
}

const GraphContainer: React.FC<GraphContainerProps> = ({ width = '24.531vw', height = '13.49vw' }) => {
  return (
    <div>
      <div style={{ width, height }} data-testid="graph-container" className={`card w-[${width}] h-[${height}] bg-[#EBEBEB] rounded-[20px]`} />
    </div>
  );
}

export default GraphContainer;
