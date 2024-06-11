import React from 'react';

interface GraphContainerProps {
  width?: string;
  height?: string;
  mainComponent?: JSX.Element;
}

const GraphContainer: React.FC<GraphContainerProps> = ({ width = '24.531vw', height = '13.49vw' ,mainComponent}) => {
  return (
    <div>
      <div style={{ width, height }} data-testid="graph-container" className={`card w-[${width}] h-[${height}] bg-transparent shadow-2xl rounded-[20px]`} >      {mainComponent}
      </div>
    </div>
  );
}

export default GraphContainer;
