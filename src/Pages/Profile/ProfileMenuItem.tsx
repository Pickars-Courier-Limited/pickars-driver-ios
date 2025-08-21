// src/Components/ProfileMenuItem/ProfileMenuItem.tsx
import React from 'react';
import {TouchableOpacity, StyleSheet, View, Linking} from 'react-native';
// import IconsContainer from '../Icons/IconContainer'; // Adjust path as per your project structure
// import ArrowRightIcon from '../Icons/Arrows/ArrowRightIcon'; // Adjust path as per your project structure
// import {Colors} from '../Colors/Colors'; // Adjust path as per your project structure
import {
    BoldText,
    RegularText,
    SemiBoldText,
  } from '../../Components/Texts/CustomTexts/BaseTexts';
import { Colors } from '../../Components/Colors/Colors';
import ArrowRightIcon from '../../Components/Icons/Arrows/ArrowRightIcon';
import IconsContainer from '../../Components/Icons/IconContainer';

interface ProfileMenuItemProps {
  label: string;
  onPress?: () => void; // onPress is optional if type is 'external'
  textColor?: string;
  iconColor?: string;
  type?: 'internal' | 'external';
  screen?: string; // For external links
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  label,
  onPress,
  textColor = Colors.headerColor,
  iconColor = Colors.grayColor,
  type = 'internal', // Default to internal if not specified
  screen,
}) => {
  const handlePress = () => {
    if (type === 'external' && screen) {
      Linking.openURL(screen).catch(err => console.error("Couldn't load page", err));
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <RegularText fontSize={16} color={textColor}>
        {label}
      </RegularText>
      <IconsContainer
        backgroundColor={Colors.grayColorFaded}
        IconComponent={ArrowRightIcon}
        iconColor={iconColor}
        iconWidth={16}
        iconHeight={16}
        padding={20}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    backgroundColor: Colors.whiteColor,
    borderRadius: 24,
  },
});

export default ProfileMenuItem;