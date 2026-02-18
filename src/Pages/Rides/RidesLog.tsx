import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { getRidesByStatus } from '../../Redux/Riders/riders';
import { AppDispatch } from '../../Redux/store';
import AuthHeaders from '../../Components/Headers/AuthHeaders';
import {
  BoldText,
  MediumText,
  RegularText,
  SemiBoldText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import IconsContainer from '../../Components/Icons/IconContainer';
import BikeLogoIcon from '../../Components/Icons/Logo/LogoIcon';
import ErrorComponent from '../../Components/ErrorComponent/ErrorComponent';
import { getUserProfile } from '../../Redux/User/userSlice';
import ArrowRightIcon from '../../Components/Icons/Arrows/ArrowRightIcon';
import { formatName } from '../Profile/Profile';
import { Colors } from '../../Components/Colors/Colors';
import UserLocationMap from '../Home/UserLocationMap';

interface RideSocketLog {
  rideId: string;
  status: string;
  pickup: {
    pickupLatitude: number;
    pickupLongitude: number;
    pickupAddress: string;
  };
  ride?: {
    totalPrice: number;
    createdAt: string;
  };
  deliveryDropoff?: Array<any>;
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12;

  return `${hours}:${minutes < 10 ? '0' : ''}${minutes}${ampm}`;
};

const RidesLog: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute();
  const { statusPassed = 'ongoing' } = route.params as {
    statusPassed?: string;
  };

  const navigation = useNavigation();
  const [rideSockets, setRideSockets] = useState<RideSocketLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [localProfile, setLocalProfile] = useState<any>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await dispatch(getUserProfile()).unwrap();
      setLocalProfile(response);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }, [dispatch]);

  const fetchLogs = useCallback(() => {
    setLoading(true);
    setError(null);
    dispatch(getRidesByStatus(statusPassed))
      .unwrap()
      .then(data => {
        setRideSockets(data?.rides || []);
      })
      .catch(err => {
        console.error('Error fetching logs:', err);
        if (err.status === 404) {
          setRideSockets([]);
          setError(null);
        } else {
          setError(err?.message || 'Error fetching logs');
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, [dispatch, statusPassed]);

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
      fetchUserProfile();
    }, [fetchLogs, fetchUserProfile]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLogs();
  }, [fetchLogs]);

  const getHeaderTitle = () => {
    switch (statusPassed) {
      case 'ongoing':
        return 'Ongoing Rides';
      case 'accepted':
        return 'Accepted Rides';
      case 'cancelled':
        return 'Cancelled Rides';
      case 'completed':
        return 'Completed Rides';
      default:
        return 'Ride Logs';
    }
  };

  // Determine colors based on statusPassed
  const getStatusColors = () => {
    switch (statusPassed) {
      case 'ongoing':
        return {
          cardBackgroundColor: Colors.greenColorFaded,
          cardTextColor: Colors.greenColor,
          iconBackgroundColor: Colors.greenColor,
          iconColor: Colors.whiteColor,
        };
      case 'cancelled':
        return {
          cardBackgroundColor: Colors.errorColorFaded,
          cardTextColor: Colors.errorColor,
          iconBackgroundColor: Colors.errorColor,
          iconColor: Colors.whiteColor,
        };
      case 'completed':
        return {
          cardBackgroundColor: Colors.grayColorFaded,
          cardTextColor: Colors.grayColor,
          iconBackgroundColor: Colors.grayColor,
          iconColor: Colors.whiteColor,
        };
      case 'accepted':
      default:
        return {
          cardBackgroundColor: Colors.primaryColorFaded,
          cardTextColor: Colors.primaryColor,
          iconBackgroundColor: Colors.primaryColor,
          iconColor: Colors.whiteColor,
        };
    }
  };

  const { cardBackgroundColor, cardTextColor, iconBackgroundColor, iconColor } =
    getStatusColors();

  if (loading && !refreshing) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: Colors.whiteColor }]}
      >
        <AuthHeaders title={getHeaderTitle()} infoText="" />

        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
          <BoldText style={styles.loadingText}>Loading your rides...</BoldText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <AuthHeaders title={getHeaderTitle()} infoText="" />
        <ErrorComponent errorMessage={error} onReload={onRefresh} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: '#fff',
        },
      ]}
    >
      <AuthHeaders title={getHeaderTitle()} infoText="" />
      <View style={styles.contentContainer}>
        {rideSockets.length > 0 ? (
          <FlatList
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            data={rideSockets}
            keyExtractor={item => item?.rideId}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.rideCard,
                  { backgroundColor: Colors.whiteColor },
                ]}
                onPress={() =>
                  navigation.navigate('RideDetailScreen', {
                    rideId: item?.rideId,
                    userId: localProfile?._id,
                    status: item?.status,
                  })
                }
              >
                <Pressable
                  key={item?._id}
                  style={{ gap: 8, width:'100%' }}
                  onPress={() =>
                    navigation.navigate('RideDetailScreen', {
                      rideId: item?.rideId,
                      userId: localProfile?._id,
                      status: item?.status,
                    })
                  }
                >
                  {' '}
                  <UserLocationMap
                    pickup={item.pickup}
                 //   rideStatus={'New Ride Request'}
                    isRideStatus={true}
                    ride={item?.ride}
                  />
                  {/* <BoldText
                    style={[
                      styles.actionButtonTextDark,
                      // { color: cardTextColor },
                    ]}
                    fontSize={18}
                  >
                    {formatName(statusPassed)} Ride Request
                  </BoldText>
                  <RegularText
                    style={[
                      styles.actionButtonTextDark,
                      // { color: cardTextColor },
                    ]}
                  >
                    {item?.pickup?.pickupAddress ||
                      'Pickup address unavailable'}
                  </RegularText> */}
                  <View
                    style={[
                      styles.actionButtonTextDarkPickup,
                      { backgroundColor: cardTextColor + '1A' },
                    ]}
                  >
                    <RegularText
                      style={[
                        styles.actionButtonTextDarkPickupText,
                        { color: cardTextColor },
                      ]}
                    >
                      Open to view
                    </RegularText>
                    <IconsContainer
                      backgroundColor={iconBackgroundColor}
                      IconComponent={ArrowRightIcon}
                      iconColor={iconColor}
                      iconWidth={16}
                      iconHeight={16}
                      padding={24}
                    />
                  </View>
                </Pressable>
              </Pressable>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <BoldText style={styles.noLogsText}>
            No {statusPassed} rides available.
          </BoldText>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.whiteColorF4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: Colors.whiteColorF4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.primaryColor,
  },
  flatListContent: {
    paddingBottom: 120,
  },
  rideCard: {
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rideInfo: {
    flex: 1,
    marginLeft: 10,
  },
  address: {
    fontSize: 16,
    color: Colors.headerColor,
  },
  time: {
    fontSize: 12,
    color: Colors.grayColor,
  },
  noLogsText: {
    fontSize: 18,
    color: Colors.textColor,
    textAlign: 'center',
    marginTop: 50,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonTextDarkPickup: {
    padding: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderRadius: 16,
  },
  actionButtonTextDarkPickupText: {
    fontSize: 14,
    marginLeft: 6,
  },
  actionButtonTextDark: {
    // This style is now mostly overridden by dynamic color
  },
});

export default RidesLog;
