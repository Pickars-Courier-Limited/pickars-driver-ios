// import {useState, useEffect, useCallback} from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
// // You could also use SecureStore if you're working with Expo
// // import * as SecureStore from 'expo-secure-store';

// // Custom hook to get auth headers with access token
// const useAuthHeaders = () => {
//   const [headers, setHeaders] = useState<{Authorization: string} | null>(null);
//   const [loading, setLoading] = useState(true); // Track loading state for async action
//   const [error, setError] = useState<string | null>(null); // Track error state

//   // Fetch the token from storage
//   const fetchAuthHeaders = useCallback(async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem('accessToken'); // Using AsyncStorage, can use SecureStore instead

//       if (!token) {
//         setError('No access token found');
//         setHeaders(null);
//         return;
//       }

//       setHeaders({Authorization: `Bearer ${token}`});
//     } catch (err) {
//       setError('Failed to retrieve token');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchAuthHeaders(); // Fetch the headers on mount
//   }, [fetchAuthHeaders]);

//   return {headers, loading, error};
// };

// export default useAuthHeaders;
