import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Platform, Text} from 'react-native';
import Home from '../Pages/Home/Home';
import UserProfile from '../Pages/Profile/Profile';
// import Rides from '../Pages/Rides/Rides'; // Ensure this path is correct
import {Colors} from '../Components/Colors/Colors';
import HomeIcon from '../Components/Icons/HomeIcon/HomeIcon';
import UserIcon from '../Components/Icons/UserIcon/UserIcon';
import BikeLogoIcon from '../Components/Icons/Logo/LogoIcon';
import RidesScreen from '../Pages/Rides/RidesScreen';
import IncomingRides from '../Pages/Rides/IncomingRides';
import {RegularText} from '../Components/Texts/CustomTexts/BaseTexts';
import NotificationIcon from '../Components/Icons/NotificationIcon/NotificationIcon';
import Earnings from '../Pages/Profile/Earnings';
import EarningsIcon from '../Components/Icons/EarningsIcon/EarningsIcon';
//import RidesScreen from '../Pages/Rides/RidesScreen';

const Tab = createBottomTabNavigator();

const tabBarLabelStyle = {
  fontSize: 12,
  margin: 0,
  padding: 0,
};

function BottomTabNavigation() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: Platform.OS === 'android' ? 70 : 85,
          padding: Platform.OS === 'android' ? 8 : 16,
          paddingBottom: Platform.OS === 'android' ? 24 : 32,
        },
        headerStyle: {
          borderBottomWidth: 3,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <HomeIcon
              width={18}
              height={18}
              color={focused ? Colors.primaryColor : Colors.grayColor65}
            />
          ),
          tabBarLabel: ({focused}) => (
            <RegularText
              style={[
                tabBarLabelStyle,
                {
                  color: focused ? Colors.primaryColor : Colors.grayColor65,
                },
              ]}>
              Home
            </RegularText>
          ),
        }}
      />
      {/* <Tab.Screen
        name="IncomingRides"
        component={IncomingRides}
        options={{
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <NotificationIcon
              width={18}
              height={18}
              fill={focused ? Colors.primaryColor : Colors.grayColor65}
            />
          ),
          tabBarLabel: ({focused}) => (
            <RegularText
              style={[
                tabBarLabelStyle,
                {
                  color: focused ? Colors.primaryColor : Colors.grayColor65,
                
                },
              ]}>
              New
            </RegularText>
          ),
        }}
      /> */}

      <Tab.Screen
        name="RidesScreen"
        component={RidesScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <BikeLogoIcon
              width={18}
              height={18}
              color={focused ? Colors.primaryColor : Colors.grayColor65}
            />
          ),
          tabBarLabel: ({focused}) => (
            <RegularText
              style={[
                tabBarLabelStyle,
                {
                  color: focused ? Colors.primaryColor : Colors.grayColor65,
                },
              ]}>
              Ride History
            </RegularText>
          ),
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={Earnings}
        options={{
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <EarningsIcon
              width={18}
              height={18}
              color={focused ? Colors.primaryColor : Colors.grayColor65}
            />
          ),
          tabBarLabel: ({focused}) => (
            <RegularText
              style={[
                tabBarLabelStyle,
                {
                  color: focused ? Colors.primaryColor : Colors.grayColor65,
                },
              ]}>
              Earnings
            </RegularText>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={UserProfile}
        options={{
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <UserIcon
              width={18}
              height={18}
              color={focused ? Colors.primaryColor : Colors.grayColor65}
            />
          ),
          tabBarLabel: ({focused}) => (
            <RegularText
              style={[
                tabBarLabelStyle,
                {
                  color: focused ? Colors.primaryColor : Colors.grayColor65,
                },
              ]}>
              Profile
            </RegularText>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabNavigation;
