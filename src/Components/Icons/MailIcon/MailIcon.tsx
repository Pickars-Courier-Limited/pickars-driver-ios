import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface MailIconProps {
  size?: number; // Size of the icon
  color?: string; // Color of the icon
}

const MailIcon: React.FC<MailIconProps> = ({ size = 24, color = '#000000' }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none" // Ensure fill is explicitly set to none
    >
      <Path
        d="M22,8.32V18a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V8.69L4,9.78l7.52,4.1A1,1,0,0,0,12,14a1,1,0,0,0,.5-.14L20,9.49Z"
        fill={color}
      />
      <Path
        d="M22,6h0L20,7.18l-8,4.67L4,7.5,2,6.4V6A2,2,0,0,1,4,4H20A2,2,0,0,1,22,6Z"
        fill={color}
      />
    </Svg>
  );
};

export default MailIcon;