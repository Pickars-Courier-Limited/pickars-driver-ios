// src/Pages/ForgotPassword.tsx

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CustomTextInput from '../../Components/TextInputs/CustomTextInputs';
import CustomButton from '../../Components/Buttons/CustomButton';
import {Colors} from '../../Components/Colors/Colors';


const ForgotPasswordSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\d{10,}$/, 'Phone number must be at least 10 digits')
    .transform((value) => (value.startsWith('0') ? value.slice(1) : value)), // Remove leading 0
});

const ForgotPassword = () => {
  const handleSubmit = (values: any) => {
    console.log('Forgot Password Payload:', values);
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{ phoneNumber: '' }}
        validationSchema={ForgotPasswordSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
          <>
            <CustomTextInput
              label="Phone Number"
              placeholder="Enter your phone number"
              onChangeText={handleChange('phoneNumber')}
            //   onBlur={handleBlur('phoneNumber')}
            //   value={values.phoneNumber}
              error={errors.phoneNumber}
            />
            <CustomButton title="Reset Password" onPress={handleSubmit} />
          </>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.whiteColor,
  },
});

export default ForgotPassword;