import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface PendingIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const PendingIcon: React.FC<PendingIconProps> = ({
  width = 24,
  height = 24,
  color = '#0F1F3C',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 1024 1024" fill="none">
      <Path
        d="M511.9 183c-181.8 0-329.1 147.4-329.1 329.1s147.4 329.1 329.1 329.1c181.8 0 329.1-147.4 329.1-329.1S693.6 183 511.9 183z m0 585.2c-141.2 0-256-114.8-256-256s114.8-256 256-256 256 114.8 256 256-114.9 256-256 256z"
        fill={color}
      />
      <Path
        d="M548.6 365.7h-73.2v161.4l120.5 120.5 51.7-51.7-99-99z"
        fill={color}
      />
    </Svg>
  );
};

export default PendingIcon;
