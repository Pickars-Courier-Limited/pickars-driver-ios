import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import React, {useEffect, useState} from 'react';
import {StyleSheet, View, ImageBackground, Image} from 'react-native';
import {Colors} from '../../Components/Colors/Colors'; // Adjust the path if necessary
import {useNavigation} from '@react-navigation/native';
import {ExtraBoldText} from '../../Components/Texts/CustomTexts/BaseTexts';
import {useTokens} from '../../Context/TokenProvider';
import {CompanyName} from '../../CompanyName';
import images from '../../../assets/images/newlogo.png';
import {useToast} from '../../Context/useToast';
import {checkServerStatus} from '../../Redux/Auth/Auth';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../Redux/newStore';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  const {updateTokens} = useTokens();
  const [showImage, setShowImage] = useState(true); // State to toggle between image and text
  const dispatch = useDispatch<AppDispatch>();
  // State to store success or error message from server health check
  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const [serverIsDown, setServerIsDown] = useState<boolean>(false); // Boolean to track server status
  const {addToast} = useToast();

  useEffect(() => {
    // Dispatch the health check action when the component is mounted
    dispatch(checkServerStatus())
      .unwrap()
      .then(() => {
        // Server is active
        setServerStatus('Server is up and running');
        setServerIsDown(false); // Set serverIsDown to false as the server is up
        console.log('Server is up and running');
      })
      .catch(error => {
        // If the server check fails, log the error or handle appropriately
        addToast(
          'Server is experiencing downtime, please try again later.',
          'success',
          `${CompanyName} Server is down at the moment`,
        );

        setServerStatus('Server is down');
        setServerIsDown(true); // Set serverIsDown to true as the server is down
        console.error('Server is down:', error);
      });
  }, [dispatch]);

  useEffect(() => {
    const sequence = async () => {
      // Show the image for 10 seconds
      setShowImage(true);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show the company name for 5 seconds
      setShowImage(false);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check tokens and navigate accordingly
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (accessToken && refreshToken && !serverIsDown) {
          updateTokens(accessToken, refreshToken);
          navigation.navigate('Home' as never); // Replace with your target home screen
        } else {
          navigation.navigate('Login' as never); // Replace with your welcome screen
        }
      } catch (error) {
        console.error('Error retrieving tokens:', error);
        navigation.navigate('Login' as never);
      }
    };

    sequence();
  }, [navigation, updateTokens]);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        {showImage ? (
          <Image
            source={images}
            style={{width: 64, height: 64}}
            resizeMode="contain"
          />
        ) : (
          <ExtraBoldText color={Colors.whiteColor} fontSize={24}>
            {CompanyName} Driver
          </ExtraBoldText>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryColor,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 6,
  },
});

export default SplashScreen;
