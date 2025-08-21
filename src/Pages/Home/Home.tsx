import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Animated,
  Pressable,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors } from '../../Components/Colors/Colors';
import ShimmerLoader from '../../Components/Loader/ShimmerLoader';
import { getUserProfile } from '../../Redux/User/userSlice';
import { AppDispatch } from '../../Redux/Store';
import { CompanyName } from '../../CompanyName';
import IconsContainer from '../../Components/Icons/IconContainer';
import ArrowRightIcon from '../../Components/Icons/Arrows/ArrowRightIcon';
import {
  RegularText,
  SemiBoldText,
  BoldText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import { formatName } from '../Profile/Profile';
import images from '../../../assets/images/newlogo.png';
import {
  fetchRideSocketLogs,
  getRidesByDriver,
} from '../../Redux/Riders/riders';
import { groupLogsByDate } from '../Rides/RidesScreen';

interface RideSocketLog {
  id: string;
  timestamp: string;
}

const getFormattedDate = () => {
  const today = new Date();
  const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
  const day = today.getDate();

  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  const month = today.toLocaleDateString('en-US', { month: 'long' });
  const year = today.getFullYear();

  return `${weekday}, ${day}${getOrdinal(day)} ${month} ${year}`;
};

const ProfileInfo = ({ profile }: { profile: any }) => (
  <View style={styles.profileInfoContainer}>
    <BoldText fontSize={20} color={Colors.headerColor}>
      Hi, {formatName(profile?.lastName)} {formatName(profile?.firstName)}
    </BoldText>
    <RegularText fontSize={14} color={Colors.grayColor}>
      Today is {getFormattedDate()}
    </RegularText>
  </View>
);

interface RideStatusCardProps {
  borderColor: string;
  backgroundColor: string;
  imageSource: any;
  statusText: string;
  onPress: () => void;
  count: number;
}

const RideStatusCard = ({
  borderColor,
  backgroundColor,
  imageSource,
  statusText,
  onPress,
  count,
}: RideStatusCardProps) => (
  <Pressable style={styles.statusCard} onPress={onPress}>
    <View style={[styles.statusCardInnerBorder, { borderColor }]}>
      <View style={[styles.statusCardInnerBackground, { backgroundColor }]}>
        <Image
          source={imageSource}
          style={styles.statusCardImage}
          resizeMode="contain"
        />
      </View>
    </View>
    <RegularText style={styles.statusCardText}>
      {statusText} ({count})
    </RegularText>
  </Pressable>
);

interface FinishedRidesCardProps {
  totalRides: number;
  onPress: () => void;
}

const FinishedRidesCard = ({ totalRides, onPress }: FinishedRidesCardProps) => (
  <Pressable style={styles.finishedRidesContainer} onPress={onPress}>
    <View style={styles.finishedRidesContent}>
      <SemiBoldText fontSize={12} color={Colors.grayColor}>
        FINISHED RIDES
      </SemiBoldText>
      <View style={styles.finishedRidesInfo}>
        <View>
          <BoldText fontSize={32}>{totalRides}</BoldText>
          <RegularText fontSize={14} color={Colors.headerColor}>
            Total Finished Rides
          </RegularText>
        </View>
        <IconsContainer
          backgroundColor={Colors.grayColorFaded}
          IconComponent={ArrowRightIcon}
          iconColor={Colors.grayColor}
          iconWidth={14}
          iconHeight={14}
          padding={16}
        />
      </View>
    </View>
  </Pressable>
);

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigation = useNavigation();

  const [newRidesCount, setNewRidesCount] = useState(0);
  const [acceptedRidesCount, setAcceptedRidesCount] = useState(0);
  const [ongoingRidesCount, setOngoingRidesCount] = useState(0);
  const [completedRidesCount, setCompletedRidesCount] = useState(0);
  const [cancelledRidesCount, setCancelledRidesCount] = useState(0);

  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRideStats = useCallback((allRides: any[]) => {
    console.log(allRides, 'allRides');
    const newRides = allRides.filter(
      ride => !ride?.acceptRide && !ride?.cancelRide?.isCancelled,
    );
    const acceptedRides = allRides.filter(
      ride =>
        ride?.acceptRide &&
        !ride?.startRide?.isStarted &&
        !ride?.endRide?.isEnded,
    );
    const ongoingRides = allRides.filter(
      ride =>
        ride?.acceptRide &&
        ride?.startRide?.isStarted &&
        !ride?.endRide?.isEnded,
    );
    const completedRides = allRides.filter(
      ride => ride?.endRide?.isEnded === true,
    );
    const cancelledRides = allRides.filter(
      ride => ride?.cancelRide?.isCancelled,
    );

    setAcceptedRidesCount(acceptedRides.length);
    setOngoingRidesCount(ongoingRides.length);
    setCompletedRidesCount(completedRides.length);
    setCancelledRidesCount(cancelledRides.length);
  }, []);

  const [rideSockets, setRideSockets] = useState<RideSocketLog[]>([]);

  const fetchLogs = useCallback(() => {
    return dispatch(fetchRideSocketLogs())
      .then((response: any) => {
        console.log('Response Payload (fetchLogs):', response.payload);
        setRideSockets(response.payload?.rideSockets || []);
        setNewRidesCount(response.payload?.rideSockets?.length || 0);
        setError(null);
      })
      .catch((err: any) => {
        console.error('Error fetching logs:', err);
        setError(err?.response?.data || 'Error fetching ride socket logs');
        throw err;
      });
  }, [dispatch]);

  const fetchRideData = useCallback(() => {
    return dispatch(getRidesByDriver())
      .then(response => {
        if (response?.payload?.success) {
          const rawRides = response.payload.rideSockets || [];
          const allRidesFlattened = Object.values(rawRides).flat();
          calculateRideStats(allRidesFlattened);
          setError(null);
        } else {
          const errorMessage =
            response?.payload?.message || 'Failed to fetch ride data.';
          Alert.alert('Error', errorMessage);
          throw new Error(errorMessage);
        }
      })
      .catch(err => {
        console.error('Error fetching ride data:', err);
        Alert.alert(
          'Error',
          `Failed to fetch ride data: ${err.message || 'Unknown error'}`,
        );
        setError(
          `Failed to fetch ride data: ${err.message || 'Unknown error'}`,
        );
        throw err;
      });
  }, [dispatch, calculateRideStats]);

  const fetchUserProfileData = useCallback(async () => {
    try {
      const response = await dispatch(getUserProfile()).unwrap();
      setUserProfile(response);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      Alert.alert(
        'Error',
        `Failed to fetch user profile: ${error.message || 'Unknown error'}`,
      );
      setError(
        `Failed to fetch user profile: ${error.message || 'Unknown error'}`,
      );
      throw error;
    }
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      await Promise.all([fetchRideData(), fetchUserProfileData(), fetchLogs()]);
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [fetchRideData, fetchUserProfileData, fetchLogs]);

  useFocusEffect(
    useCallback(() => {
      handleRefresh();
      return () => {};
    }, [handleRefresh]),
  );

  if (loading) {
    return <ShimmerLoader />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <BoldText fontSize={18} color={Colors.errorColor}>
            Error
          </BoldText>
          <RegularText fontSize={14} color={Colors.grayColor}>
            {error}
          </RegularText>
          <Pressable onPress={handleRefresh} style={styles.retryButton}>
            <RegularText color={Colors.whiteColor}>Tap to Retry</RegularText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primaryColor]}
            tintColor={Colors.primaryColor}
          />
        }
      >
        {userProfile && <ProfileInfo profile={userProfile} />}

        <ScrollView
          horizontal
          contentContainerStyle={styles.rideStatusScrollContainer}
          showsHorizontalScrollIndicator={false}
        >
          <RideStatusCard
            borderColor={Colors.primaryColor}
            backgroundColor={Colors.primaryColor}
            imageSource={images}
            statusText="New"
            count={newRidesCount}
            onPress={() => navigation.navigate('IncomingRides' as never)}
          />
          <RideStatusCard
            borderColor={Colors.grayColor}
            backgroundColor={Colors.grayColor}
            imageSource={images}
            statusText="Accepted"
            count={acceptedRidesCount}
            onPress={() =>
              navigation.navigate(
                'RidesLog' as never,
                { statusPassed: 'accepted' } as never,
              )
            }
          />
          <RideStatusCard
            borderColor={Colors.greenColor}
            backgroundColor={Colors.greenColor}
            imageSource={images}
            statusText="Ongoing"
            count={ongoingRidesCount}
            onPress={() =>
              navigation.navigate(
                'RidesLog' as never,
                { statusPassed: 'ongoing' } as never,
              )
            }
          />
          <RideStatusCard
            borderColor={Colors.errorColor}
            backgroundColor={Colors.errorColor}
            imageSource={images}
            statusText="Cancelled"
            count={cancelledRidesCount}
            onPress={() =>
              navigation.navigate(
                'RidesLog' as never,
                { statusPassed: 'cancelled' } as never,
              )
            }
          />
        </ScrollView>

        <FinishedRidesCard
          totalRides={completedRidesCount}
          onPress={() => navigation.navigate('RidesScreen' as never)}
        />

        <View style={styles.footer}>
          <RegularText fontSize={12}>{CompanyName} Courier Limited</RegularText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.whiteColorF4,
  },
  scrollViewContent: {
    backgroundColor: Colors.whiteColorF4,
    margin: 12,
    gap: 12,
  },
  profileInfoContainer: {
    marginTop: 16,
  },
  finishedRidesContainer: {
    padding: 12,
    backgroundColor: Colors.whiteColor,
    borderRadius: 12,
    marginTop: 12,
    gap: 10,
  },
  finishedRidesContent: {
    gap: 16,
  },
  finishedRidesInfo: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rideStatusScrollContainer: {
    padding: 12,
    paddingTop: 24,
    paddingBottom: 12,
    marginBottom: 0,
    gap: 24,
  },
  statusCard: {
    alignItems: 'center',
  },
  statusCardInnerBorder: {
    padding: 4,
    borderRadius: 120,
    borderWidth: 2,
    width: 72,
    height: 72,
  },
  statusCardInnerBackground: {
    padding: 12,
    borderRadius: 120,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  statusCardImage: {
    width: 36,
    height: 36,
  },
  statusCardText: {
    margin: 0,
    padding: 0,
    fontSize: 14,
  },
  footer: {
    marginVertical: 48,
    alignSelf: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.whiteColorF4,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.primaryColor,
    borderRadius: 8,
  },
});

export default Home;
