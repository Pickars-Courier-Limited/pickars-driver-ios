import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Animated,
  Easing,
  Vibration,
  Platform,
} from 'react-native';
import {BoldText, RegularText} from '../Texts/CustomTexts/BaseTexts';
import SuccessIcon from '../Icons/SuccessIcon/SuccessIcon';
import ErrorIcon from '../Icons/ErrorIcon/ErrorIcon';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  title?: string; // Optional title for error
  description?: string; // Optional error description
  onRetry?: () => void; // Optional retry function
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  title,
  description,
  onRetry,
}) => {
  const {width} = useWindowDimensions();
  //const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(new Animated.Value(0)); // Progress bar value
  const [slideAnim] = useState(new Animated.Value(0)); // Slide in/out animation value for Y-axis
  const [shakeAnim] = useState(new Animated.Value(0)); // Shake animation value

  useEffect(() => {
    // Slide-in animation from top to bottom
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 30,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    // Start the timer and animate the progress bar
    Animated.timing(progress, {
      toValue: 1,
      duration: 1700, // 10 seconds for the progress
      easing: Easing.out(Easing.ease), // Apply ease-out easing function for smooth animation
      useNativeDriver: false,
    }).start();

    // Hide the toast after 10 seconds
    const timer = setTimeout(() => dismissToast(), 1700);

    return () => clearTimeout(timer);
  }, []);

  const dismissToast = () => {
    // Slide-out animation to the top
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    setTimeout(() => 500); // Wait for the slide-out animation to finish
  };

  // Handle toast shake effect
  //   const shakeToast = () => {
  //     Vibration.vibrate(100); // Optional: trigger vibration for feedback
  //     Animated.sequence([
  //       Animated.timing(shakeAnim, {
  //         toValue: 15,
  //         duration: 100,
  //         easing: Easing.ease,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(shakeAnim, {
  //         toValue: -15,
  //         duration: 100,
  //         easing: Easing.ease,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(shakeAnim, {
  //         toValue: 15,
  //         duration: 100,
  //         easing: Easing.ease,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(shakeAnim, {
  //         toValue: 0,
  //         duration: 100,
  //         easing: Easing.ease,
  //         useNativeDriver: true,
  //       }),
  //     ]).start();
  //   };

  // If toast is not visible, return null early, but ensure all hooks are still executed
  //if (!isVisible) return null;

  // Check if the toast is already visible and shake it if triggered again
  //   useEffect(() => {
  //     if (isVisible) {
  //       shakeToast(); // Trigger the shake effect when the toast is visible
  //     }
  //   }, [message]); // Whenever the message changes, check and trigger the shake effect

  // Define emoji arrays
  const successEmojis = ['🥹', '🥰', '😘', '😍', '☺️', '😊', '😎', '🥳', '🤭'];

  const errorEmojis = [
    '🤯',
    '😳',
    '😩',
    '😒',
    '🙂‍↕️',
    '🙄',
    '😵',
    '🥱',
    '😲',
    '🫡',
    '🤕',
    '🤒',
  ];

  // Randomly select an emoji based on the type
  const getRandomEmoji = (type: 'success' | 'error') => {
    const emojis = type === 'success' ? successEmojis : errorEmojis;
    const randomIndex = Math.floor(Math.random() * emojis.length);
    return emojis[randomIndex];
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          width: width,
          transform: [
            {translateY: slideAnim}, // Slide animation applied here
            {translateX: shakeAnim}, // Shake effect applied here
          ],
        },
        type === 'success' ? styles.success : styles.error,
      ]}>
      {/* Title (optional) */}
      {/* <View style={{marginTop: 4, marginBottom: 8}}>
        {type === 'success' ? (
          <SuccessIcon size={28} color="#ffffff50" />
        ) : (
          <ErrorIcon size={28} color="#ffffff50" />
        )}
      </View> */}
      {title && (
        <BoldText style={styles.toastTitle}>
          {title}

          {/* {getRandomEmoji(type)} */}
        </BoldText>
      )}

      {/* Message */}
      <RegularText style={styles.toastText}>{message}</RegularText>

      {/* Description (optional) */}
      {description && (
        <RegularText style={styles.toastDescription}>{description}</RegularText>
      )}

      {/* Dismiss Button */}
      <TouchableOpacity style={styles.retryButton} onPress={dismissToast}>
        <RegularText style={styles.retryButtonText}>Dismiss</RegularText>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
    borderRadius: 0,
    zIndex: 9999,
    minHeight: 120,
    width: '100%',
    paddingTop: Platform.OS === 'android' ? 24 : 64,
  },
  success: {
    backgroundColor: '#16AD2A', // Green
  },
  error: {
    backgroundColor: '#ff0000', // Red
  },
  toastText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'left', // Align text to the left
    marginBottom: 5,
  },
  toastTitle: {
    color: 'white',
    fontSize: 17,
    //fontWeight: 'bold',
    textAlign: 'left', // Align title to the left
    marginBottom: 5,
    marginTop: 6,
  },
  toastDescription: {
    color: 'white',
    fontSize: 13,
    textAlign: 'left', // Align description to the left
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#ffffff35',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 12,
    borderRadius: 48,
    width: '100%', // Make retry button full-width
  },
  retryButtonText: {
    color: '#fff', // White color for retry button
    fontSize: 14,
    textAlign: 'center',
  },
});

export default Toast;
