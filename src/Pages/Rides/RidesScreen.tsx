import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView, // Keeping this for the horizontal status toggles
  Pressable,
  SafeAreaView,
  StyleSheet,
  FlatList, // New: Using FlatList for the main ride list
} from 'react-native';
import {useDispatch} from 'react-redux';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  BoldText,
  MediumText,
  RegularText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import {Colors} from '../../Components/Colors/Colors';
import IconsContainer from '../../Components/Icons/IconContainer';
import BikeLogoIcon from '../../Components/Icons/Logo/LogoIcon';
import ShimmerLoader from '../../Components/Loader/ShimmerLoader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getRidesByDriver} from '../../Redux/Riders/riders';
import {AppDispatch} from '../../Redux/store';
import {formatDate} from '../Support/Messages/MessageSupport';

// Helper function to get ordinal suffix for dates
const getOrdinalSuffix = (day: number) => {
  if (day > 3 && day < 21) return `${day}th`; // Covers 11th to 20th
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

// Helper function to group logs by date
export const groupLogsByDate = (logs: any) => {
  const grouped = {};

  logs?.forEach((log, index) => {
    if (!log?.createdAt) {
      console.warn(`Skipping log ${index + 1}: Missing createdAt`, log);
      return;
    }

    const date = new Date(log?.createdAt);
    if (isNaN(date.getTime())) {
      console.warn(
        `Skipping log ${index + 1}: Invalid createdAt`,
        log?.createdAt,
      );
      return;
    }

    const day = date.getDate();
    const monthName = date.toLocaleString('en-US', {month: 'long'});
    const dayWithSuffix = getOrdinalSuffix(day);
    const formattedDate = `${date.toLocaleString('en-US', {
      weekday: 'short',
    })}, ${dayWithSuffix} ${monthName} ${date.getFullYear()}`;

    if (!grouped[formattedDate]) {
      grouped[formattedDate] = [];
    }
    grouped[formattedDate].push(log);
  });

  return Object.entries(grouped)
    .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA)) // Sort descending by date
    .map(([date, logs]) => ({date, logs}));
};

// Component for the status toggle buttons
interface StatusToggleButtonsProps {
  selectedStatus: string;
  onToggle: (status: string) => void;
}

const StatusToggleButtons: React.FC<StatusToggleButtonsProps> = ({
  selectedStatus,
  onToggle,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.toggleScrollContainer}>
      <View style={styles.toggleContainer}>
        {['All', 'Accepted', 'Started', 'Ended'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.toggleButton,
              selectedStatus === status && styles.activeToggle,
            ]}
            onPress={() => onToggle(status)}>
            <RegularText
              style={[
                styles.toggleText,
                selectedStatus === status && styles.activeToggleText,
              ]}>
              {status}
            </RegularText>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

// Component for the date group header
interface DateGroupHeaderProps {
  date: string;
}

const DateGroupHeader: React.FC<DateGroupHeaderProps> = ({date}) => {
  return (
    <View style={{alignSelf: 'flex-end'}}>
      <RegularText style={styles.dateHeader}>{date}</RegularText>
    </View>
  );
};

// Component for an individual ride log card
interface RideLogCardProps {
  log: any;
  onPress: () => void;
}

const RideLogCard: React.FC<RideLogCardProps> = ({log, onPress}) => {
  return (
    <Pressable style={styles.rideCard} onPress={onPress}>
      <IconsContainer
        backgroundColor={Colors.grayColorFaded}
        IconComponent={BikeLogoIcon}
        iconColor={Colors.grayColor}
        iconWidth={16}
        iconHeight={16}
        padding={24}
      />
      <View style={styles.rideInfo}>
        <MediumText style={styles.address}>
          {log?.pickup?.pickupAddress}
        </MediumText>
        <RegularText style={[styles.time, {fontSize: 14}]}>
          {formatDate(log?.createdAt)} || {`₦${log?.totalPrice}`}
        </RegularText>
      </View>
    </Pressable>
  );
};

// Main RidesScreen Component
const RidesScreen: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [logs, setLogs] = useState([]); // All fetched logs, grouped by date
  const [filteredLogs, setFilteredLogs] = useState([]); // Filtered logs based on status, grouped by date
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  // Fetch userId from AsyncStorage on component mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const temp = await AsyncStorage.getItem('temp_id');
        setUserId(temp || null);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };
    fetchUserId();
  }, []);

  // Function to fetch ride logs from the API
  const fetchLogs = useCallback(() => {
    setLoading(true);
    dispatch(getRidesByDriver())
      .then(response => {
        if (response?.payload?.success) {
          const sortedAndGroupedLogs = groupLogsByDate(
            response.payload.rideSockets,
          );
          setLogs(sortedAndGroupedLogs); // Store all logs
          setFilteredLogs(sortedAndGroupedLogs); // Initialize filtered logs with all logs
        }
      })
      .catch(err => {
        Alert.alert('Error', `Failed to fetch logs: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, [dispatch]);

  // Fetch logs when the screen focuses
  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [fetchLogs]),
  );

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  // Handle status toggle button press
  const handleToggle = (status: string) => {
    setSelectedStatus(status);

    if (status === 'All') {
      setFilteredLogs(logs); // If 'All' is selected, show all original logs
      return;
    }

    // Filter the logs based on the selected status
    const filtered = logs
      .map(({date, logs: dailyLogs}) => ({
        date,
        logs: dailyLogs?.filter((log: any) => {
          // console.log(status, log?.ride); // For debugging purposes
          switch (status) {
            case 'Accepted':
              return (
                log?.acceptRide === true && log?.startRide?.isStarted === false
              );
            case 'Started':
              return (
                log?.startRide?.isStarted === true &&
                log?.endRide?.isEnded === false
              );
            case 'Ended':
              return log?.endRide?.isEnded === true;
            default:
              return true; 
          }
        }),
      }))
      .filter(({logs: dailyLogs}) => dailyLogs.length > 0); 

    setFilteredLogs(filtered);
  };

  // Render item for the FlatList (each item is a date group)
  const renderItem = ({item}: any) => (
    <View>
      <DateGroupHeader date={item.date} />
      {item.logs.map((log: any, index: any) => (
        <RideLogCard
          key={log._id || index} // Use _id if available, otherwise index (ensure unique keys)
          log={log}
          onPress={() =>
            navigation.navigate('RideDetailScreen', {
              rideId: log?._id,
              userId,
            })
          }
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading || userId === null ? (
        <ShimmerLoader />
      ) : (
        <View style={{flex: 1, backgroundColor: Colors.whiteColorF4}}>
          <View style={{paddingHorizontal: 16, paddingTop: 16}}>
            <BoldText style={styles.requestsHeaders}>Ride Requests</BoldText>
            <StatusToggleButtons
              selectedStatus={selectedStatus}
              onToggle={handleToggle}
            />
          </View>

          {/* Main FlatList for displaying grouped ride logs */}
          <FlatList
            data={filteredLogs}
            renderItem={renderItem}
            keyExtractor={item => item.date}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContentContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <RegularText style={styles.noLogsText}>
                No rides available
              </RegularText>
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default RidesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  requestsHeaders: {
    fontSize: 24,
    paddingVertical: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    marginTop: 4,
    height: 34,
    gap: 4,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.grayColor,
  },
  toggleScrollContainer: {
    flexDirection: 'row',
  },
  activeToggle: {
    backgroundColor: Colors.primaryColor,
  },
  toggleText: {
    color: Colors.whiteColor,
    fontSize: 14,
  },
  activeToggleText: {}, // This style seems to be empty, consider removing if not used
  flatListContentContainer: {
    paddingHorizontal: 16, // Apply horizontal padding here for FlatList content
    paddingBottom: 12,
    flexGrow: 1, // Ensures content takes up available space for ListEmptyComponent to center
  },
  dateHeader: {
    fontSize: 14,
    marginTop: 24,
    marginBottom: 4,
  },
  noLogsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
  rideCard: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8, // Spacing between individual ride cards
    elevation: 0, // Ensure no shadow by default if not intended
  },
  rideInfo: {flex: 1, marginLeft: 10},
  address: {
    fontSize: 16,
    color: Colors.headerColor,
  },
  time: {fontSize: 12, color: Colors.grayColor},
});
