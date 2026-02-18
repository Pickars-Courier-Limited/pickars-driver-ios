import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  BoldText,
  MediumText,
  RegularText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import { Colors } from '../../Components/Colors/Colors';
import ShimmerLoader from '../../Components/Loader/ShimmerLoader';
import IconsContainer from '../../Components/Icons/IconContainer';
import BikeLogoIcon from '../../Components/Icons/Logo/LogoIcon';

import { getRidesByDriver } from '../../Redux/Riders/riders';
import { AppDispatch } from '../../Redux/store';
import { formatDate } from '../Support/Messages/MessageSupport';

// --- Types ---
type RideStatus = 'All' | 'Accepted' | 'Started' | 'Ended';

interface RideLog {
  _id: string;
  pickup: { pickupAddress: string };
  createdAt: string;
  totalPrice: number;
  acceptRide?: boolean;
  startRide?: { isStarted: boolean };
  endRide?: { isEnded: boolean };
}

interface DateGroup {
  date: string;
  data: RideLog[];
}

// --- Helpers ---
const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return `${day}th`;
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

const formatGroupDate = (dateString: string) => {
  const dateObj = new Date(dateString);
  const day = dateObj.getDate();
  const weekday = dateObj.toLocaleString('en-US', { weekday: 'short' });
  const month = dateObj.toLocaleString('en-US', { month: 'short' });
  return `${weekday}, ${getOrdinalSuffix(day)} ${month}`;
};

// --- Sub-Components ---

const StatusFilter = ({
  current,
  onChange,
}: {
  current: RideStatus;
  onChange: (s: RideStatus) => void;
}) => {
  const statuses: RideStatus[] = ['All', 'Accepted', 'Started', 'Ended'];
  return (
    <View style={styles.filterContainer}>
      {statuses.map(status => {
        const isActive = current === status;
        return (
          <TouchableOpacity
            key={status}
            onPress={() => onChange(status)}
            style={styles.filterTab}
            activeOpacity={0.8}
          >
            <MediumText
              style={[
                styles.filterTabText,
                isActive && styles.activeFilterTabText,
              ]}
            >
              {status}
            </MediumText>
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const RideItem = ({
  item,
  onPress,
}: {
  item: RideLog;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.rideItem}
    onPress={onPress}
    activeOpacity={0.6}
  >
    <View style={styles.iconContainer}>
      <View style={styles.iconCircle}>
        <BikeLogoIcon width={20} height={20} color={Colors.primaryColor} />
      </View>
      <View style={styles.verticalLine} />
    </View>

    <View style={styles.rideDetails}>
      <View style={styles.rowBetween}>
        <MediumText numberOfLines={1} style={styles.addressText}>
          {item.pickup?.pickupAddress || 'Address not available'}
        </MediumText>
        <BoldText style={styles.priceText}>
          ₦{item.totalPrice?.toLocaleString() || '0'}
        </BoldText>
      </View>
      <RegularText style={styles.timeText}>
        {formatDate(item.createdAt)}
      </RegularText>
    </View>
  </TouchableOpacity>
);

// --- Main Screen ---

const RidesScreen = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [allRides, setAllRides] = useState<RideLog[]>([]);
  const [statusFilter, setStatusFilter] = useState<RideStatus>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();

  const fetchData = useCallback(async () => {
    try {
      const res = await dispatch(getRidesByDriver()).unwrap();
      if (res?.success) setAllRides(res.rideSockets || []);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to sync rides');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    AsyncStorage.getItem('temp_id').then(setUserId);
    fetchData();
  }, [fetchData]);

  // Handle Filter Change + Auto Scroll to Top
  const handleFilterChange = (status: RideStatus) => {
    setStatusFilter(status);
    // Smooth scroll to top when filter changes
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const groupedData = useMemo(() => {
    const filtered = allRides.filter(ride => {
      if (statusFilter === 'Accepted')
        return ride.acceptRide && !ride.startRide?.isStarted;
      if (statusFilter === 'Started')
        return ride.startRide?.isStarted && !ride.endRide?.isEnded;
      if (statusFilter === 'Ended') return ride.endRide?.isEnded;
      return true;
    });

    const groups: Record<string, RideLog[]> = {};
    filtered.forEach(ride => {
      const key = formatGroupDate(ride.createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(ride);
    });

    return Object.entries(groups).map(([date, data]) => ({ date, data }));
  }, [allRides, statusFilter]);

  if (loading)
    return (
      <SafeAreaView style={styles.screen}>
        <ShimmerLoader />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Premium Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <BoldText style={styles.headerTitle}>Ride Logs</BoldText>
          <View style={styles.badge}>
            <RegularText style={styles.badgeText}>
              {allRides.length} Total
            </RegularText>
          </View>
        </View>
        <StatusFilter current={statusFilter} onChange={handleFilterChange} />
      </View>

      <FlatList
        ref={flatListRef}
        data={groupedData}
        keyExtractor={item => item.date}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
            tintColor={Colors.primaryColor}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <RegularText style={styles.emptyText}>
              No rides found for "{statusFilter}"
            </RegularText>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MediumText style={styles.sectionTitle}>{item.date}</MediumText>
              <View style={styles.titleLine} />
            </View>
            {item.data.map(ride => (
              <RideItem
                key={ride._id}
                item={ride}
                onPress={() =>
                  navigation.navigate('RideDetailScreen', {
                    rideId: ride._id,
                    userId,
                  })
                }
              />
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 26,
    color: Colors.headerColor,
  },
  badge: {
    backgroundColor: '#F0F0F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    color: Colors.grayColor,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  filterTab: {
    paddingHorizontal: 15,
    paddingBottom: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  filterTabText: {
    fontSize: 15,
    color: '#999',
  },
  activeFilterTabText: {
    color: Colors.primaryColor,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '100%',
    backgroundColor: Colors.primaryColor,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  listContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#BBB',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  titleLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 15,
  },
  rideItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  iconContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  verticalLine: {
    flex: 1,
    width: 1.5,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
  rideDetails: {
    flex: 1,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F9F9FB',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  addressText: {
    fontSize: 16,
    color: Colors.headerColor,
    flex: 1,
    marginRight: 10,
  },
  priceText: {
    fontSize: 16,
    color: Colors.primaryColor,
  },
  timeText: {
    fontSize: 13,
    color: Colors.grayColor,
    marginTop: 4,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.grayColor,
    fontSize: 15,
  },
});

export default RidesScreen;
