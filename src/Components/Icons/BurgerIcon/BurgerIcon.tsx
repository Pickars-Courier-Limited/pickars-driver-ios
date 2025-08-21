import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BurgerIconProps {
  width?: number; // Optional width
  height?: number; // Optional height
  color?: string; // Optional color
}

const BurgerIcon: React.FC<BurgerIconProps> = ({
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
      <Path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" />
    </Svg>
  );
};

export default BurgerIcon;