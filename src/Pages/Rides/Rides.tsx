// import React, {useState, useEffect, useCallback} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   RefreshControl,
//   Alert,
//   ScrollView,
//   Pressable,
//   SafeAreaView,
//   StyleSheet,
// } from 'react-native';
// import {useDispatch} from 'react-redux';

// // import {AppDispatch} from '../../Redux/newStore';
// // import {getRideSocketLogs} from '../../Redux/User/userSlice';

// import {useFocusEffect, useNavigation} from '@react-navigation/native';
// import {
//   BoldText,
//   RegularText,
// } from '../../Components/Texts/CustomTexts/BaseTexts';
// import {Colors} from '../../Components/Colors/Colors';
// import IconsContainer from '../../Components/Icons/IconContainer';
// import ArrowRightIcon from '../../Components/Icons/Arrows/ArrowRightIcon';
// import ShimmerLoader from '../../Components/Loader/ShimmerLoader';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {fetchRideSocketLogs} from '../../Redux/Riders/riders';
// import {AppDispatch} from '../../Redux/store';

// const RidesScreen: React.FC = () => {
//   const [userId, setUserId] = useState<string | null>(null);
//   const [logs, setLogs] = useState([]); // All logs
//   const [filteredLogs, setFilteredLogs] = useState([]); // Logs filtered by status
//   const [selectedStatus, setSelectedStatus] = useState('All'); // Default toggle
//   const [refreshing, setRefreshing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const dispatch = useDispatch<AppDispatch>();
//   const navigation = useNavigation();

//   useEffect(() => {
//     const fetchUserId = async () => {
//       try {
//         const temp = await AsyncStorage.getItem('temp_id');
//         if (temp) {
//           setUserId(temp);
//         } else {
//           console.log('No data found in AsyncStorage for key "temp".');
//         }
//       } catch (error) {
//         console.error('Error fetching data from AsyncStorage:', error);
//       }
//     };
//     fetchUserId();
//   }, []);

//   const fetchLogs = () => {
//     setLoading(true);
//     dispatch(fetchRideSocketLogs())
//       .then(response => {
//         if (response?.payload?.rideSockets) {
//           setLogs(response?.payload?.rideSockets);
//           setFilteredLogs(response?.payload?.rideSockets); // Set default
//         }
//       })
//       .catch(err => {
//         Alert.alert('Error', `Failed to fetch logs: ${err.message}`);
//       })
//       .finally(() => {
//         setLoading(false);
//         setRefreshing(false);
//       });
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchLogs();
//     }, []),
//   );

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchLogs();
//   };

//   const handleToggle = (status: string) => {
//     setSelectedStatus(status);
//     if (status === 'All') {
//       setFilteredLogs(logs);
//     } else {
//       setFilteredLogs(logs.filter(log => log.status === status));
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {loading || userId === null ? (
//         <ShimmerLoader />
//       ) : (
//         <View style={{padding: 16, backgroundColor: Colors.whiteColorF4}}>
//           <BoldText style={styles.requestsHeaders}>Ride Requests</BoldText>
//           <View style={styles.toggleContainer}>
//             {['All', 'Accepted', 'Pairing'].map(status => (
//               <TouchableOpacity
//                 key={status}
//                 style={[
//                   styles.toggleButton,
//                   selectedStatus === status && styles.activeToggle,
//                 ]}
//                 onPress={() => handleToggle(status)}>
//                 <Text
//                   style={[
//                     styles.toggleText,
//                     selectedStatus === status && styles.activeToggleText,
//                   ]}>
//                   {status}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//           <ScrollView
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.scrollContainer}
//             refreshControl={
//               <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//             }>
//             {filteredLogs.length > 0 ? (
//               filteredLogs.map((log, index) => (
//                 <Pressable
//                   key={index}
//                   style={styles.logCard}
//                   onPress={() =>
//                     navigation.navigate('RideDetailScreen', {
//                       rideId: log?.rideId,
//                       userId: userId,
//                     })
//                   }>
//                   <BoldText style={styles.actionButtonTextDark}>
//                     Ride Request
//                   </BoldText>
//                   <RegularText style={styles.actionButtonTextDark}>
//                     {log?.pickup?.pickupAddress}
//                   </RegularText>
//                   <View style={styles.actionButtonTextDarkPickup}>
//                     <RegularText style={styles.actionButtonTextDarkPickupText}>
//                       Click to View
//                     </RegularText>
//                     <IconsContainer
//                       backgroundColor={Colors.primaryColor}
//                       IconComponent={ArrowRightIcon}
//                       iconColor={Colors.whiteColor}
//                       iconWidth={16}
//                       iconHeight={16}
//                       padding={24}
//                     />
//                   </View>
//                 </Pressable>
//               ))
//             ) : (
//               <RegularText style={styles.noLogsText}>
//                 No rides available
//               </RegularText>
//             )}
//           </ScrollView>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// export default RidesScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   requestsHeaders: {
//     fontSize: 24,
//     paddingVertical: 8,
//     paddingTop: 32,
//   },
//   toggleContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginVertical: 16,
//   },
//   toggleButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     backgroundColor: Colors.grayColor,
//   },
//   activeToggle: {
//     backgroundColor: Colors.primaryColor,
//   },
//   toggleText: {
//     color: Colors.whiteColor,
//     fontSize: 16,
//   },
//   activeToggleText: {
//   },
//   scrollContainer: {
//     paddingBottom: 12,
//     minHeight: '100%',
//   },
//   logCard: {
//     marginBottom: 12,
//     padding: 12,
//     backgroundColor: Colors.whiteColor,
//     borderRadius: 24,
//     elevation: 2,
//     paddingTop: 24,
//   },
//   actionButtonTextDark: {
//     color: Colors.grayColor,
//     fontSize: 15,
//   },
//   actionButtonTextDarkPickup: {
//     backgroundColor: Colors.primaryColorTabsFaded,
//     padding: 6,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 16,
//     borderRadius: 16,
//   },
//   actionButtonTextDarkPickupText: {
//     color: Colors.primaryColor,
//     fontSize: 16,
//     marginLeft: 6,
//   },
//   noLogsText: {
//     textAlign: 'center',
//     marginTop: 20,
//     fontSize: 16,
//     color: '#999',
//   },
// });
