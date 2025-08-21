import React, {useEffect, useState} from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import * as Yup from 'yup';
import {Colors} from '../../Components/Colors/Colors';
import CustomTextInput from '../../Components/TextInputs/CustomTextInputs';
import ModalComponent from '../../Components/Modal/ModalComponent';
import CustomButton from '../../Components/Buttons/CustomButton';
import AuthHeaders from '../../Components/Headers/AuthHeaders';
import {
  RegularText,
  SemiBoldText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../Redux/store';
import {getUserProfile, updateUserProfile} from '../../Redux/User/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ShimmerLoader from '../../Components/Loader/ShimmerLoader';

const UserNameUpdate: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute();
  const {
    firstName: initialFirstName,
    lastName: initialLastName,
    email: initialEmail,
  } = route.params || {};

  const [firstName, setFirstName] = useState(initialFirstName || '');
  const [lastName, setLastName] = useState(initialLastName || '');
  const [email, setEmail] = useState(initialEmail || '');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const validate = () => {
    let isValid = true;
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');

    if (firstName.trim().length < 2) {
      setFirstNameError('First name must be at least 2 characters long');
      isValid = false;
    }
    if (lastName.trim().length < 2) {
      setLastNameError('Last name must be at least 2 characters long');
      isValid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      // Ensuring that hooks and logic are executed in order and unconditionally
      await updateUserProfileDetails({firstName, lastName, email});
    } catch (error) {
      console.error('Update Failed:', error);
      setIsErrorModalVisible(true); // Show error modal if update fails
    } finally {
      setLoading(false); // Stop loading spinner regardless of success or failure
    }
  };

  const updateUserProfileDetails = async ({
    firstName,
    lastName,
    email,
  }: any) => {
    const userData = { firstName, lastName, email };
  
    dispatch(updateUserProfile(userData))
      .unwrap()
      .then((response) => {
        console.log('Update Success:', userData, response);
        
        AsyncStorage.setItem('user', JSON.stringify(response))
          .then(() => console.log('User data saved successfully'))
          .catch((err) => console.error('AsyncStorage error:', err));
  
        setIsSuccessModalVisible(true); // Show success modal if update is successful
      })
      .catch((error) => {
        console.error('Update Failed:', error);
      });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthHeaders title="" infoText="Update your profile" />
      <View style={styles.container}>
        <SemiBoldText style={styles.headerText}>
          Update Your Profile Information
        </SemiBoldText>
        <RegularText fontSize={16}>Edit your details below</RegularText>

        <CustomTextInput
          label="First Name"
          placeholder="Enter your first name"
          value={firstName}
          onChangeText={setFirstName}
          error={firstNameError}
          width="100%"
        />

        <CustomTextInput
          label="Last Name"
          placeholder="Enter your last name"
          value={lastName}
          onChangeText={setLastName}
          error={lastNameError}
          width="100%"
        />

        <CustomTextInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          width="100%"
        />

        <CustomButton
          title="Save"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          width="100%"
          marginTop={20}
        />

        {/* Success Modal */}
        <ModalComponent
          visible={isSuccessModalVisible}
          onClose={() => {
            setIsSuccessModalVisible(false);
            navigation.goBack();
          }}
          onConfirm={() => {
            navigation.navigate('Homepage');
            setIsSuccessModalVisible(false);
          }}
          title="Success"
          message="Your profile has been updated successfully!"
          cancelText="Go Back"
          confirmText="Book a Ride"
          cancelButtonBgColor={Colors.primaryColor}
        />

        {/* Error Modal */}
        <ModalComponent
          visible={isErrorModalVisible}
          onClose={() => setIsErrorModalVisible(false)}
          onConfirm={() => {
            setIsErrorModalVisible(false);
            navigation.navigate('ProfileScreen');
          }}
          title="Error"
          message="There was an error updating your profile. Please try again."
          cancelText="Close"
          confirmText="Go Back"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.whiteColor,
  },
  container: {
    padding: 16,
    backgroundColor: Colors.whiteColor,
    borderRadius: 24,
    flex: 1,
  },
  headerText: {
    marginTop: 24,
    color: Colors.headerColor,
    fontSize: 20,
  },
});

export default UserNameUpdate;
