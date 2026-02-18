import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, Pressable, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { Colors } from '../../Components/Colors/Colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GOOGLE_API_KEY } from '../config';
import polyline from '@mapbox/polyline';
import HomeIcon from '../../Components/Icons/HomeIcon/HomeIcon';
import images from '../../../assets/images/newlogo.png';
import { BoldText } from '../../Components/Texts/CustomTexts/BaseTexts';
import IconsContainer from '../../Components/Icons/IconContainer';
import ArrowLeftIcon from '../../Components/Icons/Arrows/ArrowLeftIcon';
import { useToast } from '../../Context/useToast';

interface Location {
  latitude: number;
  longitude: number;
}
interface PickupLocation {
  pickupLatitude: number;
  pickupLongitude: number;
  pickupAddress: string;
}
interface RideDeliveryLocation {
  deliveryLatitude: number;
  deliveryLongitude: number;
  deliveryAddress?: string;
}
interface Ride {
  pickup: PickupLocation;
  deliveryDropoff: RideDeliveryLocation[];
  totalPrice: any;
  startRide: {
    isStarted: boolean;
  };
}

const MapViewPage: React.FC = () => {
  const [address, setAddress] = useState<string>('');
  const [location, setLocation] = useState<Location | null>(null);
  const YOUR_API_KEY = GOOGLE_API_KEY;
  const route = useRoute();
  const ride = (route.params as { ride?: Ride })?.ride;
  const [routeCoordinates, setRouteCoordinates] = useState<Location[]>([]);
  const mapRef = useRef<MapView>(null);
  const { addToast } = useToast();
  const navigation = useNavigation();

  // Function to get the user's location without requesting permission
  const fetchLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);
        console.log('Real user location:', newLocation);
      },
      (error) => {
        console.error('Geolocation Error:', error);
        addToast(`Error getting location: ${error.message}`, 'error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleRefreshLocation = () => {
    fetchLocation();
    addToast('Location Refreshed', 'success');
  };

  useEffect(() => {
    fetchLocation();
    const watchId = Geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.error('Location watch error:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
      }
    );
    return () => Geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      );
    }
  }, [location]);

  useEffect(() => {
    const getAddressFromCoordinates = async () => {
      if (!location) {
        setAddress('');
        return;
      }
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${YOUR_API_KEY}`,
        );
        const json = await response.json();
        if (json.results && json.results.length > 0) {
          setAddress(json.results[0].formatted_address);
        } else {
          console.warn('No address found for these coordinates.');
          setAddress('Address not found');
        }
      } catch (error) {
        console.error('Error fetching address:', error);
        setAddress('Error fetching address');
      }
    };
    getAddressFromCoordinates();
  }, [location, YOUR_API_KEY]);

  useEffect(() => {
    const getDirections = async () => {
      if (!ride || !ride.pickup || !location) {
        setRouteCoordinates([]);
        return;
      }

      let origin = location;
      let destination;
      let waypoints = [];

      if (!ride.startRide.isStarted) {
        // Route from current location to pickup
        destination = {
          latitude: ride.pickup.pickupLatitude,
          longitude: ride.pickup.pickupLongitude,
        };
      } else if (ride.deliveryDropoff && ride.deliveryDropoff.length > 0) {
        // Route from current location to first delivery location
        destination = {
          latitude: ride.deliveryDropoff[0].deliveryLatitude,
          longitude: ride.deliveryDropoff[0].deliveryLongitude,
        };
      } else {
        console.warn('Ride started but no valid delivery drop-offs found.');
        setRouteCoordinates([]);
        return;
      }

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${YOUR_API_KEY}`,
        );
        const json = await response.json();

        if (json.routes && json.routes.length > 0) {
          const points = json.routes[0].overview_polyline.points;
          const decodedPoints = polyline.decode(points).map((point: [number, number]) => ({
            latitude: point[0],
            longitude: point[1],
          }));
          setRouteCoordinates(decodedPoints);
        } else {
          console.warn('No routes found:', json);
          setRouteCoordinates([origin, destination]);
        }
      } catch (error) {
        console.error('Error fetching directions:', error);
        setRouteCoordinates([origin, destination]);
      }
    };

    if (ride && location) {
      getDirections();
    }
  }, [ride, location, YOUR_API_KEY]);

  const initialRegion = ride?.pickup
    ? {
        latitude: ride.pickup.pickupLatitude,
        longitude: ride.pickup.pickupLongitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    : location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    : undefined;

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <BoldText>Fetching your location...</BoldText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Pressable onPress={() => navigation.goBack()}>
          <IconsContainer
            backgroundColor={Colors.whiteColorF4}
            IconComponent={ArrowLeftIcon}
            iconColor={Colors.headerColor}
            iconWidth={16}
            iconHeight={16}
            padding={16}
            onPress={() => navigation.goBack()}
          />
        </Pressable>
        <Pressable onPress={handleRefreshLocation} style={styles.refreshButton}>
          <BoldText>Refresh</BoldText>
        </Pressable>
      </View>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        scrollEnabled={true}
        ref={mapRef}
      >
        <Marker coordinate={location} title="Your Location">
          <View style={styles.currentLocationMarker}>
            <Image source={images} style={styles.currentLocationImage} />
          </View>
        </Marker>

        {ride?.startRide?.isStarted
          ? ride?.deliveryDropoff?.map((dropoff, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: dropoff.deliveryLatitude,
                  longitude: dropoff.deliveryLongitude,
                }}
                title={`Dropoff ${index + 1}`}
                description={dropoff.deliveryAddress}
              />
            ))
          : ride?.pickup && (
              <Marker
                coordinate={{
                  latitude: ride.pickup.pickupLatitude,
                  longitude: ride.pickup.pickupLongitude,
                }}
                title="Pickup Location"
                description={ride.pickup.pickupAddress}
              >
                <HomeIcon width={30} height={30} fill={Colors.greenColor} />
              </Marker>
            )}

        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={Colors.primaryColor}
            strokeWidth={6}
          />
        )}
      </MapView>

      {ride?.pickup?.pickupAddress && (
        <View style={styles.pickupAddressContainer}>
          <BoldText style={styles.pickupAddressText}>
            Pickup Address: {ride.pickup.pickupAddress}
          </BoldText>
        </View>
      )}

      {!ride && address && (
        <View style={[styles.pickupAddressContainer, { bottom: 100 }]}>
          <BoldText style={styles.pickupAddressText}>
            Your Address: {address}
          </BoldText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 64,
    left: 16,
    right: 16,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  refreshButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.whiteColorF4,
    borderRadius: 8,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  currentLocationMarker: {
    backgroundColor: 'red',
    borderRadius: 388,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  pickupAddressContainer: {
    position: 'absolute',
    bottom: 48,
    left: 12,
    right: 12,
    backgroundColor: 'black',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupAddressText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapViewPage;