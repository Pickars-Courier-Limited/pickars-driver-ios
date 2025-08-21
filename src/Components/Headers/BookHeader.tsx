import React, {useState, useRef, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Pressable,
  View,
  Animated,
  Easing,
  Text, // Import Text component
} from 'react-native';
import {Colors} from '../Colors/Colors';
import InfoIcon from '../Icons/Info/InfoIcon';
import ArrowLeftIcon from '../Icons/Arrows/ArrowLeftIcon';
import {
  BoldText,
  RegularText,
} from '../Texts/CustomTexts/BaseTexts';
import {useNavigation} from '@react-navigation/native';
import AddIcon from '../Icons/AddIcon/AddIcon';
import SendIcon from '../Icons/SendIcon/SendIcon';

interface BookHeadersProps {
  navigation?: {goBack: () => void};
  title?: string;
  infoText?: string;
  onPress?: () => void;
  isMaxDeliveryLocationsReached?: boolean;
}

const BookHeaders: React.FC<BookHeadersProps> = ({
  navigation,
  title = 'Create an Account',
  onPress,
  isMaxDeliveryLocationsReached,
  infoText = 'This is some sample info displayed below the header. Click the icon again to hide.',
}) => {
  const [isInfoVisible, setInfoVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const toggleInfo = () => {
    setInfoVisible(!isInfoVisible);
  };

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: isInfoVisible ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [isInfoVisible, scaleAnim]);

  const navigationFunction = useNavigation();
  const handleGoBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else {
      navigationFunction.goBack();
    }
  };

  // Function to render text with bold support
  const renderInfoText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
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
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isMaxDeliveryLocationsReached
            ? Colors.errorColor
            : Colors.whiteColor,
        },
      ]}>
      <View style={[styles.header]}>
        <Pressable onPress={handleGoBack}>
          <ArrowLeftIcon
            width={30}
            height={30}
            color={
              isMaxDeliveryLocationsReached
                ? Colors.whiteColor
                : Colors.grayColor
            }
          />
        </Pressable>

        {!isMaxDeliveryLocationsReached ? (
          <Pressable onPress={onPress} style={[styles.infoButton]}>
            <RegularText fontSize={16} color={Colors.grayColor}>
              {title}
            </RegularText>
            <AddIcon
              width={30}
              height={30}
              color={isInfoVisible ? Colors.grayColor : Colors.grayColor}
            />
          </Pressable>
        ) : (
          <RegularText fontSize={16} color={Colors.whiteColor}>
            Maximum of (5) Delivery Stops Reached
          </RegularText>
        )}
      </View>
    </SafeAreaView>
  );
};

export default BookHeaders;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.whiteColor,
  },
  header: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    // height: 50,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  infoButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 8,
    flexDirection: 'row',
    gap: 8,
  },
  infoButtonActive: {
    borderRadius: 14,
    backgroundColor: Colors.primaryColor,
  },
  infoContainer: {
    backgroundColor: Colors.fadedPrimaryColor,
    overflow: 'hidden',
    padding: 16,
  },
});
