import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Login from '../Pages/Auth/Login';
import OtpVerification from '../Pages/Auth/OtpVerification';
import SplashScreen from '../Pages/Auth/SplashScreen';

export type AuthStackParamList = {
  SplashScreen: undefined;
  Login: undefined;
  CreateAccount: undefined;
  OTP: {phoneNumber: string};
  WelcomeScreen: undefined;
};

const AuthStack = createStackNavigator<AuthStackParamList>();

const AuthStackNavigator: React.FC = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AuthStack.Navigator initialRouteName="SplashScreen">
        <AuthStack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{headerShown: false}}
        />
        <AuthStack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
        <AuthStack.Screen
          name="OTP"
          component={OtpVerification}
          options={{headerShown: false}}
        />
      </AuthStack.Navigator>
    </GestureHandlerRootView>
  );
};

export default AuthStackNavigator;
