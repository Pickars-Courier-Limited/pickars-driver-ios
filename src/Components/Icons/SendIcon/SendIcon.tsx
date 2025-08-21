import React from 'react';
import { Svg, Path } from 'react-native-svg';

const SendIcon = ({ width = 16, height = 16, color = "#0F6DF9" }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M2.26781 4.44861C2.09448 2.89261 3.69648 1.74994 5.11181 2.42061L13.0745 6.19261C14.5998 6.91461 14.5998 9.08528 13.0745 9.80728L5.11181 13.5799C3.69648 14.2506 2.09515 13.1079 2.26781 11.5519L2.58781 8.66661H7.99981C8.17662 8.66661 8.34619 8.59637 8.47122 8.47135C8.59624 8.34632 8.66648 8.17675 8.66648 7.99994C8.66648 7.82313 8.59624 7.65356 8.47122 7.52854C8.34619 7.40351 8.17662 7.33328 7.99981 7.33328H2.58848L2.26781 4.44861Z" 
        fill={color}
      />
    </Svg>
  );
};

export default SendIcon;