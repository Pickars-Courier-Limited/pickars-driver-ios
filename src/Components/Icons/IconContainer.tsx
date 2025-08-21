import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, ViewStyle} from 'react-native';

interface IconProps {
  color?: string;
  width?: number;
  height?: number;
  fill?: any;
}

interface IconsContainerProps {
  onPress?: any;
  backgroundColor: any;
  IconComponent: React.FC<IconProps>; // Accepts an icon component with props for color, width, and height
  iconColor?: string;
  iconWidth?: number;
  iconHeight?: number;
  borderColor?: string; // Optional border color
  borderWidth?: number; // Optional border width
  borderRadius?: number; // Optional border radius
  padding?: number; // Optional padding value
  blinking?: boolean; // Enable border blinking animation
}

const IconsContainer: React.FC<IconsContainerProps> = ({
  backgroundColor,
  IconComponent,
  iconColor = '#000', // Default icon color if not specified
  iconWidth = 24, // Default icon width if not specified
  iconHeight = 24, // Default icon height if not specified
  borderColor = 'transparent', // Default border color if not specified
  borderWidth = 0, // Default border width if not specified
  borderRadius, // Optional border radius
  padding = 32, // Default padding value if not specified
  blinking = false, // Default no blinking
  onPress 
}) => {
  const borderOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (blinking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(borderOpacity, {
            toValue: 0.2,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(borderOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    } else {
      borderOpacity.setValue(1); // Reset opacity when blinking is false
    }
  }, [blinking]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          width: iconWidth + padding, // Icon width + specified padding
          height: iconHeight + padding, // Icon height + specified padding
          borderRadius:
            borderRadius !== undefined
              ? borderRadius
              : (iconWidth + padding) / 2, // Default to circular if not specified
          borderColor,
          borderWidth,
          opacity: borderOpacity, // Animated opacity for blinking effect
        },
      ]}>
      <IconComponent
        fill={iconColor}
        color={iconColor}
        width={iconWidth}
        height={iconHeight}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'solid', // Ensure the border is styled
  } as ViewStyle,
});

export default IconsContainer;
