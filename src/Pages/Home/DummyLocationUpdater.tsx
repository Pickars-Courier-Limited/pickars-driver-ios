import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Pressable,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../Redux/Store';
import {
  updateRiderLocation,
  toggleRiderActiveStatus,
} from '../../Redux/User/userSlice';
import { GOOGLE_API_KEY } from '../config';
import CustomButton from '../../Components/Buttons/CustomButton';
import { Colors } from '../../Components/Colors/Colors';
import { useToast } from '../../Context/useToast';

// initialize Geocoder with your Google Maps API key
Geocoder.init(GOOGLE_API_KEY);

interface DummyLocationUpdaterProps {
  profile: {
    _id: string;
    active?: boolean;
    [key: string]: any; // allow other fields
  };
  loading: boolean;
}

const DummyLocationUpdater: React.FC<DummyLocationUpdaterProps> = ({
  profile,
  loading,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [locationUpdateLoading, setLocationUpdateLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(profile?.active || false);
  const [isToggling, setIsToggling] = useState(false);
  const { addToast } = useToast();
  useEffect(() => {
    // Sync local state with Redux state when the profile prop changes
    if (profile?.active !== undefined) {
      setIsActive(profile.active);
    }
  }, [profile?.active]);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need your location to update rider position',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const fetchLocation = async () => {
    // This is the first check, which immediately exits if the rider isn't active.
    if (!profile || !profile.active) {
      return;
    }

    const hasPermission = await requestPermission();
    if (!hasPermission) {
      setError('Permission denied');
      return;
    }

    setLocationUpdateLoading(true);

    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;

        try {
          const geoResponse = await Geocoder.from(latitude, longitude);
          const address =
            geoResponse.results[0]?.formatted_address || 'Unknown location';
          console.log(latitude, longitude, address, 'latitude, longitude');

          dispatch(
            updateRiderLocation({
              id: profile._id,
              latitude,
              longitude,
              address,
            }),
          )
            .unwrap()
            .then(res => {
              console.log('✅ Location update response:', res);
              setData(res);
            })
            .catch(err => {
              console.error('❌ Location update error:', err);
              setError(err);
            })
            .finally(() => {
              setLocationUpdateLoading(false);
            });
        } catch (geoError: any) {
          console.error('❌ Geocoding error:', geoError.message);
          setError(geoError.message);
          setLocationUpdateLoading(false);
        }
      },
      geoError => {
        console.error('❌ Geolocation error:', geoError.message);
        setError(geoError.message);
        setLocationUpdateLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  useEffect(() => {
    // This is the main check that triggers the location fetch.
    if (profile?.active) {
      fetchLocation();
    }
  }, [profile?.active, dispatch, profile?._id]);

  const toggleActiveStatus = () => {
    if (!profile) return;

    setIsToggling(true);
    const newStatus = !isActive;

    dispatch(toggleRiderActiveStatus(newStatus))
      .unwrap()
      .then(res => {
        setIsToggling(false);

        if (res.success) {
          setIsActive(newStatus); // Update local toggle state only on success
          addToast(
            newStatus
              ? 'You are now active for orders'
              : 'You are now inactive for orders',
            'success',
          );
        } else {
          addToast('Failed to change status', 'error');
        }
      })
      .catch(error => {
        setIsToggling(false);
        console.error('An error occurred:', error);
        addToast('An unexpected error occurred', 'error');
      });
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomButton
        onPress={toggleActiveStatus}
        loading={isToggling} // Show spinner while toggling
        disabled={isToggling} // Prevent double presses
        backgroundColors={isActive ? 'gray' : Colors.primaryColor} // Gray = stop, Red = start
        title={isActive ? 'Stop Working' : 'Start Working'}
        textColor="white" // Make sure text is always white
      />
      {locationUpdateLoading && <ActivityIndicator size="large" color="blue" />}
      {error && <Text style={styles.error}>Error: {error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginTop: 12,
  },
  success: {
    color: 'green',
    marginTop: 12,
  },
});

export default DummyLocationUpdater;
