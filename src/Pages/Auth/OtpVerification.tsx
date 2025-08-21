import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import CustomTextInput from '../../Components/TextInputs/CustomTextInputs';
import CustomButton from '../../Components/Buttons/CustomButton';
import {Colors} from '../../Components/Colors/Colors';
import TitleText from '../../Components/Texts/Title_and_Text/TitleText';
import AuthHeaders from '../../Components/Headers/AuthHeaders';
import {RegularText} from '../../Components/Texts/CustomTexts/BaseTexts';
import {RouteProp} from '@react-navigation/native';
import {AuthStackParamList} from '../../Navigation/AuthStackNavigation';
import {useDispatch} from 'react-redux';
import {resendOtp} from '../../Redux/Auth/Auth';
import {verifyAccount} from '../../Redux/User/userSlice';
import {AppDispatch} from '../../Redux/Store';
import RNSecureStorage, {ACCESSIBLE} from 'rn-secure-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTokens} from '../../Context/TokenProvider';
import {useToast} from '../../Context/useToast';
import { useServerStatus } from '../../Context/useServerStatus';
// import { useTokens } from '.';  // Import the useTokens hook

type OtpScreenRouteProp = RouteProp<AuthStackParamList, 'OTP'>;

// Validation schema for OTP input
const OtpSchema = Yup.object().shape({
  otp: Yup.string().required('OTP is required'),
});

const OtpVerification = ({route}: {route: OtpScreenRouteProp}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [timer, setTimer] = useState(30); // Timer for OTP resend functionality
  const [canResend, setCanResend] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const {phoneNumber} = route.params;
  const {updateTokens, updateUser} = useTokens(); // Use context to get the updateTokens function
  const {addToast} = useToast();
  const { refreshServerStatus} = useServerStatus();
  // Resend OTP request handler
  const handleResendOtp = async () => {
    setSuccessMessage('');
    if (!canResend) return;

    try {
      const response = await dispatch(resendOtp({phoneNumber}));
      setTimer(30); // Reset the countdown after resending OTP
      setCanResend(false); // Disable resend button until cooldown expires
      setSuccessMessage('OTP sent successfully.');
      addToast('Resend OTP successful', 'success', 'OTP sent');
    } catch (error) {
      setSuccessMessage('Failed to resend OTP. Please try again.');
      addToast(
        'Failed to resend OTP. Please try again.',
        'error',
        'Error Occurred',
      );
    }
  };

  // Countdown for the resend OTP feature
  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (timer > 0) {
      countdown = setTimeout(() => setTimer(timer - 1), 1000);
    } else {
      setCanResend(true); // Allow resend when the timer hits zero
    }

    return () => clearTimeout(countdown); // Clean up timer when component unmounts
  }, [timer]);

  const handleSubmit = async (values: any) => {
    refreshServerStatus()
    setLoading(true);
    setVerificationError('');

    try {
      const response = await dispatch(
        verifyAccount({phoneNumber, otp: values.otp}),
      );
      setLoading(false);
      console.log(response);

      if (response.payload.success === true) {
        const {accessToken, refreshToken, user} = response.payload;
        addToast(
          'User logged in successfully',
          'success',
          'Login Successful', // Title
          () => {}, // No retry logic needed for success
        );


        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('temp_id', user?._id);
        console.log(
          accessToken,
          refreshToken,
          user,
          'response.payload.success',
        );

        // Update tokens in the context
        updateTokens(accessToken, refreshToken); // Call the context function to update the tokens
        //updateUser(user);
        // Store tokens securely in AsyncStorage

        // Stringify the user object before storing it in AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(user));
      } else {
        setVerificationError('Invalid OTP. Please check and try again.');
        addToast(
          'Invalid OTP. Please check and try again.',
          'error',
          'Authentication Error', // Title
          () => {}, // No retry logic needed for success
        );
      }
    } catch (error) {
      setLoading(false);
      setVerificationError('Error during OTP verification. Please try again.');
      addToast(
        'Error during OTP verification. Please try again.',
        'error',
        'Authentication Error', // Title
        () => {}, // No retry logic needed for success
      );
      console.error(error); // You can log the error to get more details if needed
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <AuthHeaders
        title=""
        infoText="Please enter the OTP sent to your registered phone number. This is a secure way to verify your identity."
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}>
        <Formik
          initialValues={{otp: ''}}
          validationSchema={OtpSchema}
          onSubmit={handleSubmit}>
          {({handleChange, handleBlur, handleSubmit, values, errors}) => (
            <>
              <TitleText
                title="OTP Verification"
                description={`Enter the OTP sent to ${phoneNumber}`}
              />
              {successMessage && (
                <RegularText style={styles.successMessage}>
                  {successMessage}
                </RegularText>
              )}
              <CustomTextInput
                label="OTP"
                placeholder="Enter OTP"
                onChangeText={handleChange('otp')}
                onBlur={handleBlur('otp')}
                value={values.otp}
                error={errors.otp || verificationError}
              />
              <CustomButton
                title={
                  loading ? (
                    <ActivityIndicator color={Colors.whiteColor} />
                  ) : (
                    'Verify OTP'
                  )
                }
                onPress={handleSubmit}
                disabled={loading}
              />
              <View style={styles.resendContainer}>
                <RegularText fontSize={14}>Didn't receive the OTP?</RegularText>
                {canResend ? (
                  <TouchableOpacity onPress={handleResendOtp}>
                    <RegularText fontSize={14} color={Colors.primaryColor}>
                      Resend OTP
                    </RegularText>
                  </TouchableOpacity>
                ) : (
                  <RegularText fontSize={14} color={Colors.grayColor}>
                    Resend available in {timer}s
                  </RegularText>
                )}
              </View>
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles for the OTP verification screen
const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: Colors.whiteColor,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.whiteColor,
  },
  successMessage: {
    fontSize: 12,
    color: Colors.primaryColor,
    backgroundColor: Colors.primaryColorFaded,
    padding: 8,
    marginBottom: 10,
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
});

export default OtpVerification;
