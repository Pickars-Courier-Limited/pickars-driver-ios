import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fetchRideSocketLogs } from '../../Redux/Riders/riders';
import { getUserProfile } from '../../Redux/User/userSlice';
import { AppDispatch } from '../../Redux/store';

// Components
import AuthHeaders from '../../Components/Headers/AuthHeaders';
import { Colors } from '../../Components/Colors/Colors';
import {
  BoldText,
  RegularText,
  MediumText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import ArrowRightIcon from '../../Components/Icons/Arrows/ArrowRightIcon';
import IconsContainer from '../../Components/Icons/IconContainer';
import ErrorComponent from '../../Components/ErrorComponent/ErrorComponent';
import UserLocationMap from '../Home/UserLocationMap';
import UserLocationRidesMap from '../Home/UserLocationRidesMap';

const IncomingRides: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  const [rideSockets, setRideSockets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localProfile, setLocalProfile] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    dispatch(getUserProfile()).then(res => {
      if (isMounted) setLocalProfile(res.payload);
    });
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const fetchLogs = useCallback(
    async (showLoadingIndicator = false) => {
      if (showLoadingIndicator) setLoading(true);
      setError(null);
      try {
        const response: any = await dispatch(fetchRideSocketLogs());
        setRideSockets(response.payload?.rideSockets || []);
      } catch (err: any) {
        setError(err?.message || 'Failed to sync ride requests');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      fetchLogs(rideSockets.length === 0);
    }, [fetchLogs]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        navigation.navigate('RideDetailScreen', {
          rideId: item.rideId,
          userId: localProfile?._id,
          status: 'new',
        })
      }
    >
      <UserLocationRidesMap
        ride={item}
        isRideStatus={true}
        isStatic={true}
        isShow={false}
      />

      <View style={styles.cardFooter}>
        <View>
          <MediumText style={styles.statusLabel}>ACTION REQUIRED</MediumText>
          <BoldText style={styles.footerCTA}>Review Request</BoldText>
        </View>
        <View style={styles.arrowCircle}>
          <ArrowRightIcon color={Colors.whiteColor} width={16} height={16} />
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <AuthHeaders title="Incoming Rides" />

      {/* Dynamic Summary Bar */}
      {!loading && (
        <View style={styles.summaryBar}>
          <MediumText color={Colors.grayColor}>
            {rideSockets.length} Available{' '}
            {rideSockets.length === 1 ? 'Request' : 'Requests'}
          </MediumText>
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
          <MediumText style={{ marginTop: 15, color: Colors.grayColor }}>
            Updating live requests...
          </MediumText>
        </View>
      ) : error ? (
        <ErrorComponent errorMessage={error} onReload={handleRefresh} />
      ) : (
        <FlatList
          data={rideSockets}
          keyExtractor={item => item.rideId}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primaryColor}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconPlaceholder} />
              <BoldText style={styles.emptyText}>
                No rides found nearby
              </BoldText>
              <RegularText style={styles.emptySubText}>
                We'll notify you as soon as a new request comes in.
              </RegularText>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB', // Slightly cooler white for better contrast
  },
  summaryBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.whiteColor,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  listPadding: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 24,
    padding: 14,
    marginBottom: 20,
    // Soft Premium Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  statusLabel: {
    fontSize: 10,
    color: Colors.errorColor,
    letterSpacing: 1,
    marginBottom: 2,
  },
  footerCTA: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  arrowCircle: {
    backgroundColor: '#1A1A1A', // Dark professional button
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.grayColor,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default IncomingRides;
