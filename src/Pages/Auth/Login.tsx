import React, {useState} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {PhoneNumberInput} from '../../Components/TextInputs/CustomTextInputs';
import CustomButton from '../../Components/Buttons/CustomButton';
import {Colors} from '../../Components/Colors/Colors';
import TitleText from '../../Components/Texts/Title_and_Text/TitleText';
import AuthHeaders from '../../Components/Headers/AuthHeaders';
import {useDispatch} from 'react-redux';
import {loginUser} from '../../Redux/Auth/Auth';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../Navigation/AuthStackNavigation';
import {useToast} from '../../Context/useToast';
import { useServerStatus } from '../../Context/useServerStatus';

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Login'
>;

interface LoginFormValues {
  phoneNumber: string;
}

const LoginSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\d{10,}$/, 'Phone number must be at least 10 digits'),
});

// Helper function to remove leading zero
export const removeLeadingZero = (phoneNumber: string) => {
  return phoneNumber.startsWith('0') ? phoneNumber.slice(1) : phoneNumber;
};

const Login: React.FC = () => {
  const {addToast} = useToast();
  const dispatch = useDispatch();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // Track loading state
  const { refreshServerStatus} = useServerStatus();

  const handleLogin = async ({phoneNumber}: LoginFormValues) => {
    setErrorMessage(''); // Clear previous error
    setLoading(true); // Set loading to true when the login request starts

    try {
      const phoneNumberWithoutZero = removeLeadingZero(phoneNumber);
      const response = await dispatch(
        loginUser({phoneNumber: phoneNumberWithoutZero}) as any,
      );
      console.log(response.payload);

      switch (response.payload.message) {
        case 'OTP sent successfully for login':
          addToast(
            'OTP sent successfully for login',
            'success',
            'OTP Sent',
            () => handleLogin({phoneNumber}), // Retry Logic
          );
          navigation.navigate('OTP', {phoneNumber: phoneNumberWithoutZero});
          break;

        case 'Login failed':
          console.log(response.payload);
          setErrorMessage('No user exists with this phone number.');
          addToast(
            'Server is experiencing downtime, please try again later.',
            'error',
            'Server Downtime',
            () => handleLogin({phoneNumber}), // Retry Logic
          );
          break;

          case 'User not found':
            console.log(response.payload);
            setErrorMessage('No user exists with this phone number.');
            addToast(
              'No user exists with this phone number.',
              'error',
              'User Not Found',
              () => handleLogin({phoneNumber}), // Retry Logic
            );
            break;

        default:
          setErrorMessage('No user exists with this phone number.');
          addToast(
            'An error occurred. Please try again.',
            'error',
            'Network Error',
            () => handleLogin({phoneNumber}), // Retry Logic
          );
          break;
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      addToast(
        'An error occurred. Please try again.',
        'error',
        'Network Error',
        () => handleLogin({phoneNumber}), // Retry Logic
      );
    } finally {
      setLoading(false); // Set loading to false once the request finishes
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthHeaders
        title=""
        infoText="By entering your phone number, you will receive an OTP to access your account securely."
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}>
        <Formik<LoginFormValues>
          initialValues={{phoneNumber: ''}}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}>
          {({handleChange, handleSubmit, values, errors}) => (
            <>
              <TitleText
                title="Login"
                description="Enter your phone number to receive an OTP and verify your identity."
              />
              <PhoneNumberInput
                label="Phone Number"
                placeholder="Enter your phone number"
                onChangeText={handleChange('phoneNumber')}
                error={errors.phoneNumber || errorMessage}
              />
              <CustomButton
                title={
                  loading ? (
                    <ActivityIndicator color={Colors.whiteColor} />
                  ) : (
                    'Get OTP'
                  )
                }
                onPress={handleSubmit}
                disabled={loading} // Disable the button when loading
              />
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.whiteColor,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.whiteColor,
  },
});

export default Login;
