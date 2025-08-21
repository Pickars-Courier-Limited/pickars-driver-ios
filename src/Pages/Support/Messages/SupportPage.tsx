import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import AuthHeaders from '../../../Components/Headers/AuthHeaders';
import {Colors} from '../../../Components/Colors/Colors';
import crm from '../../../../assets/images/crm/crm.png';
import {
  BoldText,
  MediumText,
  RegularText,
} from '../../../Components/Texts/CustomTexts/BaseTexts';
import VerifiedBadge from '../../../Components/Icons/VerifiedBadge/VerifiedBadge';
import PhoneCallIcon from '../../../Components/Icons/PhoneCall/PhoneCallIcon';
import MessageIcon from '../../../Components/Icons/MessageIcon/MessageIcon';
import {useNavigation} from '@react-navigation/native';
import MailIcon from '../../../Components/Icons/MailIcon/MailIcon';
import TicketsIcon from '../../../Components/Icons/TicketsIcon/TicketsIcon';
import ArrowRightIcon from '../../../Components/Icons/Arrows/ArrowRightIcon';
import {WebView} from 'react-native-webview'; // Import WebView
import UnseenCustomerCountProvider from './UnseenCustomerCountProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CompanyName} from '../../../CompanyName';

const SupportPage = () => {
  const navigation = useNavigation();

  const unseenCustomerCount = UnseenCustomerCountProvider();

  const [userId, setUserId] = useState('');

  const handleEmailPress = async () => {
    const email = 'support@hastepickers.com';
    const subject = 'Support Inquiry';
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    const supported = await Linking.canOpenURL(mailto);
    if (supported) {
      await Linking.openURL(mailto);
    } else {
      Alert.alert(
        'Email Client Not Found',
        'It seems there is no email client installed on your device.',
      );
    }
  };

  const getUserData = async () => {
    try {
      const tempId = await AsyncStorage.getItem('temp_id');
      const userId = tempId || '';
      // socket.emit('sendMessageSupportRoom', userId); // Ensure user joins a room based on userId
      // Use tempId from AsyncStorage if available
      // setType('new');
      setUserId(userId); // Set userId from AsyncStorage
      console.log(userId, 'useriduseriduseriduserid');
    } catch (error) {
      console.error('Error fetching user ID from AsyncStorage:', error);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  // Navigate to WebView for URLs
  const navigateToWebView = (url: string, title: string) => {
    navigation.navigate('WebViewPage', {url, title});
  };

  return (
    <View style={styles.container}>
      <AuthHeaders
        title="Support Center"
        infoText={
          'Welcome to your Support page, Your satisfaction is our priority.'
        }
      />
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.cardContainer}>
          <Image source={crm} style={styles.image} resizeMode="contain" />
          <View style={styles.headerContainer}>
            <BoldText style={styles.userName}>Papi</BoldText>
            <VerifiedBadge color={Colors.primaryColor} width={18} />
          </View>
          <RegularText style={styles.subHeaderText}>
            At {CompanyName}, Customer Satisfaction is our priority
          </RegularText>
          <View style={styles.iconRow}>
            <Pressable
              style={styles.iconButton}
              onPress={() =>
                navigation.navigate('ChatPage', {
                  _id: userId,
                  imageUrl: crm,
                  support: true,
                })
              }>
              <MessageIcon color={Colors.whiteColor} width={16} height={16} />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={handleEmailPress}>
              <MailIcon color={Colors.whiteColor} size={20} />
            </Pressable>
          </View>

          {/* Buttons to navigate to WebView */}
          <View style={{marginTop: 24, width: '100%'}}>
            <Pressable
              style={{
                justifyContent: 'flex-start',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: 18,
                borderRadius: 12,
                width: '100%',
                backgroundColor: Colors.primaryColorFaded,
              }}
              onPress={() =>
                navigateToWebView(
                  'https://www.hastepickers.com/help-center',
                  'Help Center',
                )
              }>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}>
                <View style={{flexDirection: 'row', gap: 10}}>
                  <TicketsIcon
                    color={Colors.primaryColor}
                    width={16}
                    height={16}
                  />
                  <MediumText
                    style={{fontSize: 14, color: Colors.primaryColor}}>
                    Help Center
                  </MediumText>
                </View>
                <ArrowRightIcon color={Colors.primaryColor} />
              </View>
            </Pressable>
          </View>

          <View style={{marginTop: 12, width: '100%'}}>
            <Pressable
              style={{
                justifyContent: 'flex-start',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: 18,
                borderRadius: 12,
                width: '100%',
                backgroundColor: Colors.primaryColorFaded,
              }}
              onPress={() =>
                navigateToWebView(
                  'https://www.hastepickers.com/lost-parcel',
                  'Find a lost Item',
                )
              }>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}>
                <View style={{flexDirection: 'row', gap: 10}}>
                  <TicketsIcon
                    color={Colors.primaryColor}
                    width={16}
                    height={16}
                  />
                  <MediumText
                    style={{fontSize: 14, color: Colors.primaryColor}}>
                    Find a lost Item
                  </MediumText>
                </View>
                <ArrowRightIcon color={Colors.primaryColor} />
              </View>
            </Pressable>
          </View>

          <View style={{marginTop: 12, width: '100%'}}>
            <Pressable
              style={{
                justifyContent: 'flex-start',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: 18,
                borderRadius: 12,
                width: '100%',
                backgroundColor: Colors.primaryColorFaded,
              }}
              onPress={() =>
                navigateToWebView('https://www.hastepickers.com/faqs', 'FAQs')
              }>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}>
                <View style={{flexDirection: 'row', gap: 10}}>
                  <TicketsIcon
                    color={Colors.primaryColor}
                    width={16}
                    height={16}
                  />
                  <MediumText
                    style={{fontSize: 14, color: Colors.primaryColor}}>
                    FAQs
                  </MediumText>
                </View>
                <ArrowRightIcon color={Colors.primaryColor} />
              </View>
            </Pressable>
          </View>

          <View style={{marginTop: 12, width: '100%'}}>
            <Pressable
              style={{
                justifyContent: 'flex-start',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: 18,
                borderRadius: 12,
                width: '100%',
                backgroundColor: Colors.primaryColorFaded,
              }}
              onPress={() =>
                navigateToWebView(
                  'https://www.hastepickers.com/our-company',
                  'Our Company',
                )
              }>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}>
                <View style={{flexDirection: 'row', gap: 10}}>
                  <TicketsIcon
                    color={Colors.primaryColor}
                    width={16}
                    height={16}
                  />
                  <MediumText
                    style={{fontSize: 14, color: Colors.primaryColor}}>
                    Our Company
                  </MediumText>
                </View>
                <ArrowRightIcon color={Colors.primaryColor} />
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SupportPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.whiteColorF4,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 16,
    backgroundColor: Colors.whiteColorF4,
  },
  cardContainer: {
    backgroundColor: Colors.whiteColor,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'column',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 120,
    marginTop: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  userName: {
    fontSize: 18,
  },
  subHeaderText: {
    fontSize: 13,
    marginTop: 4,
    maxWidth: '70%',
    textAlign:'center'
  },
  iconRow: {
    width: '100%',
    gap: 12,
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 48,
    backgroundColor: Colors.primaryColor,
  },
});
