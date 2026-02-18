import React, { useEffect, useState, useMemo, memo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';

import {
  BoldText,
  RegularText,
  MediumText,
  SemiBoldText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import { Colors } from '../../Components/Colors/Colors';
import { formatName } from '../Profile/Profile';
import { GOOGLE_API_KEY } from '../config';

Geocoder.init(GOOGLE_API_KEY);

interface UserLocationMapProps {
  name?: any;
  isRideStatus?: boolean;
  ride?: any;
  isBig?: boolean;
}

const DEFAULT_COORDS = {
  latitude: 4.815554,
  longitude: 7.049844,
};

const UserLocationMap: React.FC<UserLocationMapProps> = memo(
  ({ name, isRideStatus = false, ride, isBig = false }) => {
    const navigation = useNavigation<any>();

    const [location, setLocation] = useState<{
      latitude: number;
      longitude: number;
    } | null>(null);

    const [locationLabel, setLocationLabel] = useState<string>('Locating...');

    const mapHeight = isRideStatus ? (isBig ? 240 : 120) : 220;

    // ─────────────────────────────────────────────
    // LOCATION INIT
    // ─────────────────────────────────────────────
    useEffect(() => {
      let mounted = true;

      const initLocation = async () => {
        const granted = await requestPermission();
        if (!granted) {
          setLocationLabel('Permission denied');
          return;
        }

        Geolocation.getCurrentPosition(
          position => {
            if (!mounted) return;

            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            setLocation(coords);
            reverseGeocode(coords.latitude, coords.longitude);
          },
          () => setLocationLabel('GPS Active'),
          { enableHighAccuracy: true, timeout: 15000 },
        );
      };

      initLocation();

      return () => {
        mounted = false;
      };
    }, []);

    const requestPermission = async () => {
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        return auth === 'granted';
      }

      if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }

      return false;
    };

    const reverseGeocode = async (lat: number, lng: number) => {
      try {
        const res = await Geocoder.from(lat, lng);
        const city = res.results[0]?.address_components?.find((c: any) =>
          c.types.includes('locality'),
        )?.long_name;

        setLocationLabel(city || 'Connected');
      } catch {
        setLocationLabel('Connected');
      }
    };

    const initialRegion = useMemo(() => {
      let lat = location?.latitude ?? DEFAULT_COORDS.latitude;
      let lng = location?.longitude ?? DEFAULT_COORDS.longitude;

      if (isRideStatus && ride?.pickup) {
        lat = ride.pickup.pickupLatitude ?? lat;
        lng = ride.pickup.pickupLongitude ?? lng;
      }

      return {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
    }, [location, ride?.pickup, isRideStatus]);

    const handlePress = () => {
      navigation.navigate('MapViewPage', { ride });
    };

    return (
      <Pressable
        onPress={handlePress}
        style={[
          styles.container,
          isRideStatus && styles.rideContainer,
          isBig && styles.fullWidth,
        ]}
      >
        {/* ───────────────── Header Section ───────────────── */}
        {!isRideStatus ? (
          <View style={styles.header}>
            <View>
              <RegularText style={styles.label}>Current Location</RegularText>
              <BoldText style={styles.name}>
                {formatName(name?.firstName)} {formatName(name?.lastName)}
              </BoldText>
            </View>

            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <MediumText style={styles.badgeText}>{locationLabel}</MediumText>
            </View>
          </View>
        ) : (
          <View style={styles.rideHeader}>
            <SemiBoldText style={styles.rideHeaderText}>
              Tap to open full map & navigation
            </SemiBoldText>
          </View>
        )}

        {/* ───────────────── Map Section ───────────────── */}
        <View style={[styles.mapWrapper, { height: mapHeight }]}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
            initialRegion={initialRegion}
            showsUserLocation={!isRideStatus}
            showsMyLocationButton={false}
          >
            {location && !isRideStatus && (
              <Marker coordinate={location}>
                <View style={styles.markerOuter}>
                  <View style={styles.markerInner} />
                </View>
              </Marker>
            )}
          </MapView>
        </View>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 4,
      },
    }),
  },

  rideContainer: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    elevation: 0,
  },

  fullWidth: {
    marginHorizontal: 0,
  },

  // ───────────────── Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },

  label: {
    fontSize: 13,
    color: '#667085',
    marginBottom: 4,
  },

  name: {
    fontSize: 20,
    color: '#1D2939',
    letterSpacing: -0.2,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryColorFaded,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryColor,
    marginRight: 6,
  },

  badgeText: {
    fontSize: 13,
    color: Colors.primaryColor,
  },

  // ───────────────── Ride Header
  rideHeader: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  rideHeaderText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#1D2939',
  },

  // ───────────────── Map
  mapWrapper: {
    width: '100%',
    backgroundColor: '#F2F4F7',
  },

  // ───────────────── Marker
  markerOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(37,99,235,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  markerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2563EB',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});

export default UserLocationMap;
