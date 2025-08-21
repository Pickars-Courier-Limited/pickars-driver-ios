import React, {useEffect, useRef, useState} from 'react';
import {View, ImageBackground, Animated, StyleSheet} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import blurryImage from '../../../assets/images/static/blurr.png';
import {RegularText, BoldText} from '../Texts/CustomTexts/BaseTexts';
import RocketIcon from '../Icons/RocketIcon/RocketIcon'; // Adjust the path as needed

interface MessageCardProps {
  title: string;
  text: string;
  error?: boolean;
  display?: boolean; // New prop to control display timing
  buttonText1?: string;
  buttonText2?: string;
  onPress1?: () => void;
  onPress2?: () => void;
}

const MessageCard: React.FC<MessageCardProps> = ({
  title,
  text,
  error = false,
  display = false, // Default to false if not provided
}) => {
  const [isVisible, setIsVisible] = useState(display);
  const [showConfetti, setShowConfetti] = useState(false);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;

  const backgroundColor = error ? '#6C0506' : '#06540F'; // Red for error, green for success
  const loadingColor = error ? '#FF8587' : '#3FDF8C'; // Red for error, green for success

  // Rocket shake animation logic
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [shakeAnimation]);

  // Progress bar animation and auto-hide logic
  useEffect(() => {
    if (display) {
      Animated.timing(progressAnimation, {
        toValue: 1, // Represents 100% width
        duration: 4500, // Display for 4500 milliseconds
        useNativeDriver: false, // useNativeDriver is set to false since we're animating the width
      }).start(() => {
        setIsVisible(false); // Hide the component after the display duration
        if (!error) {
          setShowConfetti(true); // Show confetti effect only if there is no error
        }
      });
    }
  }, [display, progressAnimation, error]);

  if (!isVisible) return null; // Do not display the component once the loading completes or if it's not set to display

  return (
    <View style={[styles.container, {backgroundColor}]}>
      <ImageBackground source={blurryImage} style={styles.overlayImage}>
        <View style={styles.innerContainer}>
          <Animated.View style={{transform: [{translateX: shakeAnimation}]}}>
            <RocketIcon />
          </Animated.View>

          <View style={{flexDirection: 'column', marginLeft: 10}}>
            <BoldText fontSize={15} color="#fff">
              {title}
            </BoldText>
            <RegularText fontSize={12} color="#fff">
              {text}
            </RegularText>
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: loadingColor,
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </ImageBackground>
      {/* Show confetti only if error is false */}
      {showConfetti && !error && (
        <ConfettiCannon
          count={200}
          origin={{x: 0, y: 0}}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={3000}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  overlayImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  innerContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarContainer: {
    width: '90%',
    height: 10,
    backgroundColor: '#ffffff25',
    borderRadius: 5,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
});

export default MessageCard;