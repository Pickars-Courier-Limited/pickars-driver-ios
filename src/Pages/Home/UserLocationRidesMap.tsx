import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import {
  BoldText,
  RegularText,
  MediumText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import { Colors } from '../../Components/Colors/Colors';

interface UserLocationRidesMapProps {
  ride?: any;
  isRideStatus?: boolean;
  isStatic?: boolean;
  isShow?: boolean;
}

const UserLocationRidesMap: React.FC<UserLocationRidesMapProps> = ({
  ride,
  isRideStatus,
  isStatic = false,
  isShow = false,
}) => {
  const pickup = ride?.pickup || {};

  // Clean currency formatting
  const formattedPrice = ride?.ride?.totalPrice
    ? new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
      }).format(ride.ride.totalPrice)
    : null;

  return (
    <View style={styles.container}>
      {/* 1. Header Section */}
      <View style={styles.infoSection}>
        <View style={styles.addressWrapper}>
          <View style={styles.indicatorContainer}>
            <View style={styles.dot} />
            <View style={styles.line} />
          </View>

          <View style={styles.textContainer}>
            <MediumText style={styles.label}>PICKUP LOCATION</MediumText>
            <BoldText style={styles.addressText}>
              {pickup.pickupAddress || 'Detecting address...'}
            </BoldText>
          </View>
        </View>

        {formattedPrice && (
          <View style={styles.priceContainer}>
            <BoldText style={styles.priceText}>{formattedPrice}</BoldText>
          </View>
        )}
      </View>
      {isShow && (
        <View style={[styles.mapWrapper, { height: isStatic ? 140 : 200 }]}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
            liteMode={isStatic}
            initialRegion={{
              latitude: pickup.pickupLatitude || 6.5244,
              longitude: pickup.pickupLongitude || 3.3792,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            }}
            scrollEnabled={!isStatic}
            zoomEnabled={!isStatic}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            {pickup.pickupLatitude && (
              <Marker
                coordinate={{
                  latitude: pickup.pickupLatitude,
                  longitude: pickup.pickupLongitude,
                }}
              >
                <View style={styles.customMarker}>
                  <View style={styles.markerInner} />
                </View>
              </Marker>
            )}
          </MapView>

          {/* Subtle Map Overlay for better text readability */}
          <View style={styles.mapOverlay} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  indicatorContainer: {
    alignItems: 'center',
    marginRight: 10,
    marginTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryColor || '#007AFF',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  line: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E5EA',
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 15,
    color: '#1C1C1E',
  },
  priceContainer: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 10,
  },
  priceText: {
    fontSize: 15,
    color: Colors.primaryColor || '#007AFF',
  },
  mapWrapper: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.02)', // Very subtle tint
    pointerEvents: 'none',
  },
  customMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default UserLocationRidesMap;
