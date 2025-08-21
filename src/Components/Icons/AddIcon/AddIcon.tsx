import React from 'react';
import { Svg, Path, G } from 'react-native-svg'; // Import G component

const AddIcon: React.FC<{ width?: number; height?: number; color?: string }> = ({
  width = 24,
  height = 24,
  color = '#292D32',
}) => (
  <Svg viewBox="0 0 24 24" width={width} height={height} fill="none">
    <G>
      <Path d="M8 12H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 16V8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </G>
  </Svg>
);

export default AddIcon;