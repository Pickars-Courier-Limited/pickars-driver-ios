import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';

import { useSocket } from '../../Context/useSocket';

import MessageIcon from '../../Components/Icons/MessageIcon/MessageIcon';
import PhoneCallIcon from '../../Components/Icons/PhoneCall/PhoneCallIcon';
import {
  BoldText,
  MediumText,
  RegularText,
  SemiBoldText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import IconsContainer from '../../Components/Icons/IconContainer';
import BikeLogoIcon from '../../Components/Icons/Logo/LogoIcon';
import { Image } from 'react-native';
import { AppDispatch } from '../../Redux/Store';
import { useCallback, useEffect, useState } from 'react';
import { fetchRideById } from '../../Redux/Riders/riders';
import AuthHeaders from '../../Components/Headers/AuthHeaders';
import ErrorComponent from '../../Components/ErrorComponent/ErrorComponent';
import ShimmerLoader from '../../Components/Loader/ShimmerLoader';
import RideStatusAndActions from './RideStatusAndActions';
import { formatDate } from '../Support/Messages/MessageSupport';
import { formatName } from '../../Components/Headers/MessageHeaders';
import { Colors } from '../../Components/Colors/Colors';

// --- New CustomerContactInfo Component ---
interface CustomerContactInfoProps {
  customerName: string;
  customerPhoneNumber: string;
  pickupCode?: string;
  onCall: (phoneNumber: string) => void;
  onMessage: () => void;
  // Added new props for dynamic icon colors
  iconBackgroundColor: string;
  iconColor: string;
}

const CustomerContactInfo = ({
  customerName,
  customerPhoneNumber,
  pickupCode,
  onCall,
  onMessage,
  iconBackgroundColor, // Destructure new prop
  iconColor, // Destructure new prop
}: CustomerContactInfoProps) => {
  return (
    <View style={customerContactStyles.container}>
      <SemiBoldText fontSize={16} color={Colors.headerColor}>
        {formatName(customerName)}
      </SemiBoldText>
      {pickupCode && (
        <BoldText fontSize={16} color={Colors.grayColor}>
          Pickup Code: {pickupCode}
        </BoldText>
      )}

      <View style={customerContactStyles.buttonsContainer}>
        <Pressable onPress={onMessage}>
          <IconsContainer
            backgroundColor={iconBackgroundColor} // Use dynamic background color
            IconComponent={MessageIcon}
            iconColor={iconColor} // Use dynamic icon color
            iconWidth={24}
            iconHeight={24}
            padding={32}
            onPress={() => onCall(customerPhoneNumber)} // This onPress is redundant if parent Pressable handles it
          />
        </Pressable>

        <Pressable onPress={() => onCall(customerPhoneNumber)}>
          <IconsContainer
            backgroundColor={iconBackgroundColor} // Use dynamic background color
            IconComponent={PhoneCallIcon}
            iconColor={iconColor} // Use dynamic icon color
            iconWidth={24}
            iconHeight={24}
            padding={32}
            onPress={() => onCall(customerPhoneNumber)} // This onPress is redundant if parent Pressable handles it
          />
        </Pressable>
      </View>
    </View>
  );
};

const customerContactStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.whiteColor,
    // padding: 16,
    // borderRadius: 12,
    // marginHorizontal: 12,
    // marginTop: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: Colors.whiteColorF4,
    borderWidth: 1,
    borderColor: Colors.lightGrayColor,
  },
  buttonText: {
    color: Colors.headerColor,
    fontSize: 14,
  },
});

const RideDetailScreen = () => {
  const route = useRoute();
  const { rideId, userId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { socket } = useSocket();
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const navigation = useNavigation();

  console.log(userId, 'hjdriverIddriverId');

  const fetchRideDetails = async () => {
    try {
      const result = await dispatch(fetchRideById(rideId)).unwrap();
      if (result.success === true) {
        setRideDetails(result.data);
        console.log(result.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch ride details');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRideDetails();
    }, [rideId]),
  );

  useEffect(() => {
    if (!userId || !socket) return;

    socket.emit('joinDriver', userId);

    socket.on('riderJoined', (messageData: any) => {
      console.log(messageData, 'messageData');
      setError(messageData.error);
    });

    return () => {
      socket.off('riderJoined');
    };
  }, [userId, socket]);

  const handleAction = (action: string) => {
    if (!socket) {
      console.error(`Unable to ${action}: Missing socket or ride data.`);
      return;
    }

    setIsButtonDisabled(true);

    const payload = {
      rideId: rideId,
      driverId: userId,
      ride: rideDetails,
      [action]: true,
    };

    console.log(`${action} with payload:`, payload);

    socket.emit(action, payload);

    setTimeout(async () => {
      setIsButtonDisabled(false);
      await fetchRideDetails();
    }, 6000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRideDetails();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ShimmerLoader />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <View>
        <ErrorComponent
          errorMessage="Can not Retrieve Ride Details for this ride at the moment"
          onReload={onRefresh}
        />
      </View>
    );
  }

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied!', `${label} has been copied to your clipboard.`);
  };

  const customerName = rideDetails?.customer
    ? `${rideDetails?.customer.firstName} ${rideDetails?.customer.lastName}`
    : 'N/A';
  const customerPhoneNumber = rideDetails?.customer?.phoneNumber || 'N/A';
  const pickupCode = rideDetails?.pickup?.pickupCode || null;

  // Determine ride status and corresponding colors
  let statusText = 'Ride Accepted'; // Default status
  let statusBackgroundColor = Colors.primaryColorFaded;
  let statusTextColor = Colors.primaryColor;

  if (rideDetails?.cancelRide?.isCancelled === true) {
    statusText = 'Ride Cancelled';
    statusBackgroundColor = Colors.errorColorFaded;
    statusTextColor = Colors.errorColor;
  } else if (rideDetails?.endRide?.isEnded === true) {
    statusText = 'Ride Ended';
    statusBackgroundColor = Colors.grayColorFaded;
    statusTextColor = Colors.grayColor;
  } else if (
    rideDetails?.startRide?.isStarted === true &&
    rideDetails?.endRide?.isEnded === false
  ) {
    statusText = 'Ride Ongoing';
    statusBackgroundColor = Colors.greenColorFaded;
    statusTextColor = Colors.greenColor;
  } else {
    // Ride has not started yet
    statusText = 'Ride Not Started';
    statusBackgroundColor = Colors.grayColorFaded;
    statusTextColor = Colors.grayColor;
  }
  // If none of the above, it defaults to 'Ride Accepted' with primary colors

  return (
    <View style={{ backgroundColor: Colors.whiteColorF4, flex: 1 }}>
      <AuthHeaders title="" infoText="" />
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={20}
            colors={[Colors.primaryColor]}
            progressBackgroundColor="#F1F1F1"
          />
        }
      >
        {rideDetails ? (
          <View>
            {/* Displaying the determined status */}
            <View
              style={{
                backgroundColor: statusBackgroundColor,
                padding: 8,
                borderRadius: 12,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                marginTop: 16,
                marginBottom: -6,
              }}
            >
              <MediumText style={{ fontSize: 12, color: statusTextColor }}>
                {statusText}
              </MediumText>
            </View>

            <View style={styles.detailsContainer}>
              <BoldText style={styles.sectionTitle} fontSize={24}>
                Pickup Details
              </BoldText>

              <View
                style={{
                  flexDirection: 'row',
                  gap: 8,
                  marginTop: 8,
                  marginBottom: 32,
                  flexWrap: 'nowrap',
                }}
              >
                <View style={{ flexShrink: 1, overflow: 'hidden' }}>
                  <SemiBoldText style={styles.detailAddress}>
                    {rideDetails?.pickup?.pickupAddress}
                  </SemiBoldText>
                  <RegularText style={styles.detailRegion}>
                    {rideDetails?.startRide?.timestamp
                      ? formatDate(rideDetails?.startRide?.timestamp)
                      : formatDate(rideDetails?.createdAt)}
                  </RegularText>

                  <CustomerContactInfo
                    customerName={customerName}
                    customerPhoneNumber={customerPhoneNumber}
                    pickupCode={pickupCode}
                    onCall={handleCall}
                    onMessage={() =>
                      navigation.navigate('ChatPage', {
                        _id: rideDetails?._id,
                        driverName: customerName,
                        imageUrl: rideDetails?.customer?.imageUrl,
                        phoneNumber: customerPhoneNumber,
                      })
                    }
                    iconBackgroundColor={statusBackgroundColor} // Pass dynamic background color
                    iconColor={statusTextColor} // Pass dynamic icon color
                  />
                </View>
              </View>

              <BoldText style={{ fontSize: 18 }}>Delivery Locations</BoldText>
              {rideDetails?.deliveryDropoff?.map((location, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    gap: 8,
                    marginTop: 8,
                    flexWrap: 'nowrap',
                  }}
                >
                  <View style={{ flex: 1, flexShrink: 1 }}>
                    <RegularText
                      style={[styles.detailRegion, { marginBottom: 8 }]}
                    >
                      {location?.receiverName} ||{' '}
                      {location?.receiverPhoneNumber}
                    </RegularText>

                    <SemiBoldText style={styles.detailAddress}>
                      {location?.deliveryAddress}
                    </SemiBoldText>

                    {location?.parcelId && (
                      <Pressable
                        onPress={() =>
                          copyToClipboard(location.parcelId, 'Parcel ID')
                        }
                        style={{}}
                      >
                        <BoldText style={styles.parcelIdText}>
                          Parcel ID: {location.parcelId}
                        </BoldText>
                      </Pressable>
                    )}
                    <View
                      style={{
                        flexWrap: 'wrap',
                        flexDirection: 'row',
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      {location?.items?.map((item, itemIndex) => (
                        <View
                          key={itemIndex}
                          style={{
                            backgroundColor: statusBackgroundColor, // This remains primary for items
                            padding: 8,
                            borderRadius: 34,
                          }}
                        >
                          <RegularText
                            style={[
                              styles.detailRegion,
                              {
                                marginBottom: 0,
                                fontSize: 14,
                                color: statusTextColor, // This remains primary for items
                              },
                            ]}
                          >
                            {item?.itemName}
                          </RegularText>
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity
                      onPress={() => handleCall(location?.receiverPhoneNumber)}
                    >
                      <IconsContainer
                        backgroundColor={statusBackgroundColor} // Pass dynamic background color
                        IconComponent={PhoneCallIcon}
                        iconColor={statusTextColor} // Pass dynamic icon color
                        iconWidth={24}
                        iconHeight={24}
                        padding={32}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* --- Integration of RideStatusAndActions Component --- */}
              <RideStatusAndActions
                rideDetails={rideDetails}
                isButtonDisabled={isButtonDisabled}
                handleAction={handleAction}
              />
              {/* --- End of RideStatusAndActions Integration --- */}
            </View>

            <View
              style={{
                height: 160,
              }}
            ></View>
          </View>
        ) : (
          <RegularText style={styles.noDataText}>
            No ride details available.
          </RegularText>
        )}
      </ScrollView>
    </View>
  );
};

export default RideDetailScreen;

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: '#F9F9F9',
  },
  container: {
    // This style is now managed by scrollViewContent, keeping it for reference
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#333',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  dropoffContainer: {
    marginLeft: 16,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B3B',
  },
  actionButton: {
    backgroundColor: Colors.primaryColor,
    paddingVertical: 16,
    marginVertical: 6,
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#D1D1D1',
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: Colors.whiteColor,
    margin: 12,
    borderRadius: 24,
    paddingTop: 32,
    marginBottom: 12,
  },
  header: {
    marginBottom: 20,
  },
  detailAddress: {
    fontSize: 16,
    marginBottom: 4,
    color: Colors.headerColor,
  },
  detailRegion: {
    fontSize: 15,
    color: Colors.grayColor,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 6,
    color: Colors.grayColor,
  },
  deliveryLocation: {
    fontSize: 14,
    color: Colors.headerColor,
  },
  riderInfo: {
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: 16,
  },
  riderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  plateNumber: {
    fontSize: 12,
    color: Colors.grayColor,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  parcelIdContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: Colors.grayColor,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  parcelIdText: {
    fontSize: 16,
    color: Colors.headerColor,
    marginBottom: 14,
  },
});
