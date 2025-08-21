import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import {PermissionsAndroid, Platform, Alert, Linking} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {GOOGLE_API_KEY} from '../Pages/config';

interface LocationContextProps {
  currentLocation: {
    placeName: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const LocationContext = createContext<LocationContextProps | undefined>(
  undefined,
);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const [currentLocation, setCurrentLocation] =
    useState<LocationContextProps['currentLocation']>(null);
  const [region, setRegion] = useState<LocationContextProps['region'] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, d] = useState<string | null>(null);

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const permissionStatus = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (permissionStatus) {
        console.log('Location permission already granted');
        return true;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true; // iOS permissions are automatically granted
  };

  const getCurrentLocation = () => {
    setIsLoading(true);
    Geolocation.getCurrentPosition(
      async (position) => {
        const {latitude, longitude} = position.coords;
        console.log(
          `Current Position: Latitude: ${latitude}, Longitude: ${longitude}`,
        );

        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`,
          );
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const placeName = data.results[0].formatted_address;
            setCurrentLocation({placeName, latitude, longitude});
          } else {
            setCurrentLocation({
              placeName: 'Location not found',
              latitude,
              longitude,
            });
          }
        } catch (err) {
          console.error('Error fetching location name:', err);
         // d('Unable to fetch location details');
        } finally {
          setIsLoading(false);
        }
      },
      geoError => {
       // console.error('Geolocation error:', geoError);
        //setError('Unable to retrieve location');
        setIsLoading(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const fetchLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (hasPermission) {
      getCurrentLocation();
    } else {
      Alert.alert(
        'Permission Denied',
        'Location permission is required to use this feature.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Open Settings',
            onPress: () => Linking.openSettings(),
          },
        ],
      );
      //d('Permission denied');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    requestLocationPermission();
    getCurrentLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{currentLocation, region, isLoading, error}}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextProps => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
