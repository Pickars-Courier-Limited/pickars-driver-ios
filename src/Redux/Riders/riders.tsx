import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import axios from 'axios';
import {BaseUrl} from '../baseurl';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = `${BaseUrl}/api/v1/user/riders`;

interface Rider {
  // Add the properties for the rider object based on your API response
  id: string;
  name: string;
  email: string;
}

interface RideSocket {
  // Define the structure of the ride socket object based on your API response
  rideId: string;
  message: string;
}

interface RiderState {
  rider: Rider | null;
  rideSockets: RideSocket[];
  ride: any; // Modify 'any' to the specific structure of a ride
  loading: boolean;
  error: string | null;
  otpMessage: string | null;
}

export const fetchRiderProfile = createAsyncThunk(
  'riders/fetchRiderProfile',
  async (_, {rejectWithValue}) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    try {
      const response = await axios.get(`${BASE_URL}/profile`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching profile');
    }
  },
);

export const fetchRideSocketLogs = createAsyncThunk(
  'riders/fetchRideSocketLogs',
  async (_, {rejectWithValue}) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    try {
      const response = await axios.get(`${BASE_URL}/ride-socket-logs`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching logs');
    }
  },
);

export const getRidesByDriver = createAsyncThunk(
  'riders/getRidesByDriver',
  async (_, {rejectWithValue}) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    try {
      const response = await axios.get(`${BASE_URL}/all-driver-rides`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching logs');
    }
  },
);

export const getDriversProfile = createAsyncThunk(
  'riders/getDriversProfile',
  async (_, {rejectWithValue}) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    try {
      const response = await axios.get(`${BASE_URL}/profile`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching logs');
    }
  },
);

export const updateDriversProfile = createAsyncThunk(
  'riders/updateDriversProfile',
  async (payload: any, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.put(
        `${BASE_URL}/profile`,
        payload, // Pass payload as the request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json', // Ensure correct content type
          },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error updating profile');
    }
  },
);

export const fetchRideById = createAsyncThunk(
  'riders/fetchRideById',
  async (rideId: string, {rejectWithValue}) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    try {
      const response = await axios.get(`${BASE_URL}/get-a-ride/${rideId}`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Ride not found');
    }
  },
);

export const updateRiderProfile = createAsyncThunk(
  'riders/updateRiderProfile',
  async (riderData: Rider, {rejectWithValue}) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    try {
      const response = await axios.put(`${BASE_URL}/profile`, riderData, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Profile update failed');
    }
  },
);

export const updatePhoneNumber = createAsyncThunk(
  'riders/updatePhoneNumber',
  async (
    {
      newPhoneNumber,
      oldPhoneNumber,
    }: {newPhoneNumber: string; oldPhoneNumber: string},
    {rejectWithValue},
  ) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    try {
      const response = await axios.post(`${BASE_URL}/update-phone`, {
        newPhoneNumber,
        oldPhoneNumber,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error updating phone');
    }
  },
);

export const verifyOtpAndUpdatePhoneNumber = createAsyncThunk(
  'riders/verifyOtpAndUpdatePhoneNumber',
  async (
    {
      oldOtp,
      newOtp,
      newPhoneNumber,
      oldPhoneNumber,
    }: {
      oldOtp: string;
      newOtp: string;
      newPhoneNumber: string;
      oldPhoneNumber: string;
    },
    {rejectWithValue},
  ) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    try {
      const response = await axios.post(`${BASE_URL}/verify-otp`, {
        oldOtp,
        newOtp,
        newPhoneNumber,
        oldPhoneNumber,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'OTP verification failed');
    }
  },
);

export const resendOtp = createAsyncThunk(
  'riders/resendOtp',
  async (phoneNumber: string, {rejectWithValue}) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    try {
      const response = await axios.post(`${BASE_URL}/resend-otp`, {
        phoneNumber,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error resending OTP');
    }
  },
);

export const getRidesByStatus = createAsyncThunk(
  'riders/getRidesByStatus',
  async (status: string, {rejectWithValue}) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    try {
      const response = await axios.get(
        `${BASE_URL}/all-driver-rides-by-status/${status}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching logs');
    }
  },
);

const initialState: RiderState = {
  rider: null,
  rideSockets: [],
  ride: null,
  loading: false,
  error: null,
  otpMessage: null,
};

const ridersSlice = createSlice({
  name: 'riders',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearOtpMessage: state => {
      state.otpMessage = null;
    },
  },
  extraReducers: builder => {
    builder
      //getDriversProfile
      .addCase(getRidesByStatus.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getRidesByStatus.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.rider = action.payload.rider;
        },
      )
      .addCase(
        getRidesByStatus.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          //          //state.error = action.payload;
        },
      )

      .addCase(getDriversProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getDriversProfile.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.rider = action.payload.rider;
        },
      )
      .addCase(
        getDriversProfile.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          //          //state.error = action.payload;
        },
      )

      .addCase(updateDriversProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateDriversProfile.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.rider = action.payload.rider;
        },
      )
      .addCase(
        updateDriversProfile.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          //          //state.error = action.payload;
        },
      )

      .addCase(getRidesByDriver.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getRidesByDriver.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.rider = action.payload.rider;
        },
      )
      .addCase(
        getRidesByDriver.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          //          //state.error = action.payload;
        },
      )

      .addCase(fetchRiderProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchRiderProfile.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.rider = action.payload.rider;
        },
      )
      .addCase(
        fetchRiderProfile.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          //          //state.error = action.payload;
        },
      )

      .addCase(fetchRideSocketLogs.pending, state => {
        state.loading = true;
      })
      .addCase(
        fetchRideSocketLogs.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.rideSockets = action.payload.rideSockets;
        },
      )
      .addCase(
        fetchRideSocketLogs.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          //          //state.error = action.payload;
        },
      )

      .addCase(fetchRideById.pending, state => {
        state.loading = true;
      })
      .addCase(fetchRideById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.ride = action.payload.data;
      })
      .addCase(fetchRideById.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        //state.error = action.payload;
      })

      .addCase(updateRiderProfile.pending, state => {
        state.loading = true;
      })
      .addCase(
        updateRiderProfile.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.rider = action.payload.rider;
        },
      )
      .addCase(
        updateRiderProfile.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          //          //state.error = action.payload;
        },
      )

      .addCase(
        updatePhoneNumber.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.otpMessage = action.payload.message;
        },
      )
      .addCase(
        verifyOtpAndUpdatePhoneNumber.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.rider = action.payload.rider;
        },
      )
      .addCase(resendOtp.fulfilled, (state, action: PayloadAction<any>) => {
        state.otpMessage = action.payload.message;
      });
  },
});

export const {clearError, clearOtpMessage} = ridersSlice.actions;
export default ridersSlice.reducer;
