import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import RideDetailScreen from '../Pages/Rides/RideDetailScreen';
import BottomTabNavigation from './BottomTabNavigation';
import ChatPage from '../Pages/Support/Messages/ChatPage';
import UserNameUpdate from '../Pages/Profile/UserNameUpdate';
import WithdrawPage from '../Pages/Profile/WithdrawPage';
import IncomingRides from '../Pages/Rides/IncomingRides';
import RidesLog from '../Pages/Rides/RidesLog';

export type MainStackParamList = {
  Homepage: undefined;
  RideDetailScreen: undefined;
  UserNameUpdate: undefined;
  ChatPage: undefined;
  WithdrawPage: undefined;
  IncomingRides: undefined;
  RidesLog: undefined;
};

const MainStack = createStackNavigator<MainStackParamList>();

const MainStackNavigator: React.FC = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <MainStack.Navigator initialRouteName="Homepage">
        <MainStack.Screen
          name="Homepage"
          component={BottomTabNavigation}
          options={{headerShown: false}}
        />
        <MainStack.Screen
          name="RideDetailScreen"
          component={RideDetailScreen}
          options={{headerShown: false}}
        />
        <MainStack.Screen
          name="ChatPage"
          component={ChatPage}
          options={{headerShown: false}}
        />
        <MainStack.Screen
          name="IncomingRides"
          component={IncomingRides}
          options={{headerShown: false}}
        />
        <MainStack.Screen
          name="UserNameUpdate"
          component={UserNameUpdate}
          options={{headerShown: false}}
        />
        <MainStack.Screen
          name="WithdrawPage"
          component={WithdrawPage}
          options={{headerShown: false}}
        />

        <MainStack.Screen
          name="RidesLog"
          component={RidesLog}
          options={{headerShown: false}}
        />
      </MainStack.Navigator>
    </GestureHandlerRootView>
  );
};

export default MainStackNavigator;
