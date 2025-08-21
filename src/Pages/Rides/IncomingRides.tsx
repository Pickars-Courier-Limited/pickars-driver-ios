import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Image,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {fetchRideSocketLogs} from '../../Redux/Riders/riders';
import {AppDispatch} from '../../Redux/store';
import AuthHeaders from '../../Components/Headers/AuthHeaders';
import {Colors} from '../../Components/Colors/Colors';
import {
  BoldText,
  MediumText,
  RegularText,
  SemiBoldText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import RefreshIcon from '../../Components/Icons/RefreshIcon/RefreshIcon';
import ArrowRightIcon from '../../Components/Icons/Arrows/ArrowRightIcon';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import IconsContainer from '../../Components/Icons/IconContainer';
import images from '../../../assets/images/newlogo.png';
import ErrorComponent from '../../Components/ErrorComponent/ErrorComponent';
import {getUserProfile} from '../../Redux/User/userSlice';
import {formatName} from '../Profile/Profile';
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
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format

  return `${hours}:${minutes < 10 ? '0' : ''}${minutes}${ampm}`;
};

const IncomingRides: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [rideSockets, setRideSockets] = useState<RideSocketLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [localProfile, setLocalProfile] = useState(null);
  // Function to fetch ride socket logs

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await dispatch(getUserProfile());
        setLocalProfile(response.payload); // Store fetched profile data
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [dispatch]);

  const fetchLogs = () => {
    setLoading(true);
    dispatch(fetchRideSocketLogs())
      .then((response: any) => {
        console.log('Response Payload:', response.payload); // Log the entire payload
        setRideSockets(response.payload?.rideSockets || []); // Update the rideSockets state
        setLoading(false);
      })
      .catch((err: any) => {
        console.error('Error fetching logs:', err); // Log detailed error
        setError(err?.response?.data || 'Error fetching logs');
        setLoading(false);
      });
  };
  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [dispatch]),
  );

  useEffect(() => {
    fetchLogs();
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLogs(); // Wait for the logs to be fetched
    setRefreshing(false); // Set refreshing to false after data is fetched
  };

  if (loading) {
    return (
      <View style={{flex: 1}}>
        <AuthHeaders title="New Ride Requests" infoText="" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0000ff" />
          <BoldText>Loading logs...</BoldText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <ErrorComponent
          errorMessage="Can not Retrieve Ride Details for this ride at the moment
     "
          onReload={onRefresh}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AuthHeaders title="New Ride Requests" infoText="" />
      <View style={styles.headerContainer}>
        {rideSockets.length > 0 ? (
          <FlatList
            contentContainerStyle={{paddingBottom: 120}}
            showsVerticalScrollIndicator={false}
            data={rideSockets}
            keyExtractor={item => item.rideId}
            renderItem={({item}: {item: RideSocketLog}) => (
              <>
                <Pressable
                  key={item.rideId}
                  style={{
                    marginBottom: 12,
                    padding: 12,
                    backgroundColor: Colors.whiteColor,
                    borderRadius: 24,
                    paddingTop: 24,
                  }}
                  onPress={() =>
                    navigation.navigate('RideDetailScreen', {
                      rideId: item.rideId,
                      userId: localProfile?._id,
                      status: 'new'
                    })
                  }>
                  <BoldText style={styles.actionButtonTextDark}>
                    New Ride Request
                  </BoldText>
                  <RegularText style={styles.actionButtonTextDark}>
                    {item.pickup.pickupAddress}
                  </RegularText>
                  <View style={styles.actionButtonTextDarkPickup}>
                    <RegularText style={styles.actionButtonTextDarkPickupText}>
                      Open to Accept
                    </RegularText>
                    <IconsContainer
                      backgroundColor={Colors.errorColor}
                      IconComponent={ArrowRightIcon}
                      iconColor={Colors.whiteColor}
                      iconWidth={16}
                      iconHeight={16}
                      padding={24}
                    />
                  </View>
                </Pressable>
              </>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <BoldText style={styles.noLogsText}>No logs available</BoldText>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.whiteColorF4,
  },
  headerContainer: {
    padding: 12,
    marginBottom: 64,
    // marginTop: 16,
  },
  header: {
    fontSize: 24,
    marginBottom: 8,
  },
  scrollView: {
    flexGrow: 1,
    backgroundColor: Colors.whiteColorF4,
  },
  card: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: Colors.whiteColor,
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    color: Colors.textColor,
    marginBottom: 8,
  },
  noLogsText: {
    fontSize: 18,
    color: Colors.textColor,
    textAlign: 'center',
    marginTop: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '80%',
  },
  actionButtonTextDark: {
    color: Colors.grayColor,
    fontSize: 16,
  },
  actionButtonTextDarkPickup: {
    backgroundColor: Colors.errorColorFaded,
    padding: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderRadius: 16,
  },
  actionButtonTextDarkPickupText: {
    color: Colors.errorColor,
    fontSize: 16,
    marginLeft: 6,
  },
});

export default IncomingRides;
