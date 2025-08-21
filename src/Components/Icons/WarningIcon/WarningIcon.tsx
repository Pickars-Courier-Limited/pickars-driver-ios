import React from 'react';
import {Svg, Path, Line, Circle} from 'react-native-svg';

interface WarningIconProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

const WarningIcon: React.FC<WarningIconProps> = ({
  width = 24,
  height = 24,
  color = '#666', // Default warning orange
  strokeWidth = 2,
}) => {
  return (
    <Svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 8L12 13" />
      <Line x1="12" y1="16" x2="12" y2="16" />
    </Svg>
  );
};

export default WarningIcon;