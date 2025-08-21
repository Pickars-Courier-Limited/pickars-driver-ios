// src/redux/messages/messagesSlice.js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BaseUrl} from '../baseurl';
import {handleUnauthorizedError} from '../HandleUnauthorizedError';

// Async thunk to fetch messages for a specific user
export const fetchMessagesForUser = createAsyncThunk(
  'messages/fetchMessagesForUser',
  async (userId, {rejectWithValue}) => {
    try {
      // Retrieve token from AsyncStorage
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return rejectWithValue('No token found');
      }
      const response = await axios.get(
        `${BaseUrl}/api/chat/support/messages/customer/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Use the token for authentication
          },
        },
      );

      // Log the successful response
      console.log('API Response:', response.data);

      return response.data; // The response will contain the array of messages
    } catch (error) {
      const errorMessage = await handleUnauthorizedError(error); // Handle the error
      return errorMessage;
    }
  },
);

export const fetchDriverCustomerMessages = createAsyncThunk(
  'messages/fetchDriverCustomerMessages',
  async (groupId, {rejectWithValue}) => {
    try {
      // Retrieve token from AsyncStorage
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return rejectWithValue('No token found');
      }

      // Send the API request to fetch messages
      const response = await axios.get(
        `${BaseUrl}/api/chat/driver/rides/messages/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Bearer token authentication
          },
        },
      );

      return response.data; // Return the messages from the API response
    } catch (error) {
      const errorMessage = await handleUnauthorizedError(error); // Handle the error
      return rejectWithValue(errorMessage);
    }
  },
);

// Slice for managing messages state
const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    messages: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      // Fetch messages for a user
      .addCase(fetchMessagesForUser.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchMessagesForUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages = action.payload; // Save the fetched messages to state
      })
      .addCase(fetchMessagesForUser.rejected, (state, action) => {
        state.status = 'failed';
        //state.error = action.error.message;
        // Log the error message if available
        console.log('Failed to fetch messages:', action.error.message);
      }) // Fetch messages for a user
      .addCase(fetchDriverCustomerMessages.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchDriverCustomerMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages = action.payload; // Save the fetched messages to state
      })
      .addCase(fetchDriverCustomerMessages.rejected, (state, action) => {
        state.status = 'failed';
        //state.error = action.error.message;
        // Log the error message if available
        console.log('Failed to fetch messages:', action.error.message);
      });
  },
});

export default messagesSlice.reducer;
