import React from 'react';
import {Text, StyleSheet, useWindowDimensions, Platform} from 'react-native';
import {Colors} from '../../Colors/Colors';

// Extend TextProps to include style
type TextProps = {
  children: React.ReactNode; // The text content
  fontSize?: number; // Optional font size (default is 16)
  color?: string; // Optional color (default is specific to each text type)
  style?: object; // Allow custom styles
};

// Base component to handle scaling with `fontScale` and common styling
const BaseText: React.FC<TextProps & {fontFamily: string}> = ({
  children,
  fontSize = 16,
  color,
  fontFamily,
  style, // Accept style prop
}) => {
  const {fontScale} = useWindowDimensions(); // Get the font scale from the dimensions

  // Adjust font size based on fontScale
  const scaledFontSize = fontSize;

  return (
    <Text
      allowFontScaling={false}
      style={[
        styles.baseText,
        {fontFamily, fontSize: scaledFontSize, color},
        style,
      ]} // Apply custom styles
    >
      {children}
    </Text>
  );
};
// BlackText component
export const BlackText: React.FC<TextProps> = ({
  fontSize,
  color = Colors.headerColor,
  children,
  style, // Accept style prop
}) => {
  return (
    <BaseText
      fontFamily={Platform.OS === 'android' ? 'LufgaBlack' : 'Lufga-Black'}
      fontSize={fontSize}
      color={color}
      style={style}>
      {children}
    </BaseText>
  );
};
// ExtraBoldText component
export const ExtraBoldText: React.FC<TextProps> = ({
  fontSize,
  color = Colors.headerColor,
  children,
  style, // Accept style prop
}) => {
  return (
    <BaseText
      fontFamily={
        Platform.OS === 'android' ? 'LufgaExtraBold' : 'Lufga-ExtraBold'
      }
      fontSize={fontSize}
      color={color}
      style={style}>
      {children}
    </BaseText>
  );
};

// BoldText component
export const BoldText: React.FC<TextProps> = ({
  fontSize,
  color = Colors.headerColor,
  children,
  style, // Accept style prop
}) => {
  return (
    <BaseText
      fontFamily={Platform.OS === 'android' ? 'LufgaBold' : 'Lufga-Bold'}
      fontSize={fontSize}
      color={color}
      style={style}>
      {children}
    </BaseText>
  );
};

// MediumText component
export const MediumText: React.FC<TextProps> = ({
  fontSize,
  color = Colors.grayColor,
  children,
  style, // Accept style prop
}) => {
  return (
    <BaseText
      fontFamily={Platform.OS === 'android' ? 'LufgaMedium' : 'Lufga-Medium'}
      fontSize={fontSize}
      color={color}
      style={style}>
      {children}
    </BaseText>
  );
};

// SemiBoldText component
export const SemiBoldText: React.FC<TextProps> = ({
  fontSize,
  color = Colors.grayColor,
  children,
  style, // Accept style prop
}) => {
  return (
    <BaseText
      fontFamily={
        Platform.OS === 'android' ? 'LufgaSemiBold' : 'Lufga-SemiBold'
      }
      fontSize={fontSize}
      color={color}
      style={style}>
      {children}
    </BaseText>
  );
};

// RegularText component
export const RegularText: React.FC<TextProps> = ({
  fontSize,
  color = Colors.grayColor,
  children,
  style, // Accept style prop
}) => {
  return (
    <BaseText
      fontFamily={Platform.OS === 'android' ? 'LufgaRegular' : 'Lufga-Regular'}
      fontSize={fontSize}
      color={color}
      style={style}>
      {children}
    </BaseText>
  );
};

// LightText component
export const LightText: React.FC<TextProps> = ({
  fontSize,
  color = Colors.grayColor,
  children,
  style, // Accept style prop
}) => {
  return (
    <BaseText
    fontFamily={Platform.OS === 'android' ? 'LufgaLight' : 'Lufga-Light'}
      fontSize={fontSize}
      color={color}
      style={style}>
      {children}
    </BaseText>
  );
};

// Common styles
const styles = StyleSheet.create({
  baseText: {
    // Add common styles if needed (e.g., text alignment, margin)
  },
});
