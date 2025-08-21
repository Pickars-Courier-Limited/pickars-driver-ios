import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BaseUrl} from '../baseurl';
import {handleUnauthorizedError} from '../HandleUnauthorizedError';

// Async thunk for booking a ride
export const bookRide = createAsyncThunk(
  'ride/bookRide',
  async (rideDetails, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('Unauthorized. Token not found.');

      const response = await axios.post(
        `${BaseUrl}/api/ride/book-a-ride/customer/booking`,
        rideDetails,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      return response.data;
    } catch (error) {
      const errorMessage = await handleUnauthorizedError(error); // Handle the error
      return rejectWithValue(errorMessage);
    }
  },
);

// Async thunk for fetching all vehicles
export const getAllVehicles = createAsyncThunk(
  'ride/getAllVehicles',
  async (_, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('Unauthorized. Token not found.');

      const response = await axios.get(`${BaseUrl}/api/vehicle`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data; // List of vehicles
    } catch (error) {
      const errorMessage = await handleUnauthorizedError(error); // Handle the error
      return rejectWithValue(errorMessage);
    }
  },
);

// Async thunk for fetching customer rides
export const getRidesOngoingForCustomer = createAsyncThunk(
  'ride/getRidesOngoingForCustomer',
  async (_, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('Unauthorized. Token not found.');

      const response = await axios.get(`${BaseUrl}/api/ride/customer/ongoing`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data; // Customer rides
    } catch (error) {
      const errorMessage = await handleUnauthorizedError(error); // Handle the error
      return rejectWithValue(errorMessage);
    }
  },
);

// Async thunk for canceling a ride
export const cancelRide = createAsyncThunk(
  'ride/cancelRide',
  async (rideId, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('Unauthorized. Token not found.');

      const response = await axios.put(
        `${BaseUrl}/api/ride/cancel-ride/quick-cancel/${rideId}`,
        {}, // No body content required
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      return response.data;
    } catch (error) {
      const errorMessage = await handleUnauthorizedError(error); // Handle the error
      return rejectWithValue(errorMessage);
    }
  },
);

export const getRidesForCustomer = createAsyncThunk(
  'ride/getRidesForCustomer',
  async (_, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('Unauthorized. Token not found.');

      const response = await axios.get(`${BaseUrl}/api/ride/customer/rides`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data; // Customer rides
    } catch (error) {
      console.log(error, 'errorerror');
      const errorMessage = await handleUnauthorizedError(error); // Handle the error
      return rejectWithValue(errorMessage);
    }
  },
);

export const getRideById = createAsyncThunk(
  'ride/getRideById',
  async (id, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('Unauthorized. Token not found.');

      const response = await axios.get(`${BaseUrl}/api/ride/${id}`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data; // Customer rides
    } catch (error) {
      const errorMessage = await handleUnauthorizedError(error); // Handle the error
      return rejectWithValue(errorMessage);
    }
  },
);

export const rateRider = createAsyncThunk(
  'ride/rateRider',
  async (
    {
      riderId,
      rating,
      rideId,
    }: {riderId: string; rating: number; rideId: string},
    {rejectWithValue},
  ) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('Unauthorized. Token not found.');

      const response = await axios.post(
        `${BaseUrl}/api/ride/rating/customer/rating-rider/${riderId}`,
        {rating, rideId}, // Pass the rating as part of the request body
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      console.log('Rating responseresponseresponseresponseresponse:', response);
      return response.data;
    } catch (error) {
      const errorMessage = await handleUnauthorizedError(error); // Handle the error
      return rejectWithValue(errorMessage);
    }
  },
);

// Ride slice
const rideSlice = createSlice({
  name: 'ride',
  initialState: {
    booking: null, // Booking information
    vehicles: [], // List of vehicles
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null, // Error state
  },
  reducers: {
    clearBookingState: state => {
      state.booking = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Book ride states
      .addCase(bookRide.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(bookRide.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.booking = action.payload;
      })
      .addCase(bookRide.rejected, (state, action) => {
        state.status = 'failed';
      //  state.error = action.payload;
      })

      // Fetch all vehicles states
      .addCase(getAllVehicles.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getAllVehicles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.vehicles = action.payload; // Update vehicles list
      })
      .addCase(getAllVehicles.rejected, (state, action) => {
        state.status = 'failed';
      //  state.error = action.payload;
      })

      // Fetch rides for customer states
      .addCase(getRidesForCustomer.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getRidesForCustomer.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(getRidesForCustomer.rejected, (state, action) => {
        state.status = 'failed';
      //  state.error = action.payload;
      })

      .addCase(getRidesOngoingForCustomer.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getRidesOngoingForCustomer.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(getRidesOngoingForCustomer.rejected, (state, action) => {
        state.status = 'failed';
      //  state.error = action.payload;
      })

      .addCase(getRideById.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getRideById.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(getRideById.rejected, (state, action) => {
        state.status = 'failed';
      //  state.error = action.payload;
      })
      .addCase(rateRider.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(rateRider.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(rateRider.rejected, (state, action) => {
        state.status = 'failed';
      //  state.error = action.payload;
      })
      .addCase(cancelRide.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(cancelRide.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(cancelRide.rejected, (state, action) => {
        state.status = 'failed';
      //  state.error = action.payload;
      });

    //getRideById
  },
});

export const {clearBookingState} = rideSlice.actions;
export default rideSlice.reducer;
