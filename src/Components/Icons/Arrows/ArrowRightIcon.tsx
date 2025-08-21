import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ArrowRightIconProps {
  width?: number; // Optional width
  height?: number; // Optional height
  color?: string; // Optional color
}

const ArrowRightIcon: React.FC<ArrowRightIconProps> = ({
  width = 24, // Default width
  height = 24, // Default height
  color = 'currentColor', // Default color
}) => {
  return (
    <Svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill={color}
    >
      <Path
        d="M19.0001 10.0001L19.0003 19L17.0003 19L17.0002 12.0001L6.82833 12L10.7781 15.9497L9.36384 17.364L2.99988 11L9.36384 4.63603L10.7781 6.05025L6.82828 10L19.0001 10.0001Z"
        transform="rotate(180, 12, 12)"
      />
    </Svg>
  );
};

export default ArrowRightIcon;