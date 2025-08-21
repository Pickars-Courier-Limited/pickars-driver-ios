import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  Platform,
  Alert,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import {Colors} from '../Components/Colors/Colors';
import {BoldText, RegularText} from '../Components/Texts/CustomTexts/BaseTexts';
import InfoIcon from '../Components/Icons/Info/InfoIcon';
import IconsContainer from '../Components/Icons/IconContainer';
import BikeLogoIcon from '../Components/Icons/Logo/LogoIcon';
import ArrowRightIcon from '../Components/Icons/Arrows/ArrowRightIcon';
import BurgerIcon from '../Components/Icons/BurgerIcon/BurgerIcon';
import CustomerSupportIcon from '../Components/Icons/CustomerSupportIcon/CustomerSupportIcon';
import ArrowLeftIcon from '../Components/Icons/Arrows/ArrowLeftIcon';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {GOOGLE_API_KEY} from './config';
import OSMMapAuto from './SampleAuto';
import PlacesAutocomplete from './SampleAuto';
import useNavigateToNext from './useNavigateToNextPage';
import {useNavigation} from '@react-navigation/native';

const colors = {
  primaryColor: '#3498db',
};

const OSMMap = () => {
  const [region, setRegion] = useState<{latitude: number; longitude: number}>({
    latitude: 4.815, // Default latitude for Rivers State
    longitude: 7.0499, // Default longitude for Rivers State
  });
  const [places, setPlaces] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [blinkAnim] = useState(new Animated.Value(0)); // For blinking animation
  const [sidebarVisible, setSidebarVisible] = useState(false); // New state for sidebar
  const [sidebarAnimation] = useState(new Animated.Value(-400));
  const [searchedPlace, setSearchedPlace] = useState<string>(''); // State to hold the searched place

  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocations, setDeliveryLocations] = React.useState([
    {id: 1, value: ''},
  ]);

  const handleDeliveryLocationChange = (id: any, value: any) => {
    setDeliveryLocations(prevLocations =>
      prevLocations.map(location =>
        location.id === id ? {...location, value} : location,
      ),
    );
  };

  const handleDeleteDeliveryLocation = (id: any) => {
    setDeliveryLocations(prevLocations =>
      prevLocations.filter(location => location.id !== id),
    );
  };

  const addDeliveryLocation = () => {
    const newId = deliveryLocations.length + 1; // Generate a new ID
    setDeliveryLocations(prevLocations => [
      ...prevLocations,
      {id: newId, value: ''},
    ]);
  };

  const handleAddDeliveryLocation = () => {
    setDeliveryLocations([...deliveryLocations, {id: Date.now(), value: ''}]);
  };

  const SidebarModal = ({visible, onClose}: any) => {
    const slideInAnimation = new Animated.Value(-300); // Start position (off-screen)

    // Slide the modal in and out
    if (visible) {
      Animated.timing(slideInAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideInAnimation, {
        toValue: -300,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }

    return (
      <Modal transparent={true} visible={visible} onRequestClose={onClose}>
        <View
          style={{flex: 1, justifyContent: 'center', alignItems: 'flex-start'}}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)', // Background color with opacity
              }}
            />
          </TouchableWithoutFeedback>

          <Animated.View
            style={{
              backgroundColor: '#fff',
              borderRadius: 0,
              padding: 20,
              width: '80%', // Adjust width as needed
              alignItems: 'center',
              position: 'absolute', // Position it absolutely
              left: 0, // Align to the left side
              top: 0,
              bottom: 0,
              paddingTop: 64,
              transform: [{translateX: slideInAnimation}], // Apply animation
            }}>
            <TouchableOpacity
              onPress={onClose}
              style={{alignItems: 'flex-start', width: '100%'}}>
              <View
                style={[
                  styles.supportIconContainer,
                  {
                    backgroundColor: Colors.errorColor,
                  },
                ]}>
                <ArrowLeftIcon
                  color={Colors.whiteColor}
                  width={18}
                  height={18}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  useEffect(() => {
    handleLocationAccess();
    startBlinkingAnimation();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      console.log('Requesting location permission...');
      Geolocation.requestAuthorization();
    } else {
      console.log('Handling location permission for Android (if needed).');
    }
  };

  const getCurrentLocation = () => {
    const defaultLatitude = 4.8156; // Replace with your desired latitude
    const defaultLongitude = 7.0498; // Replace with your desired longitude

    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        console.log('Latitude:', latitude, 'Longitude:', longitude);
        fetchAddress(latitude, longitude); // Fetch address using the obtained coordinates
      },
      error => {
        console.error('Error getting location:', error.message);
        Alert.alert('Location Error', error.message);

        // Fallback to default location if error occurs
        fetchAddress(defaultLatitude, defaultLongitude); // Fetch address for default location
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
      },
    );
  };
  const fetchAddress = async (latitude: any, longitude: any) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${latitude},${longitude}`,
            key: GOOGLE_API_KEY,
          },
        },
      );

      if (response.data.status === 'OK') {
        const address = response.data.results[0].formatted_address; // Get the formatted address
        setPickupLocation(address); // Set the pickup location to the fetched address
      } else {
        Alert.alert('Error', 'Unable to fetch address');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      Alert.alert('Error', 'Error fetching address');
    }
  };
  const handleLocationAccess = () => {
    requestLocationPermission();
    getCurrentLocation();
  };

  const startBlinkingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text) {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search`,
          {
            params: {
              q: text + ', Rivers State, Nigeria',
              format: 'json',
              addressdetails: 1,
              limit: 5,
            },
          },
        );
        setPlaces(response.data);
      } catch (error) {
        console.error('Error fetching places:', error);
      }
    } else {
      setPlaces([]);
    }
  };

  const selectPlace = (place: any) => {
    const {lat, lon, postalcode} = place;
    setRegion({latitude: parseFloat(lat), longitude: parseFloat(lon)});
    setSearchText('');
    setPlaces([]);
    setModalVisible(false);
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };
  const [activeLocationId, setActiveLocationId] = useState(null);
  const {height} = useWindowDimensions();

  const navigateToNext = useNavigateToNext();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: region.latitude,
          longitude: region.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        loadingEnabled={true}>
        <Marker
          coordinate={region}
          title="Your Location"
          description="This is your exact location">
          <Animated.View style={{opacity: blinkAnim}}>
            <View style={styles.blinkingMarker} />
          </Animated.View>
        </Marker>
      </MapView>
      <View style={styles.buttonContainer}></View>
      <SidebarModal visible={sidebarVisible} onClose={toggleSidebar} />
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={toggleSidebar}>
          <View style={styles.burgerIconContainer}>
            <BurgerIcon color={Colors.headerColor} width={18} height={18} />
          </View>
        </TouchableOpacity>
        <View style={styles.supportIconContainer}>
          <CustomerSupportIcon
            color={Colors.headerColor}
            width={18}
            height={18}
          />
        </View>
      </View>

      {!sidebarVisible && (
        <View style={styles.dispatchButtonContainer}>
          <View>
            <IconsContainer
              backgroundColor={Colors.fadedPrimaryColor}
              IconComponent={BikeLogoIcon}
              iconColor={Colors.primaryColor}
              iconWidth={24}
              iconHeight={24}
            />
          </View>
          <View
            style={{
              paddingVertical: 16,
              paddingBottom: 28,
              gap: 3,
            }}>
            <BoldText fontSize={18}>Hi, Ibeneme</BoldText>
            <RegularText fontSize={13} color={Colors.grayColor}>
              Let's get started, Choose your Pickup Location
            </RegularText>
          </View>
          <TouchableOpacity
            style={styles.dispatchButton}
            onPress={() => navigation.navigate('PlacesAutocomplete' as never)}>
            <RegularText fontSize={14} color={Colors.whiteColor}>
              Choose your Pickup Location
            </RegularText>
            <ArrowRightIcon width={24} height={24} color={Colors.whiteColor} />
          </TouchableOpacity>
        </View>
      )}

      {/* Modal for picking up location */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={toggleModal}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={{padding: 16, paddingTop: 16}}>
            <View style={{flexDirection: 'row', width: '80%'}}>
              <TouchableOpacity
                onPress={toggleModal}
                style={{alignItems: 'flex-start', width: '100%'}}>
                <View style={styles.supportIconContainer}>
                  <ArrowLeftIcon
                    color={Colors.headerColor}
                    width={18}
                    height={18}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHeader}>
              Choose your Pickup Location in Rivers State
            </Text>
            <View style={{height: height, backgroundColor: 'red'}}>
              <PlacesAutocomplete />
            </View>

            {/* Google Places Autocomplete Component (if needed) */}
            {/* <GooglePlacesAutocomplete
              placeholder="Search for places..."
              onPress={(data, details = null) => {
                console.log('Selected place:', data);
                // Handle place selection if needed
              }}
              query={{
                key: GOOGLE_API_KEY,
                language: 'en',
              }}
              styles={{
                textInput: styles.textInput,
                container: {
                  marginTop: 16,
                },
                listView: {
                  backgroundColor: 'white',
                  borderRadius: 8,
                  elevation: 5,
                },
              }}
              fetchDetails={true}
              debounce={200}
              enablePoweredByContainer={false}
            /> */}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 70,
    left: '50%',
    transform: [{translateX: -50}],
    zIndex: 1,
  },
  dispatchButtonContainer: {
    position: 'absolute',
    bottom: 26,
    left: 12,
    right: 12,
    borderRadius: 36,
    backgroundColor: Colors.whiteColor,
    borderWidth: 2,
    borderColor: Colors.headerColor,
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  dispatchButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: Colors.primaryColor,
    borderRadius: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    padding: 20,
  },
  modalHeader: {
    fontSize: 18,
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  modalPlaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: 'lightgray',
    borderBottomWidth: 1,
  },
  modalPlaceText: {
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
    backgroundColor: colors.primaryColor,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
  },
  blinkingMarker: {
    width: 20,
    height: 20,
    backgroundColor: colors.primaryColor,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  sidebarContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '70%',
    backgroundColor: Colors.whiteColor,
    borderRightWidth: 1,
    borderRightColor: 'lightgray',
    padding: 20,
    elevation: 4,
  },
  sidebarHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sidebarProfileText: {
    fontSize: 18,
  },
  sidebarContent: {
    flex: 1,
    justifyContent: 'center',
  },
  sidebarOption: {
    fontSize: 16,
    marginVertical: 10,
  },
  closeSidebarButton: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: Colors.primaryColor,
    borderRadius: 5,
    marginTop: 20,
  },
  closeSidebarText: {
    color: '#fff',
  },
  headerContainer: {
    position: 'absolute',
    top: 56,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  burgerIconContainer: {
    borderRadius: 24,
    backgroundColor: Colors.yellowColor,
    borderWidth: 1.3,
    borderColor: Colors.headerColor,
    padding: 12,
  },
  supportIconContainer: {
    borderRadius: 24,
    backgroundColor: Colors.whiteColor,
    borderWidth: 1.3,
    borderColor: Colors.headerColor,
    padding: 12,
  },
});

export default OSMMap;
