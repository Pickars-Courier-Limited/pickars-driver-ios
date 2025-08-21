// src/Pages/ResetPassword.tsx

import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import CustomTextInput from '../../Components/TextInputs/CustomTextInputs';
import CustomButton from '../../Components/Buttons/CustomButton';
import {Colors} from '../../Components/Colors/Colors';

const ResetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required('New password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must be at least 8 characters, include uppercase, lowercase, number, and special character.',
    ),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null as any], 'Passwords must match')
    .required('Confirm new password is required'),
});

const ResetPassword = () => {
  const handleSubmit = (values: any) => {
    console.log('Reset Password Payload:', values);
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{newPassword: '', confirmNewPassword: ''}}
        validationSchema={ResetPasswordSchema}
        onSubmit={handleSubmit}>
        {({handleChange, handleBlur, handleSubmit, values, errors}) => (
          <>
            <CustomTextInput
              label="New Password"
              placeholder="Enter new password"
              onChangeText={handleChange('newPassword')}
              //   onBlur={handleBlur('newPassword')}
              //   value={values.newPassword}
              isPassword
              error={errors.newPassword}
            />
            <CustomTextInput
              label="Confirm New Password"
              placeholder="Confirm your new password"
              onChangeText={handleChange('confirmNewPassword')}
              //   onBlur={handleBlur('confirmNewPassword')}
              //   value={values.confirmNewPassword}
              isPassword
              error={errors.confirmNewPassword}
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

export default ResetPassword;
