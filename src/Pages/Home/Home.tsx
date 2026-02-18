import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors } from '../../Components/Colors/Colors';
import ShimmerLoader from '../../Components/Loader/ShimmerLoader';
import { getUserProfile } from '../../Redux/User/userSlice';
import { AppDispatch } from '../../Redux/Store';
import { CompanyName } from '../../CompanyName';
import {
  RegularText,
  SemiBoldText,
  BoldText,
  MediumText,
} from '../../Components/Texts/CustomTexts/BaseTexts';

import { formatName } from '../Profile/Profile';
import {
  fetchRideSocketLogs,
  getRidesByDriver,
} from '../../Redux/Riders/riders';
import UserLocationMap from './UserLocationMap';
import UserMap from './UserMap';

const { width } = Dimensions.get('window');

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    new: 0,
    accepted: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
    todayTotal: 0,
    todayFinished: 0,
  });

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const calculateRideStats = useCallback((allRides: any[]) => {
    const accepted = allRides.filter(
      r => r?.acceptRide && !r?.startRide?.isStarted && !r?.endRide?.isEnded,
    );
    const ongoing = allRides.filter(
      r => r?.acceptRide && r?.startRide?.isStarted && !r?.endRide?.isEnded,
    );
    const completed = allRides.filter(r => r?.endRide?.isEnded);
    const cancelled = allRides.filter(r => r?.cancelRide?.isCancelled);
    const todayRides = allRides.filter(r => isToday(r.createdAt));
    const todayFinished = completed.filter(r => isToday(r.endRide?.endedAt));

    setStats(prev => ({
      ...prev,
      accepted: accepted.length,
      ongoing: ongoing.length,
      completed: completed.length,
      cancelled: cancelled.length,
      total: allRides.length,
      todayTotal: todayRides.length,
      todayFinished: todayFinished.length,
    }));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, ridesRes, logsRes] = await Promise.all([
        dispatch(getUserProfile()).unwrap(),
        dispatch(getRidesByDriver()),
        dispatch(fetchRideSocketLogs()),
      ]);
      setUserProfile(profileRes);
      setStats(prev => ({
        ...prev,
        new: logsRes.payload?.rideSockets?.length || 0,
      }));
      if (ridesRes?.payload?.success) {
        const flattened = Object.values(
          ridesRes.payload.rideSockets || {},
        ).flat();
        calculateRideStats(flattened);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch, calculateRideStats]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  if (loading) return <ShimmerLoader />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
      >
        {/* HEADER AREA */}
        <View style={styles.header}>
          <View>
            <RegularText fontSize={14} color="#8E8E93">
              Good morning,
            </RegularText>
            <BoldText fontSize={24} color="#1C1C1E">
              {formatName(userProfile?.firstName)}
            </BoldText>
          </View>
          <View style={styles.statusIndicator}>
            <View style={styles.pulseDot} />
            <MediumText fontSize={12} color="#34C759">
              Online
            </MediumText>
          </View>
        </View>

        {/* MAP CARD: Clean & Integrated */}
        <View style={styles.mapWrapper}>
          <UserMap name={userProfile} />
          <View style={styles.mapLabel}>
            <MediumText fontSize={10} color="#FFFFFF">
              LIVE LOCATION
            </MediumText>
          </View>
        </View>

        {/* URGENT ACTION: Highlighted New Orders */}
        <Pressable
          style={styles.urgentCard}
          onPress={() => navigation.navigate('IncomingRides' as never)}
        >
          <View>
            <SemiBoldText
              fontSize={14}
              color="#FFFFFF"
              style={{ opacity: 0.8 }}
            >
              New Orders
            </SemiBoldText>
            <BoldText fontSize={32} color="#FFFFFF">
              {stats.new}
            </BoldText>
          </View>
          <View style={styles.whiteArrow}>
            <MediumText fontSize={12} color={Colors.primaryColor}>
              View
            </MediumText>
          </View>
        </Pressable>

        {/* STATS BENTO GRID */}
        <View style={styles.bentoGrid}>
          <Pressable
            style={styles.bentoItem}
            onPress={() =>
              navigation.navigate('RidesLog', { statusPassed: 'ongoing' })
            }
          >
            <SemiBoldText fontSize={12} color="#8E8E93">
              ONGOING
            </SemiBoldText>
            <BoldText fontSize={22} color="#1C1C1E">
              {stats.ongoing}
            </BoldText>
          </Pressable>

          <Pressable
            style={styles.bentoItem}
            onPress={() =>
              navigation.navigate('RidesLog', { statusPassed: 'accepted' })
            }
          >
            <SemiBoldText fontSize={12} color="#8E8E93">
              ACCEPTED
            </SemiBoldText>
            <BoldText fontSize={22} color="#1C1C1E">
              {stats.accepted}
            </BoldText>
          </Pressable>
        </View>

        {/* PERFORMANCE FOOTPRINT */}
        <View style={styles.performanceSection}>
          <View style={styles.sectionTitle}>
            <BoldText fontSize={18} color="#1C1C1E">
              Daily Performance
            </BoldText>
            <RegularText fontSize={12} color="#8E8E93">
              Today
            </RegularText>
          </View>

          <View style={styles.performanceCard}>
            <View style={styles.perfStat}>
              <BoldText fontSize={20} color="#1C1C1E">
                {stats.todayFinished}
              </BoldText>
              <RegularText fontSize={11} color="#8E8E93">
                Completed
              </RegularText>
            </View>
            <View style={styles.perfDivider} />
            <View style={styles.perfStat}>
              <BoldText fontSize={20} color="#1C1C1E">
                {stats.total}
              </BoldText>
              <RegularText fontSize={11} color="#8E8E93">
                Total Trips
              </RegularText>
            </View>
            <View style={styles.perfDivider} />
            <View style={styles.perfStat}>
              <BoldText fontSize={20} color={Colors.errorColor}>
                {stats.cancelled}
              </BoldText>
              <RegularText fontSize={11} color="#8E8E93">
                Cancelled
              </RegularText>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <MediumText
            fontSize={11}
            color="#C7C7CC"
            style={{ letterSpacing: 1.5 }}
          >
            {CompanyName.toUpperCase()} LOGISTICS
          </MediumText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollContent: { padding: 20, paddingBottom: 60 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F9EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },

  mapWrapper: {
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  mapLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  urgentCard: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primaryColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  whiteArrow: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },

  bentoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 25,
  },
  bentoItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  performanceSection: {
    marginTop: 10,
  },
  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
    paddingHorizontal: 4,
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  perfStat: {
    flex: 1,
    alignItems: 'center',
  },
  perfDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E5EA',
  },

  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
});

export default Home;
