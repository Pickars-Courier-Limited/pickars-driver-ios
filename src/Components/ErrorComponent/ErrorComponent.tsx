import React from 'react';
import {View, Text, TouchableOpacity, useWindowDimensions} from 'react-native';
import AuthHeaders from '../Headers/AuthHeaders';
import {BoldText, RegularText} from '../Texts/CustomTexts/BaseTexts';
import CustomButton from '../Buttons/CustomButton';
import ErrorIcon from '../Icons/ErrorIcon/ErrorIcon';
import CancelIcon from '../Icons/CancelIcon/CancelIcon';
import WarningIcon from '../Icons/WarningIcon/WarningIcon';
import IconsContainer from '../Icons/IconContainer';
import {Colors} from '../Colors/Colors';

interface ErrorComponentProps {
  errorMessage?: string;
  onReload: () => void;
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({
  errorMessage,
  onReload,
}) => {
  const {height} = useWindowDimensions();
  return (
    <View>
      {/* <AuthHeaders title="" infoText="" /> */}
      <View
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          gap: 24,
          height: height / 1.4,
        }}>
        <View></View>
        <View
          style={{
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <IconsContainer
            backgroundColor={Colors.grayColorFaded}
            IconComponent={WarningIcon}
            iconColor={Colors.grayColor}
            iconWidth={64}
            iconHeight={64}
            padding={64}
          />

          <BoldText
            style={{
              fontSize: 24,
              textAlign: 'center',
              marginBottom: 10,
              marginTop: 32,
            }}>
            Whoops !!!
          </BoldText>

          <RegularText
            style={{
              fontSize: 16,
              textAlign: 'center',
              marginBottom: 10,
            }}>
            {errorMessage}
          </RegularText>
          <CustomButton title="Try Again" onPress={onReload} />
        </View>
      </View>
    </View>
  );
};

export default ErrorComponent;
