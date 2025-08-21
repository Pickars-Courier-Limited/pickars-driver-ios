// import React, { useState, useEffect } from 'react';
// import MapView, { Marker } from 'react-native-maps';
// import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
// import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// const MapModal = ({ isVisible, location, onClose, onLocationUpdate }) => {
//   const [currentCoordinates, setCurrentCoordinates] = useState(location);

//   useEffect(() => {
//     setCurrentCoordinates(location); // Reset marker to the initial location when modal opens
//   }, [location]);

//   const handleDragEnd = async (e) => {
//     const { latitude, longitude } = e.nativeEvent.coordinate;
//     setCurrentCoordinates({ latitude, longitude });

//     // Fetch the updated address based on new coordinates
//     const apiKey = 'AIzaSyDEA03t46Rxy4uqPY7hcQmqyfU7uPpkh2c';
//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
//       );
//       const data = await response.json();
//       if (data.results && data.results.length > 0) {
//         const updatedAddress = data.results[0].formatted_address;
//         onLocationUpdate({ address: updatedAddress, latitude, longitude });
//       }
//     } catch (error) {
//       console.error('Error fetching updated address:', error);
//     }
//   };

//   return (
//     <Modal visible={isVisible} animationType="slide">
//       <View style={styles.mapContainer}>
//         <MapView
//           style={styles.map}
//           initialRegion={{
//             latitude: currentCoordinates?.latitude,
//             longitude: currentCoordinates?.longitude,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }}
//         >
//           <Marker
//             coordinate={currentCoordinates}
//             draggable
//             onDragEnd={handleDragEnd} // Update location when dragging ends
//             pinColor="red"
//           />
//         </MapView>
//         <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//           <Text style={styles.closeButtonText}>Close Map</Text>
//         </TouchableOpacity>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//     mapContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     map: {
//       ...StyleSheet.absoluteFillObject,
//     },
//     closeButton: {
//       position: 'absolute',
//       bottom: 20,
//       backgroundColor: '#007BFF',
//       paddingVertical: 10,
//       paddingHorizontal: 20,
//       borderRadius: 8,
//     },
//     closeButtonText: {
//       color: '#FFFFFF',
//       fontSize: 16,
//     },
//   });
  
// export default MapModal;