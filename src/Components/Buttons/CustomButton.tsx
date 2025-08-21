import React from 'react';
import {
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import {Colors} from '../Colors/Colors'; // Update the path as necessary
import {RegularText} from '../Texts/CustomTexts/BaseTexts'; // Update the path as necessary

interface CustomButtonProps {
  title: string | React.ReactNode; // Updated to support both text and JSX elements
  onPress: () => void; // Function to call on button press
  loading?: boolean; // Loading state
  disabled?: boolean; // Disable button
  width?: string | number; // Accepts string or number for width
  marginTop?: number; // Optional margin top
  backgroundColors?: string; // Optional background colors
  textColor?: string; // Optional text color
  alignSelf?: any;
  borderColor?: any;
  borderWidth?: any; // Optional borderWidth
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  width,
  marginTop = 16, // Default marginTop set to 16 for better spacing
  backgroundColors,
  textColor,
  alignSelf,
  borderColor,
  borderWidth,
}) => {
  // Determine background color based on loading or disabled state
  const backgroundColor =
    loading || disabled ? Colors.grayColor65 : Colors.primaryColor;
  const finalTextColor = textColor || Colors.whiteColor; // Use passed textColor or default to white

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress} // Prevent action when loading or disabled
      style={[
        styles.button,
        {
          borderWidth: borderWidth || 0,
          borderColor: borderColor,
          alignSelf: alignSelf || 'stretch',
          marginTop: marginTop,
          backgroundColor: backgroundColors || backgroundColor,
          width: width || '100%', // Ensure button width is always 100%
        } as StyleProp<ViewStyle>,
      ]}
      disabled={disabled} // Disable button
    >
      {loading ? (
        <ActivityIndicator color={finalTextColor} /> // Show loading spinner
      ) : (
        <RegularText fontSize={16} color={finalTextColor}>
          {title}
        </RegularText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 48,
    paddingVertical: 19, // Adjust for vertical padding
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch', // Ensure it takes full width of the parent
  } as ViewStyle,
});

export default CustomButton;
