import React from 'react';
import Svg, { G, Line } from 'react-native-svg'; // Import from react-native-svg

interface CancelIconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const CancelIcon: React.FC<CancelIconProps> = ({
  width = 32,
  height = 32,
  color = "#000000",
  ...props
}) => (
  <Svg
    viewBox="0 0 32 32"
    width={width}
    height={height}
    fill="none" // Remove fill if not needed, or adjust it
    {...props}
  >
    <G>
      <Line 
        x1="7" 
        x2="25" 
        y1="7" 
        y2="25" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <Line 
        x1="7" 
        x2="25" 
        y1="25" 
        y2="7" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </G>
  </Svg>
);

export default CancelIcon;