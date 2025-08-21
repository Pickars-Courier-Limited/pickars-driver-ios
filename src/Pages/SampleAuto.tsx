import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  Button,
  PermissionsAndroid,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import MapView, {Marker} from 'react-native-maps';
import axios from 'axios';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useNavigation} from '@react-navigation/native';
import {MainStackParamList} from '../Navigation/MainStackNavigation';
import {StackNavigationProp} from '@react-navigation/stack';
import AuthHeaders from '../Components/Headers/AuthHeaders';
import BookHeaders from '../Components/Headers/BookHeader';

export interface Location {
  id: string; // Unique ID for the location
  name: string; // Name of the location
  city: string; // City of the location
  latitude: number; // Latitude of the location
  longitude: number; // Longitude of the location
  receiverName?: string; // Receiver's name
  receiverPhoneNumber?: string; // Receiver's phone number
  packageId?: string; // Generated package ID
  options?: string[]; // Array of options for the delivery type
}

export interface LocationPickup {
  id: string; // Unique ID for the location
  name: string; // Name of the location
  city: string; // City of the location
  latitude: number; // Latitude of the location
  longitude: number; // Longitude of the location
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

const PlacesAutocomplete: React.FC = () => {
  const [pickupLocation, setPickupLocation] = useState<LocationPickup | null>(
    null,
  );

  const [deliveryLocations, setDeliveryLocations] = useState<Location[]>([]);
  const [errorMessages, setErrorMessages] = useState<{[key: string]: string}>(
    {},
  );
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isEditModalVisiblePickup, setIsEditModalVisiblePickup] =
    useState<boolean>(false);
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhoneNumber, setReceiverPhoneNumber] = useState('');
  const [packageId, setPackageId] = useState('');
  //const [packageOptions, setPackageOptions] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [navigationErr, setNavigationErr] = useState('');

  const [isAdjustModalVisible, setIsAdjustModalVisible] =
    useState<boolean>(false);
  const [isAdjustModalVisiblePickup, setIsAdjustModalVisiblePickup] =
    useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newLocationName, setNewLocationName] = useState<string>('');
  const [locationIdToAdjust, setLocationIdToAdjust] = useState<string | null>(
    null,
  ); // New state for location ID

  const APIKEY = 'AIzaSyDEA03t46Rxy4uqPY7hcQmqyfU7uPpkh2c';

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        console.log('LatitudefetchAddress:', latitude, 'Longitude:', longitude);
        fetchAddress(latitude, longitude); // Fetch address using the obtained coordinates
      },
      error => {
        console.error('Error getting location:', error.message);
        Alert.alert('Location Error', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
      },
    );
  };
  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${latitude},${longitude}`,
            key: APIKEY,
          },
        },
      );

      if (response.data.status === 'OK') {
        const results = response.data.results;
        const address = results[0].formatted_address; // Get the formatted address
        const location = results[0].geometry.location; // Get the location object
        const lat = location.lat; // Latitude
        const lng = location.lng; // Longitude

        // Find the city from address components
        const cityComponent = results[0].address_components.find(
          (component: AddressComponent) => component.types.includes('locality'),
        );

        const city = cityComponent ? cityComponent.long_name : ''; // Get the city name

        // Create a new Location object
        const newLocation: Location = {
          id: Date.now().toString(),
          name: address,
          city: city,
          latitude: lat,
          longitude: lng,
        };

        // Set the pickup location to the fetched address, replacing any existing location
        setPickupLocation(newLocation);
      } else {
        Alert.alert('Error', 'Unable to fetch address');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      Alert.alert('Error', 'Error fetching address');
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
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
    return true; // iOS permissions automatically granted
  };

  useEffect(() => {
    requestLocationPermission();
    getCurrentLocation();
  }, []);

  const extractCity = (addressComponents: any[]): string => {
    for (let component of addressComponents) {
      if (
        component.types.includes('locality') ||
        component.types.includes('administrative_area_level_2')
      ) {
        return component.long_name;
      }
    }
    return 'Unknown City';
  };

  const handleAddLocation = (data: any, details: any) => {
    const city = extractCity(details.address_components);
    const newLocation: Location = {
      id: Date.now().toString(),
      name: data.description,
      city: city,
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    };
    setDeliveryLocations(prevLocations => [...prevLocations, newLocation]);
    setIsEditModalVisible(false);
  };

  const handleEditLocation = (data: any, details: any) => {
    if (editIndex !== null) {
      const city = extractCity(details.address_components);
      const updatedLocations = [...deliveryLocations];
      updatedLocations[editIndex] = {
        ...updatedLocations[editIndex],
        name: data.description,
        city: city,
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };
      setDeliveryLocations(updatedLocations);
      setEditIndex(null);
      setSelectedLocation(null);
    }
    setIsEditModalVisible(false);
  };

  const handleEditLocationPickup = (data: any, details: any) => {
    // Return early if there's no pickupLocation to update
    if (!pickupLocation) {
      return;
    }

    const city = extractCity(details.address_components);

    // Create the updated pickup location object
    const updatedPickupLocation = {
      ...pickupLocation, // Preserve existing properties
      name: data.description,
      city: city,
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    };

    // Update the pickupLocation state with the new location
    setPickupLocation(updatedPickupLocation);

    // Reset the edit state
    resetEditState();
  };

  // Helper function to reset edit-related states
  const resetEditState = () => {
    setEditIndex(null); // Reset the edit index if applicable
    setSelectedLocation(null); // Clear the selected location if applicable
    setIsEditModalVisiblePickup(false); // Close the edit modal
  };

  const handleDeleteLocation = (index: number) => {
    const updatedLocations = deliveryLocations.filter((_, i) => i !== index);
    setDeliveryLocations(updatedLocations);
  };

  const openEditLocationModal = (location: Location, index: number) => {
    setSelectedLocation(location);
    setEditIndex(index);
    setIsEditModalVisible(true);
  };

  const openAdjustLocationModal = (location: Location) => {
    setSelectedLocation(location);
    setNewLocationName(location.name); // Store the location name for editing
    setLocationIdToAdjust(location.id); // Store the ID of the location to be adjusted
    setIsAdjustModalVisible(true);
  };

  const openEditLocationModalPickup = (location: Location) => {
    setSelectedLocation(location);
    setIsEditModalVisiblePickup(true);
  };

  const openAdjustLocationModalPickup = (location: Location) => {
    setSelectedLocation(location);
    setNewLocationName(location.name); // Store the location name for editing
    setIsAdjustModalVisiblePickup(true);
  };

  const fetchAddressFromCoordinates = async (
    latitude: number,
    longitude: number,
  ) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${APIKEY}`,
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setNewLocationName(address); // Set the fetched address as the new location name
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const saveAdjustedLocation = () => {
    if (locationIdToAdjust) {
      const updatedLocations = deliveryLocations.map(location => {
        if (location.id === locationIdToAdjust) {
          return {
            ...location,
            name: newLocationName, // Update the name to the new location name
          };
        }
        return location;
      });
      setDeliveryLocations(updatedLocations);
      setIsAdjustModalVisible(false);
    }
  };

  const saveAdjustedLocationPickup = () => {
    console.log(pickupLocation, 'pickupLocationpickupLocation');
    if (pickupLocation) {
      const updatedPickupLocation = {
        ...pickupLocation,
        name: newLocationName, // Update the name to the new location name
      };

      setPickupLocation(updatedPickupLocation); // Update the pickup location state
      setIsAdjustModalVisiblePickup(false); // Close the adjustment modal
    }
  };

  const handleAddPickupLocation = (data: any, details: any) => {
    const city = extractCity(details.address_components);
    const newLocation: Location = {
      id: Date.now().toString(),
      name: data.description,
      city: city,
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    };
    setPickupLocation(newLocation); // Set the new pickup location
    setIsEditModalVisible(false);
  };

  const handleEditPickupLocation = (data: any, details: any) => {
    if (pickupLocation) {
      const city = extractCity(details.address_components);
      const updatedLocation: Location = {
        ...pickupLocation,
        name: data.description,
        city: city,
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };
      setPickupLocation(updatedLocation);
    }
    setIsEditModalVisible(false);
  };

  const [editLocationId, setEditLocationId] = useState<string | null>(null);
  const [updatedReceiverName, setUpdatedReceiverName] = useState('');
  const [updatedReceiverPhoneNumber, setUpdatedReceiverPhoneNumber] =
    useState('');

  const handleUpdateReceiverInfo = () => {
    if (editLocationId) {
      const updatedLocations = deliveryLocations.map(location => {
        if (location.id === editLocationId) {
          return {
            ...location,
            receiverName: updatedReceiverName,
            receiverPhoneNumber: updatedReceiverPhoneNumber,
          };
        }
        return location;
      });

      setDeliveryLocations(updatedLocations);
      setEditLocationId(null); // Reset the edit location ID
      setUpdatedReceiverName(''); // Clear the receiver name input
      setUpdatedReceiverPhoneNumber(''); // Clear the receiver phone number input
      setIsEditModalVisible(false); // Close the modal
    }
  };
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [selectedPackages, setSelectedPackages] = useState<{
    [key: string]: string[];
  }>({});
  const packageOptions = ['Food', 'Documents', 'Toys'];

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocationId(locationId);
    setSelectedPackages(prev => ({
      ...prev,
      [locationId]: [], // Clear selected packages for this location
    }));
  };



  console.log(selectedPackages, 'selectedPackagesselectedPackages');

  type SampleScreenNavigationProp = StackNavigationProp<
    MainStackParamList,
    'Sample'
  >;
  const navigation = useNavigation<SampleScreenNavigationProp>();

  const togglePackageSelection = (
    locationId: string,
    packageOption: string,
  ) => {
    setSelectedPackages(prevSelected => {
      const locationPackages = prevSelected[locationId] || [];
      const isSelected = locationPackages.includes(packageOption);
      const updatedPackages = isSelected
        ? locationPackages.filter(option => option !== packageOption)
        : [...locationPackages, packageOption];

      // Update the error state when a package is selected
      if (errorMessages[locationId] && updatedPackages.length > 0) {
        const updatedErrors = {...errorMessages};
        delete updatedErrors[locationId];
        setErrorMessages(updatedErrors);
      }

      return {
        ...prevSelected,
        [locationId]: updatedPackages,
      };
    });
  };

  const handleSubmit = () => {
    setNavigationErr(''); // Clear any previous navigation errors
    const newErrorMessages: {[key: string]: string} = {}; // Initialize a new error messages object

    // Loop through each location to validate
    deliveryLocations.forEach(location => {
      if (!location.receiverPhoneNumber) {
        newErrorMessages[location.id] =
          "Please fill in the receiver's phone number.";
      }

      if (!location.receiverName) {
        newErrorMessages[location.id] = newErrorMessages[location.id]
          ? `${
              newErrorMessages[location.id]
            }\nPlease fill in the receiver's name.`
          : "Please fill in the receiver's name.";
      }

      if (
        !selectedPackages[location.id] ||
        selectedPackages[location.id].length === 0
      ) {
        newErrorMessages[location.id] = newErrorMessages[location.id]
          ? `${
              newErrorMessages[location.id]
            }\nPlease select at least one package option.`
          : 'Please select at least one package option.';
      }
    });

    setErrorMessages(newErrorMessages); // Update the error messages state

    // Check if there are no error messages
    if (Object.keys(newErrorMessages).length === 0) {
      // Check if there are delivery locations
      if (deliveryLocations.length > 0) {
        console.log(
          'All entries are deliveryLocationsdeliveryLocationsdeliveryLocations:',
          deliveryLocations,
        );
        // Navigate to the next page with deliveryLocations and pickupLocation as parameters
        navigation.navigate('NextPage', {
          deliveryLocations: deliveryLocations,
          pickupLocation: pickupLocation || null, // Pass pickupLocation or null
        });
      } else {
        console.log('Next', 'NextNext');

        setNavigationErr('Please enter a delivery location'); // Display navigation error if no delivery locations
      }
    }
  };

  console.log(deliveryLocations?.length > 0, 'deliveryLocations?.length > 0');

  return (
  <View style={{flex: 1}}>
    <BookHeaders  title='Book a Delivery Bike' 
    
    onPress={() => {
         setNavigationErr('');
         setIsEditModalVisible(true);
         console.log(deliveryLocations, 'deliveryLocations');
       }} 
       
       />


      <View style={styles.container}>
     
     <Text>{navigationErr}</Text>
     {pickupLocation && (
       <View style={styles.locationItem}>
         <Text style={styles.locationText}>
           Pickup Location: {pickupLocation.name} - {pickupLocation.city}
         </Text>
         <TouchableOpacity
           onPress={() => openEditLocationModalPickup(pickupLocation)}>
           <Text style={styles.adjustButton}>Edit</Text>
         </TouchableOpacity>

         <TouchableOpacity
           onPress={() => openAdjustLocationModalPickup(pickupLocation)}>
           <Text style={styles.adjustButton}>Adjust</Text>
         </TouchableOpacity>
       </View>
     )}
     <Button
       title="Add Delivery Location"
       onPress={() => {
         setNavigationErr('');
         setIsEditModalVisible(true);
      }}
     />
     <Button title="Submit" onPress={handleSubmit} />
     <FlatList
       data={deliveryLocations}
       keyExtractor={item => item.id}
       renderItem={({item, index}) => (
         <View style={styles.locationItem}>
           <Text style={styles.locationText}>
             {item.name} - {item.city}
           </Text>
           <View>
             <TouchableOpacity
               onPress={() => openEditLocationModal(item, index)}>
               <Text style={styles.editButton}>Edit</Text>
             </TouchableOpacity>
             <TouchableOpacity onPress={() => openAdjustLocationModal(item)}>
               <Text style={styles.adjustButton}>Adjust</Text>
             </TouchableOpacity>
             <TouchableOpacity onPress={() => handleDeleteLocation(index)}>
               <Text style={styles.deleteButton}>Delete</Text>
             </TouchableOpacity>
           </View>

           <View>
             <Text style={styles.heading}>Update Delivery Location</Text>
             {/* Receiver's Name Input */}
             <TextInput
               style={styles.input}
               placeholder="Receiver's Name"
               value={item.receiverName}
               onChangeText={text => {
                 const updatedLocations = deliveryLocations.map(location =>
                   location.id === item.id
                     ? {...location, receiverName: text}
                     : location,
                 );
                 setDeliveryLocations(updatedLocations);

                 // Clear the error message when the user starts typing
                 if (errorMessages[item.id]) {
                   const updatedErrors = {...errorMessages};
                   delete updatedErrors[item.id];
                   setErrorMessages(updatedErrors);
                 }
               }}
             />
             {errorMessages[item.id] && (
               <Text style={{color: '#ff0000'}}>{errorMessages[item.id]}</Text>
             )}

             <TextInput
               style={styles.input}
               placeholder="Receiver's Phone Number"
               value={item.receiverPhoneNumber}
               keyboardType="phone-pad"
               onChangeText={text => {
                 const updatedLocations = deliveryLocations.map(location =>
                   location.id === item.id
                     ? {...location, receiverPhoneNumber: text}
                     : location,
                 );
                 setDeliveryLocations(updatedLocations);

                 // Clear the error message when the user starts typing
                 if (errorMessages[item.id]) {
                   const updatedErrors = {...errorMessages};
                   delete updatedErrors[item.id];
                   setErrorMessages(updatedErrors);
                 }
               }}
             />

             {/* {errors.locations?.[index]?.receiverName && (
                       <Text style={styles.errorText}>{errors.locations[index].receiverName}</Text>
                     )} */}

             {/* Receiver's Phone Number Input */}

             {/* {errors.locations?.[index]?.receiverPhoneNumber && (
                       <Text style={styles.errorText}>{errors.locations[index].receiverPhoneNumber}</Text>
                     )} */}

             <Text>Select Package Options for {selectedLocation?.name}:</Text>
             {packageOptions.map((packageOption, index) => (
               <TouchableOpacity
                 key={index}
                 onPress={() => togglePackageSelection(item.id, packageOption)}
                 style={[
                   styles.packageOption,
                   selectedPackages[item.id]?.includes(packageOption) &&
                     styles.selectedPackageOption,
                 ]}>
                 <Text
                   style={[
                     styles.packageOptionText,
                     selectedPackages[item.id]?.includes(packageOption) &&
                       styles.selectedPackageOptionText,
                   ]}>
                   {packageOption}
                 </Text>
               </TouchableOpacity>
             ))}

             {/* {errors.locations?.[index]?.options && (
                       <Text style={styles.errorText}>{errors.locations[index].options}</Text>
                     )} */}

             <View style={{marginTop: 200}}></View>
           </View>
         </View>
       )}
       ListEmptyComponent={
         <Text style={styles.noLocationText}>
           No delivery locations added yet
         </Text>
       }
     />

     {/* Edit Location Modal */}
     <Modal visible={isEditModalVisible} animationType="slide">
       <SafeAreaView style={styles.modalContainer}>
         <GooglePlacesAutocomplete
           placeholder={selectedLocation?.name || 'Enter delivery location'}
           onPress={(data, details = null) => {
             editIndex !== null
               ? handleEditLocation(data, details)
               : handleAddLocation(data, details);
           }}
           query={{
             key: APIKEY,
             language: 'en',
             components: 'country:NG',
           }}
           styles={{
             textInput: styles.textInput,
             container: styles.autocompleteContainer,
           }}
           fetchDetails={true}
           debounce={200}
         />

         <View style={{marginTop: 330}}>
           <Button
             title="Close"
             onPress={() => setIsEditModalVisible(false)}
           />
         </View>
       </SafeAreaView>
     </Modal>

     {/* Edit Location Modal */}
     <Modal visible={isEditModalVisiblePickup} animationType="slide">
       <SafeAreaView style={styles.modalContainer}>
         <GooglePlacesAutocomplete
           placeholder={selectedLocation?.name || 'Enter delivery location'}
           onPress={(data, details = null) => {
             editIndex !== null
               ? handleEditLocationPickup(data, details)
               : handleEditLocationPickup(data, details);
           }}
           query={{
             key: APIKEY,
             language: 'en',
             components: 'country:NG',
           }}
           styles={{
             textInput: styles.textInput,
             container: styles.autocompleteContainer,
           }}
           fetchDetails={true}
           debounce={200}
         />

         <View style={{marginTop: 330}}>
           <Button
             title="Close"
             onPress={() => setIsEditModalVisiblePickup(false)}
           />
         </View>
       </SafeAreaView>
     </Modal>

     {/* Adjust Location Modal */}
     <Modal visible={isAdjustModalVisible} animationType="slide">
       <SafeAreaView style={styles.modalContainer}>
         <MapView
           style={{flex: 1}}
           initialRegion={{
             latitude: selectedLocation?.latitude || 0,
             longitude: selectedLocation?.longitude || 0,
             latitudeDelta: 0.01,
             longitudeDelta: 0.01,
           }}>
           {selectedLocation && (
             <Marker
               coordinate={{
                 latitude: selectedLocation.latitude,
                 longitude: selectedLocation.longitude,
               }}
               draggable
               onDragEnd={e => {
                 const {latitude, longitude} = e.nativeEvent.coordinate;
                 fetchAddressFromCoordinates(latitude, longitude); // Fetch the new address
               }}
             />
           )}
         </MapView>
         <View style={styles.adjustDetails}>
           <Text>New Location: {newLocationName}</Text>
           <Button title="Save Location" onPress={saveAdjustedLocation} />
         </View>
         <Button
           title="Close"
           onPress={() => setIsAdjustModalVisible(false)}
         />
       </SafeAreaView>
     </Modal>

     {/* Adjust Location Modal */}
     <Modal visible={isAdjustModalVisiblePickup} animationType="slide">
       <SafeAreaView style={styles.modalContainer}>
         <MapView
           style={{flex: 1}}
           initialRegion={{
             latitude: selectedLocation?.latitude || 0,
             longitude: selectedLocation?.longitude || 0,
             latitudeDelta: 0.01,
             longitudeDelta: 0.01,
           }}>
           {selectedLocation && (
             <Marker
               coordinate={{
                 latitude: selectedLocation.latitude,
                 longitude: selectedLocation.longitude,
               }}
               draggable
               onDragEnd={e => {
                 const {latitude, longitude} = e.nativeEvent.coordinate;
                 fetchAddressFromCoordinates(latitude, longitude); // Fetch the new address
               }}
             />
           )}
         </MapView>
         <View style={styles.adjustDetails}>
           <Text>Pikcup Location: {newLocationName}</Text>
           <Button
             title="Save Location"
             onPress={saveAdjustedLocationPickup}
           />
         </View>
         <Button
           title="Close"
           onPress={() => setIsAdjustModalVisible(false)}
         />
       </SafeAreaView>
     </Modal>
   </View>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  locationItem: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 1,
  },
  locationText: {fontSize: 16, color: '#333'},
  editButton: {color: '#1faadb', marginRight: 10},
  adjustButton: {color: '#ff8c00', marginRight: 10},
  deleteButton: {color: '#ff4d4d'},
  noLocationText: {textAlign: 'center', marginTop: 20},
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 122,
  },
  textInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  autocompleteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  adjustDetails: {
    padding: 20,
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  packageOption: {
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 5,
  },
  selectedPackageOption: {
    backgroundColor: '#515FDF',
  },
  packageOptionText: {
    color: '#000',
  },
  selectedPackageOptionText: {
    color: '#fff',
  },
});

export default PlacesAutocomplete;
