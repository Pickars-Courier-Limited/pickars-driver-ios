import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Colors } from '../../Components/Colors/Colors';
import { getUserProfile } from '../../Redux/User/userSlice';
import ShimmerLoader from '../../Components/Loader/ShimmerLoader';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTokens } from '../../Context/TokenProvider';
import ModalComponent from '../../Components/Modal/ModalComponent';
import profileImageAsset from '../../../assets/images/static/profilepics.png';
import {
  BoldText,
  RegularText,
  SemiBoldText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import NigeriaFlagSvg from '../../Components/Flags/NigeriaFlag';
import ProfileMenuItem from './ProfileMenuItem';
import { CompanyName } from '../../CompanyName';
import { AppDispatch } from '../../Redux/Store';
import { WEB_BASE_URL } from '../../Redux/baseurl';

export const formatName = (name: string | undefined | null) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(/[- ]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const UserProfile: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { clearTokens } = useTokens();

  const profileNavigationMap = [
    {
      label: 'Our Policies',
      screen: `${WEB_BASE_URL}/app/driver/privacy-policy`,
      type: 'external' as const,
    },
    {
      label: 'Terms of Use',
      screen: `${WEB_BASE_URL}/app/driver/terms-of-use`,
      type: 'external' as const,
    },
  ];

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await dispatch(getUserProfile()).unwrap();
      setLocalProfile(response);
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const confirmLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'userData',
        'normalPushTokenRegistered',
      ]);
      clearTokens();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLogoutModalVisible(false);
    }
  };

  if (loading) return <ShimmerLoader />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <BoldText fontSize={24} color={Colors.headerColor}>
            Account
          </BoldText>
          <RegularText color={Colors.grayColor}>
            Personalize your experience
          </RegularText>
        </View>

        {/* User Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.imageContainer}>
              <FastImage
                source={
                  localProfile?.imageUrl
                    ? { uri: localProfile?.imageUrl }
                    : profileImageAsset
                }
                style={styles.avatar}
                resizeMode={FastImage.resizeMode.cover}
              />
              <View style={styles.activeIndicator} />
            </View>

            <View style={styles.nameSection}>
              <SemiBoldText fontSize={18} color={Colors.headerColor}>
                {formatName(localProfile?.firstName)}{' '}
                {formatName(localProfile?.lastName)}
              </SemiBoldText>
              <View style={styles.phoneRow}>
                <View style={styles.flagWrapper}>
                  <NigeriaFlagSvg />
                </View>
                <RegularText color={Colors.grayColor} fontSize={15}>
                  {localProfile?.countryCode} {localProfile?.phoneNumber}
                </RegularText>
              </View>
            </View>
          </View>

          {/* Tip Box (The section that had the error) */}
          <View style={styles.tipBox}>
            <BoldText
              fontSize={12}
              color={Colors.primaryColor}
              style={{ marginBottom: 4 }}
            >
              💡 PRO TIP
            </BoldText>
            <RegularText fontSize={13} color={Colors.headerColor}>
              Keeping your contact details up to date ensures customers can
              reach you during deliveries.
            </RegularText>
          </View>

          <TouchableOpacity
            style={styles.editRequestBtn}
            onPress={() => Linking.openURL('https://www.pickars.com')}
          >
            <SemiBoldText fontSize={14} color={Colors.primaryColor}>
              Request Profile Update
            </SemiBoldText>
          </TouchableOpacity>
        </View>

        {/* Settings Menu */}
        <View style={styles.menuSection}>
          <View style={styles.menuLabel}>
            <SemiBoldText fontSize={13} color={Colors.grayColor}>
              LEGAL & SECURITY
            </SemiBoldText>
          </View>

          <View style={styles.menuGroup}>
            {profileNavigationMap.map((item, index) => (
              <ProfileMenuItem
                key={index}
                label={item.label}
                screen={item.screen}
                type={item.type}
                style={
                  index !== profileNavigationMap.length - 1 &&
                  styles.borderBottom
                }
              />
            ))}

            <ProfileMenuItem
              label="Sign Out"
              onPress={() => setIsLogoutModalVisible(true)}
              textColor={Colors.errorColor}
            />
          </View>
        </View>

        {/* Helpful Hint */}
        <View style={styles.hintContainer}>
          <RegularText style={styles.hintText}>
            Need to change your vehicle or bank details? Contact support through
            the Policies section.
          </RegularText>
        </View>

        <View style={styles.footer}>
          <BoldText fontSize={14} color={Colors.headerColor}>
            {CompanyName}
          </BoldText>
          <RegularText fontSize={11} color={Colors.grayColor}>
            v1.0.4 • Build 2026
          </RegularText>
        </View>
      </ScrollView>

      <ModalComponent
        visible={isLogoutModalVisible}
        onClose={() => setIsLogoutModalVisible(false)}
        onConfirm={confirmLogout}
        title="Sign Out"
        message="Your active sessions will be closed. Continue?"
        confirmText="Yes, Sign Out"
        cancelText="Stay Logged In"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 24,
  },
  profileCard: {
    backgroundColor: '#FAFAFA',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.fadedPrimaryColor,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00C853',
    borderWidth: 3,
    borderColor: '#FAFAFA',
  },
  nameSection: {
    marginLeft: 18,
    flex: 1,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  flagWrapper: {
    width: 22,
    height: 15,
    marginRight: 10,
  },
  tipBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryColor,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  editRequestBtn: {
    marginTop: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primaryColor,
    borderStyle: 'dashed',
  },
  menuSection: {
    marginTop: 36,
    paddingHorizontal: 20,
  },
  menuLabel: {
    marginBottom: 10,
    marginLeft: 4,
  },
  menuGroup: {
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  hintContainer: {
    paddingHorizontal: 40,
    marginTop: 24,
    alignItems: 'center',
  },
  hintText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  footer: {
    marginTop: 60,
    alignItems: 'center',
  },
});

export default UserProfile;
