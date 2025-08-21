import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import NoInternetPage from '../Pages/Auth/NoInternetStack';

export type NoInternetStackParamList = {
  NoInternetPage: undefined;
};

const NoInternetStack = createStackNavigator<NoInternetStackParamList>();

const NoInternetStackNavigator: React.FC = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NoInternetStack.Navigator initialRouteName="NoInternetPage">
        <NoInternetStack.Screen
          name="NoInternetPage"
          component={NoInternetPage}
          options={{headerShown: false}}
        />
      </NoInternetStack.Navigator>
    </GestureHandlerRootView>
  );
};

export default NoInternetStackNavigator;
