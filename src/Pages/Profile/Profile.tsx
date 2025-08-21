import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {Colors} from '../../Components/Colors/Colors';
import {getUserProfile} from '../../Redux/User/userSlice';
import ShimmerLoader from '../../Components/Loader/ShimmerLoader';
import CustomButton from '../../Components/Buttons/CustomButton';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTokens} from '../../Context/TokenProvider';
import ModalComponent from '../../Components/Modal/ModalComponent';
import profileImageAsset from '../../../assets/images/static/profilepics.png';
import {
  BoldText,
  RegularText,
  SemiBoldText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import NigeriaFlagSvg from '../../Components/Flags/NigeriaFlag';
import ProfileMenuItem from './ProfileMenuItem'; // Import the new component
import {CompanyName} from '../../CompanyName';
import {AppDispatch} from '../../Redux/Store';
import {WEB_BASE_URL} from '../../Redux/baseurl'; // Ensure this path is correct

export const formatName = (name: string | undefined | null) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(/[- ]/) // Split by hyphen or space
    .map(part => part.charAt(0).toUpperCase() + part.slice(1)) // Capitalize each part
    .join(' '); // Rejoin with a space
};

const UserProfile: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [localProfile, setLocalProfile] = useState<any>(null); // Use 'any' or define a proper type for localProfile
  const [loading, setLoading] = useState(true);

  const {clearTokens} = useTokens();

  // Define profile navigation items (now includes type for external links)
  const profileNavigationMap = [
    {
      label: 'Our Policies',
      screen: `${WEB_BASE_URL}/app/driver/privacy-policy`,
      type: 'external' as const, // Explicitly type as 'external'
    },
    {
      label: 'Terms of Use',
      screen: `${WEB_BASE_URL}/app/driver/terms-of-use`,
      type: 'external' as const, // Explicitly type as 'external'
    },
  ];

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await dispatch(getUserProfile()).unwrap(); // Use unwrap for direct payload access
      setLocalProfile(response);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Optionally handle error state here
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]); // Dependency on fetchUserProfile

  const formattedFirstName = formatName(localProfile?.firstName);
  const formattedLastName = formatName(localProfile?.lastName);

  if (loading) {
    return <ShimmerLoader />;
  }

  const confirmLogout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userData');
      clearTokens();
      console.log('Tokens cleared from storage and context.');
      // You might want to navigate to a login screen here
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLogoutModalVisible(false);
    }
  };

  // For delete account, you'd typically have a separate API call
  const confirmDeleteAccount = async () => {
    try {
      // Implement your account deletion logic here (e.g., API call)
      console.log('Attempting to delete account...');
      // After successful deletion, clear tokens and navigate
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userData');
      clearTokens();
      console.log('Account deleted and tokens cleared.');
      // Navigate to login/onboarding screen
    } catch (error) {
      console.error('Error during account deletion:', error);
    } finally {
      setIsDeleteModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent} // Renamed for clarity
        showsVerticalScrollIndicator={false}>
        <View style={{padding: 16}}>
          <BoldText style={{fontSize: 24, marginTop: 32, padding: 0}}>
            Profile
          </BoldText>
        </View>
        <View
          style={{
            padding: 12,
            backgroundColor: Colors.whiteColorF4,
            marginTop: -24,
            paddingVertical: 24,
            gap: 10,
            paddingTop: 12,
          }}>
          <View style={styles.viewbg}>
            <TouchableOpacity
              style={{
                backgroundColor: Colors.fadedPrimaryColor,
                borderRadius: 1200,
                alignSelf: 'flex-start',
                marginTop: 16,
              }}>
              <FastImage
                source={profileImageAsset} // Directly use the imported image
                style={styles.profileImage}
                resizeMode={FastImage.resizeMode.cover} // Use FastImage's resizeMode
              />
            </TouchableOpacity>
            <View style={{alignItems: 'flex-start', marginVertical: 16}}>
              <SemiBoldText fontSize={18} color={Colors.headerColor}>
                {formatName(formattedFirstName)} {formatName(formattedLastName)}
              </SemiBoldText>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 2,
                  alignItems: 'center',
                  borderRadius: 48,
                  marginVertical: 2,
                }}>
                <View style={styles.nigeriaflag}>
                  <NigeriaFlagSvg />
                </View>
                <View style={{flexWrap: 'wrap'}}>
                  <RegularText fontSize={15}>
                    {localProfile?.countryCode}
                    {localProfile?.phoneNumber}
                  </RegularText>
                </View>
              </View>

              <CustomButton
                marginTop={12}
                textColor={Colors.grayColor}
                backgroundColors={Colors.grayColorFaded}
                title="Apply to edit your profile details"
                onPress={() => Linking.openURL('https://www.pickars.com')}
              />
            </View>
          </View>
        </View>

        {/* Render profile navigation items using the new component */}
        <View style={styles.menuItemsContainer}>
          {profileNavigationMap.map((item, index) => (
            <ProfileMenuItem
              key={index}
              label={item.label}
              screen={item.screen}
              type={item.type}
            />
          ))}

          <ProfileMenuItem
            label="Logout"
            onPress={() => setIsLogoutModalVisible(true)}
          />

          {/* <ProfileMenuItem
            label="Delete Account"
            onPress={() => setIsDeleteModalVisible(true)}
            textColor={Colors.errorColor}
            iconColor={Colors.errorColor}
          /> */}
        </View>

        <View style={styles.footer}>
          <RegularText fontSize={16}>
            {CompanyName} Courier Limited
          </RegularText>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <ModalComponent
        visible={isLogoutModalVisible}
        onClose={() => setIsLogoutModalVisible(false)}
        onConfirm={confirmLogout}
        title="Confirm you want to Logout"
        message="Are you sure you want to log out?"
        cancelText="No, Cancel"
        confirmText="Log Out"
      />

      {/* Delete Account Modal */}
      <ModalComponent
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={confirmDeleteAccount} // Use specific delete confirm function
        title="Confirm you want to Delete your Account"
        message="Are you sure you want to Delete your Account? This action cannot be undone."
        cancelText="No, Cancel"
        confirmText="Delete"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.whiteColorF4,
    paddingTop: 48, // Adjust as per your SafeAreaView or header needs
  },
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: Colors.whiteColorF4,
  },
  headerContainer: {
    padding: 16,
    paddingBottom: 0, // Adjust spacing
  },
  headerTitle: {
    fontSize: 24,
    margin: 0,
    padding: 0,
  },
  profileInfoCard: {
    padding: 12,
    backgroundColor: Colors.whiteColor,
    marginTop: 12, // Adjusted from -24
    borderRadius: 24, // Consistent with other cards
    flexDirection: 'column',
    alignItems: 'center', // Center content horizontally
    paddingVertical: 24,
  },
  profileImageContainer: {
    backgroundColor: Colors.fadedPrimaryColor,
    borderRadius: 1200,
    // alignSelf: 'flex-start', // Removed as content is centered
    marginTop: 0, // Adjusted
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48, // Half of width/height for perfect circle
  },
  profileTextDetails: {
    alignItems: 'center', // Center text details
    marginVertical: 16,
  },
  phoneNumberContainer: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
    borderRadius: 48,
    marginVertical: 2,
  },
  nigeriaFlag: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    backgroundColor: Colors.greenColorFaded,
    padding: 8,
    alignSelf: 'flex-start',
    borderRadius: 48,
    paddingHorizontal: 8,
  },
  menuItemsContainer: {
    paddingHorizontal: 12,
    marginTop: -12, // Adjusted from -12
    borderRadius: 24,
    flexDirection: 'column',
  },
  footer: {
    marginVertical: 48,
    alignSelf: 'center',
  },

  nigeriaflag: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    backgroundColor: Colors.greenColorFaded,
    padding: 8,
    alignSelf: 'flex-start',
    borderRadius: 48,
    paddingHorizontal: 8,
  },
  scrollView: {
    flexGrow: 1,
    // justifyContent: 'center',
    backgroundColor: Colors.whiteColorF4,
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
  },
  viewbg: {
    padding: 12,
    backgroundColor: Colors.whiteColor,
    marginTop: -0,
    borderRadius: 24,
    flexDirection: 'column',
  },

  // Removed unused styles: container, header, subHeader, textLabel, button, buttonText,
  // walletToggle, walletBalance, input, modalContainer, modalContent, modalTitle,
  // modalButtons, deleteButton, cancelButton as they are now handled by ModalComponent or ProfileMenuItem
});

export default UserProfile;
