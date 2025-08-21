import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {MainStackParamList} from '../Navigation/MainStackNavigation';
import {Colors} from '../Components/Colors/Colors';
import LocationPointerIcon from '../Components/Icons/LocationPointerIcon/LocationPointerIcon';
import LocationIcon from '../Components/Icons/Location/LocationIcon';
import IconsContainer from '../Components/Icons/IconContainer';
import {BoldText, RegularText} from '../Components/Texts/CustomTexts/BaseTexts';
import CustomButton from '../Components/Buttons/CustomButton';
import {BlurView} from '@react-native-community/blur';
import ArrowLeftIcon from '../Components/Icons/Arrows/ArrowLeftIcon';

type NextPageRouteProp = RouteProp<MainStackParamList, 'NextPage'>;

const GOOGLE_MAPS_APIKEY = 'AIzaSyDEA03t46Rxy4uqPY7hcQmqyfU7uPpkh2c';

const NextPage: React.FC = () => {
  const route = useRoute<NextPageRouteProp>();
  const navigation = useNavigation();

  const pickupLocation = {
    city: 'Ada George, Port Harcourt, Rivers State, Nigeria',
    id: '1728637586475',
    latitude: 4.854,
    longitude: 6.9835,
    name: 'Ada George, Port Harcourt, Rivers State, Nigeria',
  };

  const deliveryLocations = [
    {
      city: 'Port Harcourt',
      id: '1728702640549',
      latitude: 4.8181656,
      longitude: 7.0091475,
      name: 'Waterlines, Ekaninwo Close, Port Harcourt, Nigeria',
      receiverName: 'Yeah',
      receiverPhoneNumber: '08140710983',
    },
    {
      city: 'Peter Odili Road',
      id: '1728702640550',
      latitude: 4.805586,
      longitude: 7.036254,
      name: 'Peter Odili Road, Port Harcourt, Rivers State, Nigeria',
      receiverName: 'John Doe',
      receiverPhoneNumber: '08140987654',
    },
    {
      city: 'Peter Odili Road',
      id: '1728702640550',
      latitude: 4.805586,
      longitude: 7.036254,
      name: 'Peter Odili Road, Port Harcourt, Rivers State, Nigeria',
      receiverName: 'John Doe',
      receiverPhoneNumber: '08140987654',
    },
    {
      city: 'Port Harcourt',
      id: '1728702640549',
      latitude: 4.8181656,
      longitude: 7.0091475,
      name: 'Waterlines, Ekaninwo Close, Port Harcourt, Nigeria',
      receiverName: 'Yeah',
      receiverPhoneNumber: '08140710983',
    },
    {
      city: 'Peter Odili Road',
      id: '1728702640550',
      latitude: 4.805586,
      longitude: 7.036254,
      name: 'Peter Odili Road, Port Harcourt, Rivers State, Nigeria',
      receiverName: 'John Doe',
      receiverPhoneNumber: '08140987654',
    },
    {
      city: 'Peter Odili Road',
      id: '1728702640550',
      latitude: 4.805586,
      longitude: 7.036254,
      name: 'Peter Odili Road, Port Harcourt, Rivers State, Nigeria',
      receiverName: 'John Doe',
      receiverPhoneNumber: '08140987654',
    },
  ];

  const [showAllLocations, setShowAllLocations] = useState(false);

  const firstDeliveryLocation = deliveryLocations[0];
  const secondDeliveryLocation = deliveryLocations[1];

  const toggleShowAllLocations = () => {
    setShowAllLocations(prevState => !prevState);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}>
        <Marker
          coordinate={{
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
          }}>
          <View style={[styles.marker, styles.pickupLocationMarker]}>
            <LocationIcon width={24} height={32} color={Colors.whiteColor} />
          </View>
        </Marker>

        {deliveryLocations.map(location => (
          <Marker
            key={location.id}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}>
            <View style={styles.marker}>
              <LocationPointerIcon
                width={24}
                height={24}
                fill={Colors.whiteColor}
              />
            </View>
          </Marker>
        ))}

        {deliveryLocations.map((location, index) => (
          <MapViewDirections
            key={`directions-${index}`}
            origin={index === 0 ? pickupLocation : deliveryLocations[index - 1]}
            destination={location}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={2.5}
            strokeColor={Colors.yellowColor}
            strokeColors={[Colors.errorColor]}
          />
        ))}
      </MapView>

      <View
        style={styles.adjustDetails}
        // blurType="light"
        // blurAmount={10}
        // reducedTransparencyFallbackColor="white"
      >
        <ScrollView>
          <Pressable
            style={styles.innerContainer}
            onPress={() => navigation.goBack()}>
            <ArrowLeftIcon color={Colors.headerColor} />
          </Pressable>

          <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 20}}>
            <IconsContainer
              backgroundColor={Colors.primaryColorFaded}
              IconComponent={LocationIcon}
              iconColor={Colors.primaryColor}
              iconWidth={16}
              iconHeight={16}
              padding={24}
            />
            <View>
              <BoldText
                style={[
                  styles.noLocationTextPinPoint,
                  {marginBottom: 4, fontSize: 16},
                ]}>
                Pickup Location
              </BoldText>
              <RegularText style={styles.noLocationTextPinPoint}>
                {pickupLocation.name}
              </RegularText>
            </View>
          </View>

          <CustomButton
            marginTop={14}
            title="Confirm Pickup"
            onPress={() => navigation.navigate('FindingDriver' as never)}
            backgroundColors={Colors.primaryColor}
            textColor={Colors.whiteColor}
          />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  adjustDetails: {
    padding: 16,
    // alignItems: 'center',
    position: 'absolute',
    bottom: 48,
    left: 14,
    right: 14,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: Colors.whiteColor,
    borderWidth: 1.4,
  },
  innerContainer: {
    marginBottom: 24,
    marginTop: 16,
    alignSelf: 'flex-start',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 24,
    // justifyContent: 'center',
  },
  marker: {
    backgroundColor: Colors.errorColor,
    borderRadius: 64,
    padding: 3,
  },
  noLocationTextPinPoint: {
    fontSize: 14,
    marginBottom: 14,
    // marginTop: -4,
    flexWrap: 'wrap',
    flexShrink: 1,
    textAlign: 'left',
    color: Colors.headerColor,
  },
  noLocationTextPinPointBold: {
    // marginTop: 14,
    fontSize: 16,
    color: Colors.headerColor,
  },
  // pickupLocationMarker: {
  //   position: 'absolute',
  //   top: 10,
  //   left: 16,
  // },
});

export default NextPage;
