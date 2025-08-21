import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseUrl } from '../baseurl';
import { handleUnauthorizedError } from '../HandleUnauthorizedError';
import { RootState } from '../store';

// Types
interface WalletState {
  earnings: Array<any>; // Replace `any` with the specific type for earnings
  withdrawals: Array<any>; // Replace `any` with the specific type for withdrawals
  accountDetails: Array<any>; // Add accountDetails to the state
  loading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  earnings: [],
  withdrawals: [],
  accountDetails: [], // Initialize accountDetails
  loading: false,
  error: null,
};

// Async Thunks

// Fetch Earnings
export const fetchEarnings = createAsyncThunk<
  Array<any>, // Replace `any` with the specific type
  void,
  { rejectValue: string }
>('wallet/fetchEarnings', async (_, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No access token found');

    const response = await axios.get(
      `${BaseUrl}/api/v1/wallet/riders/earnings`,
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

// Fetch Withdrawals
export const fetchWithdrawals = createAsyncThunk<
  Array<any>, // Replace `any` with the specific type
  void,
  { rejectValue: string }
>('wallet/fetchWithdrawals', async (_, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No access token found');

    const response = await axios.get(
      `${BaseUrl}/api/v1/wallet/riders/withdrawals`,
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

// Fetch Account Details
export const fetchAccountDetails = createAsyncThunk<
  Array<any>, // Replace `any` with the specific type
  void,
  { rejectValue: string }
>('wallet/fetchAccountDetails', async (_, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No access token found');

    const response = await axios.get(
      `${BaseUrl}/api/v1/wallet/riders/account-details`,
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

// Slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWalletError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Earnings
      .addCase(fetchEarnings.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchEarnings.fulfilled,
        (state, action: PayloadAction<Array<any>>) => {
          state.loading = false;
          state.earnings = action.payload;
        }
      )
      .addCase(fetchEarnings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch earnings';
      });

    builder
      // Fetch Withdrawals
      .addCase(fetchWithdrawals.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchWithdrawals.fulfilled,
        (state, action: PayloadAction<Array<any>>) => {
          state.loading = false;
          state.withdrawals = action.payload;
        }
      )
      .addCase(fetchWithdrawals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch withdrawals';
      });

    builder
      // Fetch Account Details
      .addCase(fetchAccountDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchAccountDetails.fulfilled,
        (state, action: PayloadAction<Array<any>>) => {
          state.loading = false;
          state.accountDetails = action.payload; // Update accountDetails
        }
      )
      .addCase(fetchAccountDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch account details';
      });
  },
});

// Actions
export const { clearWalletError } = walletSlice.actions;

// Selectors
export const selectWalletEarnings = (state: RootState) => state.wallet.earnings;
export const selectWalletWithdrawals = (state: RootState) =>
  state.wallet.withdrawals;
export const selectWalletAccountDetails = (state: RootState) =>
  state.wallet.accountDetails; // Selector for accountDetails
export const selectWalletLoading = (state: RootState) => state.wallet.loading;
export const selectWalletError = (state: RootState) => state.wallet.error;

// Reducer
export default walletSlice.reducer;