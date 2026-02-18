import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import {
  BoldText,
  RegularText,
  MediumText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import { Colors } from '../../Components/Colors/Colors';
import { formatName } from '../Profile/Profile';
import IconsContainer from '../../Components/Icons/IconContainer';
import ArrowRightIcon from '../../Components/Icons/Arrows/ArrowRightIcon';
import DummyLocationUpdater from './DummyLocationUpdater';

interface Location {
  latitude: number;
  longitude: number;
}

interface UserMapProps {
  name?: any;
  isRideStatus?: boolean;
  ride?: any;
  onMapPress?: () => void;
  isBig?: boolean;
}

const UserMap: React.FC<UserMapProps> = ({
  name,
  isRideStatus,
  ride,
  isBig,
}) => {
  const navigation = useNavigation();
  const [location, setLocation] = useState<Location>({
    latitude: 6.5244, // Default to Lagos (or your preferred default)
    longitude: 3.3792,
  });
  const [locationDetails, setLocationDetails] =
    useState<string>('Detecting GPS...');

  useEffect(() => {
    // Simulating location fetch
    setTimeout(() => {
      setLocationDetails('Victoria Island, Lagos');
    }, 1500);
  }, []);

  const mapHeight = isRideStatus ? (isBig ? 240 : 100) : 180;

  const formattedPrice = ride?.totalPrice
    ? new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
      }).format(ride.totalPrice)
    : '';

  return (
    <View style={[styles.cardContainer, isRideStatus && styles.noPadding]}>
      {/* 1. TOP INFO BAR (Only shown when not in a mini ride-status view) */}
      {!isRideStatus && (
        <View style={styles.topInfoRow}>
          <View style={styles.locationInfo}>
            <View style={styles.statusDot} />
            <MediumText fontSize={12} color="#8E8E93">
              {locationDetails.toUpperCase()}
            </MediumText>
          </View>
          <RegularText fontSize={11} color={Colors.primaryColor}>
            GPS STABLE
          </RegularText>
        </View>
      )}

      {/* 2. RIDE HEADER (Shown during active rides) */}
      {isRideStatus && (
        <View style={styles.rideHeader}>
          <View style={{ flex: 1 }}>
            <RegularText fontSize={12} color="#8E8E93">
              PICKUP FROM
            </RegularText>
            <BoldText fontSize={15} color="#1C1C1E" numberOfLines={1}>
              {ride?.pickup?.pickupAddress || 'Address not found'}
            </BoldText>
          </View>
          {formattedPrice && (
            <View style={styles.priceTag}>
              <BoldText fontSize={16} color={Colors.primaryColor}>
                {formattedPrice}
              </BoldText>
            </View>
          )}
        </View>
      )}

      {/* 3. MAP AREA */}
      <Pressable
        onPress={() =>
          navigation.navigate('MapViewPage' as never, { ride } as never)
        }
        style={[styles.mapWrapper, { height: mapHeight }]}
      >
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: ride?.pickup?.pickupLatitude || location.latitude,
            longitude: ride?.pickup?.pickupLongitude || location.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }}
          scrollEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          {/* User Marker */}
          <Marker coordinate={location}>
            <View style={styles.userMarkerContainer}>
              <View style={styles.userMarkerOuter}>
                <View style={styles.userMarkerInner} />
              </View>
            </View>
          </Marker>

          {/* Active Ride Markers & Path */}
          {isRideStatus && ride?.pickup && (
            <>
              <Marker
                coordinate={{
                  latitude: ride.pickup.pickupLatitude,
                  longitude: ride.pickup.pickupLongitude,
                }}
              />
              <Polyline
                coordinates={[
                  location,
                  {
                    latitude: ride.pickup.pickupLatitude,
                    longitude: ride.pickup.pickupLongitude,
                  },
                ]}
                strokeColor={Colors.primaryColor}
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            </>
          )}
        </MapView>

        {/* Floating View Control */}
        {isBig && (
          <View style={styles.floatingAction}>
            <MediumText fontSize={12} color="#FFFFFF">
              Expand View
            </MediumText>
            <ArrowRightIcon color="#FFFFFF" width={14} height={14} />
          </View>
        )}
      </Pressable>

      {/* Background Services */}
      {!isRideStatus && <DummyLocationUpdater profile={name} />}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  noPadding: {
    padding: 0,
    borderWidth: 0,
  },
  topInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  priceTag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mapWrapper: {
    width: '100%',
    backgroundColor: '#E5E5EA',
  },
  userMarkerContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  floatingAction: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
  },
});

export default UserMap;
