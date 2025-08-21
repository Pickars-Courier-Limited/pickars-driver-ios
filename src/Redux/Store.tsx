import {configureStore} from '@reduxjs/toolkit';
import authReducer from './Auth/Auth';
import userReducer from './User/userSlice';
import riderReducer from './Rides/Rides';
import ridersSlice from './Riders/riders';
import messagesReducer from './Messages/Messages';

export const store = configureStore({
  reducer: {
    authReducer: authReducer,
    userReducer: userReducer,
    riderReducer: riderReducer,
    riders: ridersSlice,
    messagesReducer: messagesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
