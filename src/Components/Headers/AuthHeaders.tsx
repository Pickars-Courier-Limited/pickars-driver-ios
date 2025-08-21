import React, {useState, useRef, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Pressable,
  View,
  Animated,
  Easing,
  Text,
  Platform,
} from 'react-native';
import {Colors} from '../Colors/Colors';
import InfoIcon from '../Icons/Info/InfoIcon';
import ArrowLeftIcon from '../Icons/Arrows/ArrowLeftIcon';
import {BoldText, RegularText} from '../Texts/CustomTexts/BaseTexts';
import {useNavigation} from '@react-navigation/native';
import CancelIcon from '../Icons/CancelIcon/CancelIcon';

interface AuthHeadersProps {
  navigation?: {goBack: () => void};
  title?: string;
  infoText?: string;
  modal?: boolean;
  onClick?: () => void;
  navigationSpecific?: () => void;
  navigationSpecificRoute?: boolean;
}

const AuthHeaders: React.FC<AuthHeadersProps> = ({
  modal,
  navigation,
  navigationSpecific,
  navigationSpecificRoute = false,
  title = 'Create an Account',
  infoText = 'This is some sample info displayed below the header. Click the icon again to hide.',
  onClick,
}) => {
  const [isInfoVisible, setInfoVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const navigationFunction = useNavigation();

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: isInfoVisible ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [isInfoVisible]);

  const handleGoBack = () => {
    if (navigationSpecificRoute) {
      navigationSpecific;
      //navigationFunction.navigate(navigationSpecific as never);
    } else {
      if (navigation?.goBack) {
        navigation.goBack();
      } else if (modal) {
        onClick?.();
      } else {
        navigationFunction.goBack();
      }
    }
  };

  const renderInfoText = (text: string) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <BoldText key={index} fontSize={16} color={Colors.primaryColor}>
            {part.replace(/\*\*/g, '')}
          </BoldText>
        );
      }
      return (
        <RegularText key={index} fontSize={16} color={Colors.primaryColor}>
          {part}
        </RegularText>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {!modal && (
          <Pressable onPress={handleGoBack}>
            <ArrowLeftIcon width={30} height={30} color={Colors.grayColor} />
          </Pressable>
        )}

        <BoldText fontSize={16} color={Colors.grayColor} style={styles.title}>
          {title}
        </BoldText>

        {modal ? (
          <Pressable onPress={handleGoBack}>
            <CancelIcon width={30} height={30} color={Colors.grayColor} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setInfoVisible(prev => !prev)}
            style={[
              styles.infoButton,
              isInfoVisible && styles.infoButtonActive,
            ]}>
            <InfoIcon
              width={30}
              height={30}
              color={isInfoVisible ? Colors.whiteColor : Colors.whiteColor}
            />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AuthHeaders;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.whiteColor,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,

    paddingBottom: Platform.OS === 'android' ? 6 : 12,

    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  infoButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 4,
  },
  infoButtonActive: {
    backgroundColor: Colors.primaryColor,
  },
  infoContainer: {
    backgroundColor: Colors.fadedPrimaryColor,
    overflow: 'hidden',
    padding: 16,
  },
});
