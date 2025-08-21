import React, {useState} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Pressable,
  Text,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {Colors} from '../Colors/Colors';
import {RegularText} from '../Texts/CustomTexts/BaseTexts'; // Import your custom text component

interface CustomTextInputProps {
  label: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean; // Optional for password input
  width?: string | number; // Accepts string or number for width
  error?: string; // Error message
  errorColor?: string; // Custom error color
  value?: string;
}

interface PhoneNumberInputProps {
  label: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  width?: string | number; // Accepts string or number for width
  error?: string; // Error message
  errorColor?: string; // Custom error color
  value?: string;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  placeholder,
  onChangeText,
  isPassword = false,
  width = '100%', // Default width is 100%
  error,
  value,
  errorColor = Colors.errorColor, // Default error color
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false); // Add state for focus

  // Determine border and label color based on error state
  const borderColor = error
    ? errorColor
    : isFocused
      ? Colors.primaryColor
      : Colors.grayColor65;
  const labelColor = error
    ? errorColor
    : isFocused
      ? Colors.primaryColor
      : Colors.grayColor;

  return (
    <View style={[styles.container, {width} as any]}>
      <RegularText
        fontSize={16}
        color={labelColor} // Change color based on focus or error state
        style={styles.label} // Add style prop for top margin
      >
        {label}
      </RegularText>
      <View style={[styles.inputContainer, {borderColor}]}>
        {isPassword ? (
          <>
            <TextInput
              value={value}
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor={Colors.grayColor65}
              secureTextEntry={!showPassword}
              onChangeText={onChangeText}
              onFocus={() => setIsFocused(true)} // Set focus state to true
              onBlur={() => setIsFocused(false)} // Set focus state to false
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.togglePassword}>
              <Text style={styles.togglePasswordText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </Pressable>
          </>
        ) : (
          <TextInput
            value={value}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={Colors.grayColor65}
            onChangeText={onChangeText}
            onFocus={() => setIsFocused(true)} // Set focus state to true
            onBlur={() => setIsFocused(false)} // Set focus state to false
          />
        )}
      </View>
      {error && (
        <RegularText fontSize={14} color={errorColor} style={styles.errorText}>
          {error}
        </RegularText>
      )}
    </View>
  );
};

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  label,
  placeholder,
  onChangeText,
  width = '100%',
  error,
  value,
  errorColor = Colors.errorColor, // Default error color
}) => {
  const [isFocused, setIsFocused] = useState(false); // Add state for focus

  // Determine border and label color based on error state
  const borderColor = error
    ? errorColor
    : isFocused
      ? Colors.primaryColor
      : Colors.grayColor65;
  const labelColor = error
    ? errorColor
    : isFocused
      ? Colors.primaryColor
      : Colors.grayColor;
  const {fontScale} = useWindowDimensions();
  return (
    <View style={[styles.container, {width} as any]}>
      <RegularText
        fontSize={16}
        color={labelColor} // Change color based on focus or error state
        style={styles.label} // Add style prop for top margin
      >
        {label}
      </RegularText>
      <View style={[styles.phoneInputContainer, {borderColor}]}>
        <View style={styles.flagContainer}>
          <Text style={styles.flagText}>🇳🇬</Text>
          <Text style={styles.countryCode}>+234</Text>
        </View>
        <TextInput
          allowFontScaling={false}
          value={value}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.grayColor65}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)} // Set focus state to true
          onBlur={() => setIsFocused(false)} // Set focus state to false
        />
      </View>
      {error && (
        <RegularText fontSize={14} color={errorColor} style={styles.errorText}>
          {error}
        </RegularText>
      )}
    </View>
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    marginTop: 17, // Apply top margin of 23
  },
  inputContainer: {
    borderWidth: 0.7,
    borderRadius: 16,
    padding: Platform.OS === 'android' ? 6 : 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 4 : 3,
  },
  phoneInputContainer: {
    borderWidth: 0.7,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Platform.OS === 'android' ? 6 : 14,
        marginTop: Platform.OS === 'android' ? 4 : 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.grayColor, // Input text color when typing
    fontFamily: Platform.OS === 'android' ? 'LufgaRegular' : 'Lufga-Regular',
    // Set font family to Lufga Regular
  },
  togglePassword: {
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  togglePasswordText: {
    color: Colors.grayColor,
    fontSize: 14, // Reduced font size to 14
    fontFamily: Platform.OS === 'android' ? 'LufgaRegular' : 'Lufga-Regular',
    // Set font family to Lufga Regular
  },
  flagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  flagText: {
    fontSize: 20,
  },
  countryCode: {
    color: Colors.grayColor,
    fontSize: 16,
    fontFamily: Platform.OS === 'android' ? 'LufgaRegular' : 'Lufga-Regular',
    // Set font family to Lufga Regular
  },
  errorText: {
    //fontSize: 14,
    marginTop: 4, // Spacing between input and error message
    fontFamily: Platform.OS === 'android' ? 'LufgaRegular' : 'Lufga-Regular',
    // Set font family for error text
  },
});
