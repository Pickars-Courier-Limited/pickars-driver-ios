import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import { useDispatch } from 'react-redux';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { useSocket } from '../../Context/useSocket';
import { AppDispatch } from '../../Redux/store';
import { fetchRideById } from '../../Redux/Riders/riders';

import MessageIcon from '../../Components/Icons/MessageIcon/MessageIcon';
import PhoneCallIcon from '../../Components/Icons/PhoneCall/PhoneCallIcon';

import {
  BoldText,
  MediumText,
  RegularText,
  SemiBoldText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import AuthHeaders from '../../Components/Headers/AuthHeaders';
import ErrorComponent from '../../Components/ErrorComponent/ErrorComponent';
import ShimmerLoader from '../../Components/Loader/ShimmerLoader';
import RideStatusAndActions from './RideStatusAndActions';
import UserLocationMap from '../Home/UserLocationMap'; // New Restyled Map

import { formatDate } from '../Support/Messages/MessageSupport';
import { formatName } from '../../Components/Headers/MessageHeaders';
import { Colors } from '../../Components/Colors/Colors';

// ────────────────────────────────────────────────────────────────────
// REUSABLE SUB-COMPONENTS
// ────────────────────────────────────────────────────────────────────

const PaymentStatusBadge = ({
  isPaid,
  method,
}: {
  isPaid: boolean;
  method?: string;
}) => (
  <View style={[styles.paymentBadge, isPaid ? styles.paidBg : styles.unpaidBg]}>
    <View
      style={[
        styles.statusDotSmall,
        { backgroundColor: isPaid ? '#10B981' : '#F59E0B' },
      ]}
    />
    <View>
      <BoldText
        style={[styles.paymentText, { color: isPaid ? '#065F46' : '#92400E' }]}
      >
        {isPaid ? 'PAYMENT RECEIVED' : 'PENDING PAYMENT'}
      </BoldText>
      {method && <RegularText style={styles.methodText}>{method}</RegularText>}
    </View>
  </View>
);

const SectionLabel = ({ title, color }: { title: string; color: string }) => (
  <View style={styles.sectionLabelRow}>
    <View style={[styles.labelDot, { backgroundColor: color }]} />
    <BoldText style={styles.labelText}>{title}</BoldText>
  </View>
);

// ────────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ────────────────────────────────────────────────────────────────────

const RideDetailScreen = () => {
  const route = useRoute<any>();
  const { rideId, userId } = route.params ?? {};
  const dispatch = useDispatch<AppDispatch>();
  const { socket } = useSocket();
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);

  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadRide = useCallback(async () => {
    try {
      const result = await dispatch(fetchRideById(rideId)).unwrap();
      if (result.success) setRide(result.data);
    } catch (err: any) {
      setError(err.message || 'Details unavailable');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch, rideId]);

  useFocusEffect(
    useCallback(() => {
      loadRide();
    }, [loadRide]),
  );

  useEffect(() => {
    if (!socket || !userId) return;
    socket.emit('joinDriver', userId);
    return () => {
      socket.off('riderJoined');
    };
  }, [socket, userId]);

  const handleRideAction = (action: string) => {
    if (!socket || actionLoading) return;
    setActionLoading(true);
    socket.emit(action, { rideId, driverId: userId, ride, [action]: true });

    scrollRef.current?.scrollTo({ y: 0, animated: true });

    setTimeout(() => {
      setActionLoading(false);
      loadRide();
    }, 3000);
  };

  if (loading)
    return (
      <SafeAreaView style={styles.safeArea}>
        <ShimmerLoader />
      </SafeAreaView>
    );
  if (error || !ride)
    return (
      <ErrorComponent
        errorMessage={error ?? 'Ride not found'}
        onReload={loadRide}
      />
    );

  const status = ride.endRide?.isEnded
    ? 'Completed'
    : ride.startRide?.isStarted
    ? 'In Transit'
    : 'Pickup';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <AuthHeaders title={`Order #${rideId?.slice(-6).toUpperCase()}`} />

      <ScrollView
        ref={scrollRef}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadRide();
            }}
          />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status & Summary Card */}
        <View style={styles.topSummaryCard}>
          <View style={styles.statusHeader}>
            <View>
              <BoldText style={styles.statusMainText}>{status}</BoldText>
              <RegularText style={styles.dateText}>
                {formatDate(ride.createdAt)}
              </RegularText>
            </View>
            <View style={styles.priceContainer}>
              <BoldText style={styles.currency}>₦</BoldText>
              <BoldText style={styles.amount}>
                {ride.totalPrice?.toLocaleString()}
              </BoldText>
            </View>
          </View>

          <PaymentStatusBadge
            isPaid={ride.paid?.isPaid}
            method={ride.paid?.paymentMethod}
          />
        </View>

        {/* --- MAP SECTION (Now uses the Premium Restyled Map) --- */}
        <View style={styles.mapWrapper}>
          <UserLocationMap ride={ride} isRideStatus={true} isBig={true} />
        </View>

        {/* Timeline Flow */}
        <View style={styles.detailsContainer}>
          {/* Pickup Section */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View
                style={[
                  styles.timelineDot,
                  { backgroundColor: Colors.primaryColor },
                ]}
              />
              <View style={styles.timelineLine} />
            </View>
            <View style={styles.timelineRight}>
              <SectionLabel title="PICKUP FROM" color={Colors.primaryColor} />
              <SemiBoldText style={styles.addressText}>
                {ride.pickup?.pickupAddress}
              </SemiBoldText>

              <View style={styles.userActionBox}>
                <View style={{ flex: 1 }}>
                  <MediumText style={styles.userName}>
                    {formatName(
                      ride.customer?.firstName + ' ' + ride.customer?.lastName,
                    )}
                  </MediumText>
                  {ride.pickup?.pickupCode && (
                    <View style={styles.codeBadge}>
                      <BoldText style={styles.codeText}>
                        CODE: {ride.pickup.pickupCode}
                      </BoldText>
                    </View>
                  )}
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.circleBtn}
                    onPress={() =>
                      navigation.navigate('ChatPage', {
                        _id: ride._id,
                        driverName: ride.customer?.firstName,
                        imageUrl: ride.customer?.imageUrl,
                      })
                    }
                  >
                    <MessageIcon
                      color={Colors.headerColor}
                      width={20}
                      height={20}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.circleBtn}
                    onPress={() =>
                      Linking.openURL(`tel:${ride.customer?.phoneNumber}`)
                    }
                  >
                    <PhoneCallIcon
                      fill={Colors.headerColor}
                      width={20}
                      height={20}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Delivery Section */}
          {ride.deliveryDropoff?.map((loc: any, idx: number) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[styles.timelineDot, { backgroundColor: '#FF9800' }]}
                />
                {idx !== ride.deliveryDropoff.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>
              <View style={styles.timelineRight}>
                <SectionLabel
                  title={`DROP-OFF ${
                    ride.deliveryDropoff.length > 1 ? idx + 1 : ''
                  }`}
                  color="#FF9800"
                />
                <SemiBoldText style={styles.addressText}>
                  {loc.deliveryAddress}
                </SemiBoldText>

                <View style={styles.receiverBox}>
                  <View style={styles.receiverInfo}>
                    <MediumText style={styles.receiverName}>
                      {loc.receiverName}
                    </MediumText>
                    <RegularText style={styles.receiverPhone}>
                      {loc.receiverPhoneNumber}
                    </RegularText>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(`tel:${loc.receiverPhoneNumber}`)
                    }
                  >
                    <PhoneCallIcon
                      fill={Colors.primaryColor}
                      width={18}
                      height={18}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Action Button Footer */}
        <View style={styles.actionFooter}>
          <RideStatusAndActions
            rideDetails={ride}
            isButtonDisabled={actionLoading}
            handleAction={handleRideAction}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingBottom: 40 },

  // Header Summary
  topSummaryCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#F8F9FF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E8ECFF',
    marginBottom: 10,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusMainText: { fontSize: 22, color: Colors.headerColor },
  dateText: { fontSize: 13, color: Colors.grayColor, marginTop: 4 },
  priceContainer: { flexDirection: 'row', alignItems: 'center' },
  currency: { color: Colors.primaryColor, fontSize: 16, marginRight: 2 },
  amount: { fontSize: 24, color: Colors.headerColor },

  // Payment Badges
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  paidBg: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  unpaidBg: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  statusDotSmall: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  paymentText: { fontSize: 12, letterSpacing: 0.5 },
  methodText: { fontSize: 11, color: '#6B7280', marginTop: 2 },

  // Map Wrapper
  mapWrapper: {
    marginHorizontal: 20,
    marginBottom: 25,
  },

  // Timeline UI
  detailsContainer: { paddingHorizontal: 20 },
  timelineItem: { flexDirection: 'row' },
  timelineLeft: { alignItems: 'center', marginRight: 15 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, zIndex: 2 },
  timelineLine: { flex: 1, width: 2, backgroundColor: '#F0F0F5' },
  timelineRight: { flex: 1, paddingBottom: 30 },

  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  labelText: { fontSize: 11, color: Colors.grayColor, letterSpacing: 1 },
  addressText: { fontSize: 16, color: Colors.headerColor, lineHeight: 22 },

  // Contact Boxes
  userActionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginTop: 15,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: { elevation: 1 },
    }),
  },
  userName: { fontSize: 15, color: Colors.headerColor },
  codeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryColorFaded,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 5,
  },
  codeText: { fontSize: 10, color: Colors.primaryColor },
  actionRow: { flexDirection: 'row', gap: 10 },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  receiverBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    marginTop: 10,
  },
  receiverName: { fontSize: 14, color: Colors.headerColor },
  receiverPhone: { fontSize: 12, color: Colors.grayColor },

  actionFooter: { marginTop: 10,  },
});

export default RideDetailScreen;
