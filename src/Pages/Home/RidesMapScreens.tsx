import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import UserLocationMap from '../Home/UserLocationMap'; // ← your existing map component
import AuthHeaders from '../../Components/Headers/AuthHeaders';
import { Colors } from '../../Components/Colors/Colors';

const RidesMapScreens = () => {
  const route = useRoute<any>();
  const { rideId, pickup, dropoffs, status } = route.params ?? {};

  return (
    <SafeAreaView style={styles.container}>
      <AuthHeaders
        title={`Map • Order #${rideId?.slice(-6).toUpperCase() || '—'}`}
      />

      <View style={styles.mapContainer}>
        <UserLocationMap ride={route.params} isRideStatus={true} isBig={true} />
      </View>

      {/* Optional floating info panel */}
      <View style={styles.floatingInfo}>
        <Text style={styles.statusTitle}>{status || 'Active'}</Text>
        <Text style={styles.addressPreview} numberOfLines={2}>
          {pickup?.pickupAddress || 'Pickup location'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
  floatingInfo: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.headerColor,
    marginBottom: 4,
  },
  addressPreview: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});

export default RidesMapScreens;
