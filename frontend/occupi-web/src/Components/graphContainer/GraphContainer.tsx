import React from 'react';

interface GraphContainerProps {
  width?: string;
  height?: string;
}

const GraphContainer: React.FC<GraphContainerProps> = ({ width = '471px', height = '259px' }) => {
  return (
    <div>
      <div className={`card w-[${width}] h-[${height}] bg-[#EBEBEB] rounded-[20px]`} />
    </div>
  );
}

export default GraphContainer;
