// src/redux/authSlice.ts

import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios, {AxiosError} from 'axios';
import {BaseUrl} from '../baseurl';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = BaseUrl;

// In your types file, e.g., src/Redux/Auth/types.ts

export interface AuthResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    // Add any additional fields here
  };
  token: string;
}
export interface ErrorResponse {
  message: string;
}

// Thunk for user login
export const loginUser = createAsyncThunk<
  AuthResponse,
  {phoneNumber: any},
  {rejectValue: ErrorResponse}
>('auth/login', async (credentials, {rejectWithValue}) => {
  try {
    const {data} = await axios.post(
      `${BASE_URL}/api/v1/auth/riders/send-otp`,
      credentials,
    );

    return data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue({
      message: axiosError.response?.data?.message || 'Login failed', // Use optional chaining to avoid errors
    });
  }
});

// Thunk for account verification (OTP verification)
export const verifyAccount = createAsyncThunk<
  AuthResponse,
  {phoneNumber: string; otp: string},
  {rejectValue: ErrorResponse}
>('auth/verifyAccount', async ({phoneNumber, otp}, {rejectWithValue}) => {
  try {
    const {data} = await axios.post(`${BASE_URL}/api/v1/auth/riders/verify-otp`, {
      phoneNumber,
      otp,
    });
    console.log(phoneNumber, otp, '    console.log(phoneNumber)');

    console.log(data, 'datadatadata');
    return data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue({
      message: axiosError.response?.data?.message || 'Verification failed',
    });
  }
});

// Thunk for resending OTP
export const resendOtp = createAsyncThunk<
  {message: string},
  {phoneNumber: string},
  {rejectValue: ErrorResponse}
>('auth/resendOtp', async ({phoneNumber}, {rejectWithValue}) => {
  try {
    console.log(phoneNumber, 'phoneNumberphoneNumber');
    const {data} = await axios.post(
      `${BASE_URL}/api/v1/auth/riders/resend-otp`,
      {
        phoneNumber,
      },
    );
    return data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue({
      message: axiosError.response?.data?.message || 'Resend OTP failed',
    });
  }
});

// Add the health check thunk to your redux slice
export const checkServerStatus = createAsyncThunk<
  {message: string},
  void, // No payload needed for health check
  {rejectValue: ErrorResponse}
>('auth/checkServerStatus', async (_, {rejectWithValue}) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const {data} = await axios.get(`${BASE_URL}/api/user/healthCheck`, {
      headers,
    });
    console.log(data, 'datadatadatadatadata');
    return data; // Assuming the response is { message: "Server is active" }
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue({
      message: axiosError.response?.data?.message || 'Server is down',
    });
  }
});

// Initial state for the authentication slice
interface AuthState {
  user: null | {id: string; email: string};
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle', // idle, loading, succeeded, failed
  error: null,
};

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.payload?.message || 'An error occurred during login';
      });

    builder
      .addCase(verifyAccount.pending, state => {
        state.status = 'loading';
      })
      .addCase(verifyAccount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(verifyAccount.rejected, (state, action) => {
        state.status = 'failed';
     });
    builder
      .addCase(resendOtp.pending, state => {
        state.status = 'loading';
      })
      .addCase(resendOtp.fulfilled, state => {
        state.status = 'succeeded';
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.payload?.message || 'An error occurred during OTP resend';
      });
    builder
      .addCase(checkServerStatus.pending, state => {
        state.status = 'loading';
      })
      .addCase(checkServerStatus.fulfilled, state => {
        state.status = 'succeeded';
      })
      .addCase(checkServerStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.payload?.message || 'An error occurred during OTP resend';
      });
  },
});

export const {logout} = authSlice.actions;

export default authSlice.reducer;
