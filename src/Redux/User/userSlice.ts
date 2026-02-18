import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { BaseUrl, getAuthHeaders } from '../baseurl';  // Import getAuthHeaders
//import { handleUnauthorize../useAuthHeadersauthorizedError';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../store';
import { AuthResponse, ErrorResponse } from '../Auth/Auth';
import { handleUnauthorizedError } from '../HandleUnauthorizedError';

interface UserProfile {
  firstName: string;
  lastName: string;
  countryCode: string;
  email?: any
  phoneNumber?: any
  promoCode?: any
  active?: boolean;
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
  success: null,
};


// Async Thunks fetchEarnings, fetchWithdrawals  fetchWithdrawals

export const fetchAccountDetails = createAsyncThunk<UserProfile, void, { rejectValue: string }>(
  'user/fetchAccountDetails',
  async (_, { rejectWithValue }) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    try {
      const response = await axios.get(`${BaseUrl}/api/v1/wallet/riders/account-details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching logs');
    }
  },
);


export const fetchEarnings = createAsyncThunk<UserProfile, void, { rejectValue: string }>(
  'user/fetchEarnings',
  async (_, { rejectWithValue }) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    try {
      const response = await axios.get(`${BaseUrl}/api/v1/wallet/riders/earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching logs');
    }
  },
);



export const fetchWithdrawals = createAsyncThunk<UserProfile, void, { rejectValue: string }>(
  'user/fetchWithdrawals',
  async (_, { rejectWithValue }) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    try {
      const response = await axios.get(`${BaseUrl}/api/v1/wallet/riders/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching logs');
    }
  },
);



export const getUserProfile = createAsyncThunk<UserProfile, void, { rejectValue: string }>(
  'user/getUserProfile',
  async (_, { rejectWithValue }) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    try {
      const response = await axios.get(`${BaseUrl}/api/v1/user/riders/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching logs');
    }
  },
);

// Async Thunks for OTP
export const requestOtpForPhoneNumber = createAsyncThunk<void, { phoneNumber: string }, { rejectValue: string }>(
  'user/requestOtpForPhoneNumber',
  async ({ phoneNumber }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      await axios.post(`${BaseUrl}/api/v1/user/riders/send-otp`, { phoneNumber }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      const errorMessage = await handleUnauthorizedError(error); // Handle the error
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyUser = createAsyncThunk<void, { phoneNumber: string, otp: string }, { rejectValue: string }>(
  'user/verifyUser',
  async ({ phoneNumber, otp }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      await axios.post(`${BaseUrl}/api/v1/auth/riders/verify-otp`, { phoneNumber, otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      const errorMessage = await handleUnauthorizedError(error); // Handle the error
      return rejectWithValue(errorMessage);
    }
  }
);



export const updateUserProfile = createAsyncThunk<UserProfile, UserProfile, { rejectValue: string }>(
  'user/updateUserProfile',
  async (payload: any, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.put(
        `${BaseUrl}/api/v1/user/riders/profile`,
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


export const updatePhoneNumberRequest = createAsyncThunk<void, UserProfile, { rejectValue: string }>(
  'user/updatePhoneNumberRequest',
  async (phoneNumberData, { rejectWithValue }) => {
    console.log(phoneNumberData, 'phoneNumberData')
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }



      // Set up the headers
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      // Log token for debugging
      console.log('phoneNumberData Token:', phoneNumberData);
      // Send the request
      const response = await axios.post(`${BaseUrl}/api/v1/user/riders/phone-update-request`, phoneNumberData, { headers });

      // Log the response
      console.log('Response:', response.data);

      // Return the response if necessary
      return response.data;
    } catch (error) {
      // Handle errors
      const errorMessage = await handleUnauthorizedError(error); // Handle the error
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyPhoneNumberChange = createAsyncThunk<void, UserProfile, { rejectValue: string }>(
  'user/verifyPhoneNumberChange',
  async (otpData, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      // Log token for debugging
      console.log('otpData Token:', otpData);

      // Set up the headers
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Send the verification request
      const response = await axios.post(`${BaseUrl}/api/v1/user/riders/phone-update-verify`, otpData, { headers });

      // Log the response
      console.log('Response:', response.data);

      // Return the response if necessary
      return response.data;
    } catch (error) {
      const errorMessage = await handleUnauthorizedError(error); // Handle the error
      return rejectWithValue(errorMessage);
    }
  }
);
export const addWithdrawal = createAsyncThunk<
  any,  // Replace with actual type for the withdrawal data
  {
    // riderId: string;
    amount: number;
    bank: string;
    accountName: string;
    accountNumber: string;
    status: string;
    // withdrawalID?: string;
    // paystackDetails?: any;
  },
  { rejectValue: string }
>('wallet/addWithdrawal', async (data, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No access token found');

    const response = await axios.post(
      `${BaseUrl}/api/v1/wallet/riders/withdrawals`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    const errorMessage = await handleUnauthorizedError(error);
    return rejectWithValue(errorMessage);
  }
});
export const updateNotificationPreferences = createAsyncThunk<
  void,
  any,
  { rejectValue: string }
>(
  'user/updateNotificationPreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      // Retrieve the token from AsyncStorage
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        // If no token is found, reject with a message
        throw new Error('No access token found');
      }

      // Log preferences for debugging
      console.log('Preferences:', preferences);

      // Set up the headers with the retrieved token
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Perform the PUT request to update preferences
      const response = await axios.put(
        `${BaseUrl}/api/v1/user/riders/preferences`,
        preferences,
        { headers }
      );

      // Log the response for debugging
      console.log('API Response:', response.data.user);

      return response.data.user; // If successful, return response data

    } catch (error) {
      const errorMessage = await handleUnauthorizedError(error); // Handle the error
      return rejectWithValue(errorMessage);
    }
  }
);
// Thunk for account verification (OTP verification)
export const verifyAccount = createAsyncThunk<AuthResponse, { phoneNumber: string; otp: string }, { rejectValue: ErrorResponse }>(
  'user/verifyAccount',
  async ({ phoneNumber, otp }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${BaseUrl}/api/v1/auth/riders/verify-otp`, {
        phoneNumber,
        otp,
      });
      console.log(data, 'datadata')
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue({
        message: axiosError.response?.data?.message || 'Verification failed',
      });
    }
  }
);

export const updateRiderLocation = createAsyncThunk<
  UserProfile,
  { id: string; latitude: number; longitude: number; address?: string },
  { rejectValue: string }
>(
  'user/updateRiderLocation',
  async (payload, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.put(
        `${BaseUrl}/api/v1/user/riders/update-rider-location`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      const errorMessage = await handleUnauthorizedError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleRiderActiveStatus = createAsyncThunk<UserProfile, boolean, { rejectValue: string }>(
  'user/toggleRiderActiveStatus',
  async (activeStatus: boolean, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }
      console.error("🔍 Full response object:", token);
      // The backend endpoint for updating the profile is used to change the active status.
      const response = await axios.put(
        `${BaseUrl}/api/v1/user/riders/toggle-rider-active-status`,
        { active: activeStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
     
      return response.data;
    } catch (error) {
      const errorMessage = await handleUnauthorizedError(error);
      return rejectWithValue(errorMessage);
    }
  }
);


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearStatus(state) {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.profile = action.payload;
        state.success = 'Profile fetched successfully';
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        //state.error = action.payload || 'Failed to fetch profile';
      })

    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.profile = action.payload;
        { console.log(action.payload, 'action.payload') }
        state.success = 'Profile updated successfully';
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        //state.error = action.payload || 'Failed to update profile';
      })
    builder
      // Add Withdrawal
      .addCase(addWithdrawal.pending, (state) => {
        state.loading = true;
      })
      .addCase(addWithdrawal.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.success = 'Profile updated successfully';
      })
      .addCase(addWithdrawal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add withdrawal';
      });


    // Change the type in the reducer to match AuthResponse
    builder
      .addCase(verifyAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyAccount.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        // Here, we should assign the user profile or other relevant data from AuthResponse
        state.profile = action.payload.user || null;  // If AuthResponse has userProfile
        state.success = 'Account verified successfully';
      })
      .addCase(verifyAccount.rejected, (state, action) => {
        state.loading = false;
        //state.error = action.payload || 'Failed to verify account';
      });


    builder
      .addCase(updatePhoneNumberRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePhoneNumberRequest.fulfilled, (state) => {
        state.loading = false;
        state.success = 'OTP sent successfully';
      })
      .addCase(updatePhoneNumberRequest.rejected, (state, action) => {
        state.loading = false;
        //state.error = action.payload || 'Failed to send OTP';
      })

    builder
      .addCase(verifyPhoneNumberChange.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyPhoneNumberChange.fulfilled, (state) => {
        state.loading = false;
        state.success = 'Phone number verified successfully';
      })
      .addCase(verifyPhoneNumberChange.rejected, (state, action) => {
        state.loading = false;
        //state.error = action.payload || 'Failed to verify phone number';
      })
    // fetchEarnings, fetchWithdrawals  fetchAccountDetails
    builder
      .addCase(fetchAccountDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccountDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload || null;
        state.success = 'API Response updated successfully';
      })
      .addCase(fetchAccountDetails.rejected, (state) => {
        state.loading = false;
      });


    builder
      .addCase(updateNotificationPreferences.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload || null;
        state.success = 'API Response updated successfully';
      })
      .addCase(updateNotificationPreferences.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchEarnings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEarnings.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload || null;
        state.success = 'API Response updated successfully';
      })
      .addCase(fetchEarnings.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(fetchWithdrawals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWithdrawals.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload || null;
        state.success = 'API Response updated successfully';
      })
      .addCase(fetchWithdrawals.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updateRiderLocation.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRiderLocation.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.profile = action.payload;
        state.success = 'Rider location updated successfully';
      })
      .addCase(updateRiderLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update rider location';
      });

    // Handle the new thunk for toggling active status
    builder
      .addCase(toggleRiderActiveStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleRiderActiveStatus.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.profile = action.payload.rider; // The API response returns an object with a 'rider' key
        state.success = 'Rider active status updated successfully';
      })
      .addCase(toggleRiderActiveStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to toggle rider active status';
      });

  },
});


export const { clearStatus } = userSlice.actions;
export const selectUserProfile = (state: RootState) => state.user.profile;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;
export const selectUserSuccess = (state: RootState) => state.user.success;

export default userSlice.reducer;
