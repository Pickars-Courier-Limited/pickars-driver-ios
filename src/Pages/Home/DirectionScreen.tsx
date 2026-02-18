import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import PolylineDecoder from '@mapbox/polyline';

const DirectionsScreen = () => {
  const [location, setLocation] = useState<any>(null);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);

  const destination = { latitude: 6.5244, longitude: 3.3792 };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need access to your location for navigation',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      pos => {
        setLocation(pos.coords);
        fetchDirections(pos.coords, destination);
      },
      error => console.log('Location error:', error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const fetchDirections = async (start: any, end: any) => {
    const origin = `${start.latitude},${start.longitude}`;
    const dest = `${end.latitude},${end.longitude}`;
    const API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // 🔑 replace

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=driving&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes.length) {
      // decode polyline
      const points = PolylineDecoder.decode(
        data.routes[0].overview_polyline.points,
      ).map(([lat, lng]) => ({ latitude: lat, longitude: lng }));

      setRouteCoords(points);

      // step-by-step instructions
      const stepsList = data.routes[0].legs[0].steps.map(
        (s: any, i: number) => ({
          id: i.toString(),
          instruction: s.html_instructions.replace(/<[^>]+>/g, ''), // remove HTML
          distance: s.distance.text,
        }),
      );

      setSteps(stepsList);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {location && (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
        >
          <Marker coordinate={location} title="You" pinColor="blue" />
          <Marker coordinate={destination} title="Destination" pinColor="red" />
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor="black"
          />
        </MapView>
      )}

      {/* Navigation steps */}
      <View style={styles.instructionsBox}>
        <Text style={styles.title}>Step-by-Step Directions</Text>
        <FlatList
          data={steps}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Text style={styles.step}>
              ➡ {item.instruction} ({item.distance})
            </Text>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  instructionsBox: {
    backgroundColor: 'white',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    maxHeight: 200,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  step: {
    marginBottom: 5,
    fontSize: 14,
  },
});

export default DirectionsScreen;
