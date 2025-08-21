import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import MainStackNavigator from './Navigation/MainStackNavigation';
import AuthStackNavigator from './Navigation/AuthStackNavigation';
import NoInternetStackNavigator from './Navigation/NoInternetStackNavigator';
import { useInternet } from './Context/InternetContext';
import { useVerifyToken } from './Hook/User/useVerifyToken'; // Custom hook from earlier
import { navigationRef } from './Navigation/navigationRef';
import ShimmerLoader from './Components/Loader/ShimmerLoader';

const PagesNavigator = () => {
  const { isConnected } = useInternet();
  const { verifyToken, tokenStatus, shouldPromptLogin } = useVerifyToken();

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const renderNavigator = () => {
    if (!isConnected) return <NoInternetStackNavigator />;
    if (tokenStatus === 'pending') return null; // You can show splash here
    if (shouldPromptLogin) return <AuthStackNavigator />;

    if (tokenStatus === 'error') {
      return <ShimmerLoader />;
    }

    return <MainStackNavigator />;
  };

  return (
    <NavigationContainer ref={navigationRef}>
      {renderNavigator()}
    </NavigationContainer>
  );
};

export default PagesNavigator;
