import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {RegularText} from '../../Components/Texts/CustomTexts/BaseTexts';
import { Colors } from '../../Components/Colors/Colors';


export const formatDate = (timestamp: any) => {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const getOrdinal = (day: any) => {
    if (day > 3 && day < 21) return day + 'th';
    switch (day % 10) {
      case 1:
        return day + 'st';
      case 2:
        return day + 'nd';
      case 3:
        return day + 'rd';
      default:
        return day + 'th';
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hourIn12Format = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${getOrdinal(day)} ${
    monthNames[month]
  } ${year}, ${hourIn12Format}:${formattedMinutes} ${ampm}`;
};

interface RideStatusAndActionsProps {
  rideDetails: any;
  isButtonDisabled: boolean;
  handleAction: (action: string, extraPayload?: any) => void;
}

const RideStatusAndActions = ({
  rideDetails,
  isButtonDisabled,
  handleAction,
}: RideStatusAndActionsProps) => {
  const navigation = useNavigation();

  if (!rideDetails) {
    return (
      <RegularText style={componentStyles.noDataText}>
        No ride details available.
      </RegularText>
    );
  }

  const getButtonBackgroundColor = (buttonType: string) => {
    if (isButtonDisabled) {
      return Colors.grayColor;
    }
  
    if (rideDetails?.cancelRide?.isCancelled === true) {
      return Colors.grayColor;
    } else if (rideDetails?.endRide?.isEnded === true) {
      return Colors.grayColor;
    } else if (rideDetails?.startRide?.isStarted === true) {
      // Ride is ongoing
      if (buttonType === 'endRide') {
        return Colors.greenColor;
      }
      return Colors.primaryColor;
    } else if (rideDetails?.acceptRide) {
      // Ride is accepted but not started
      if (buttonType === 'startRide') {
        return Colors.greenColor;
      } else if (buttonType === 'cancelRide') {
        return Colors.errorColor;
      }
      return Colors.primaryColor;
    } else {
      // Ride is neither accepted nor started (initial state)
      if (buttonType === 'cancelRide') {
        return Colors.errorColor;
      } else if (buttonType === 'acceptRide' || buttonType === 'rejectRide') {
        return Colors.primaryColor;
      }
      return Colors.grayColor; // ✅ Default for unknown state
    }
  };

  const getButtonTextColor = () => Colors.whiteColor;

  return (
    <View style={componentStyles.container}>
      <RegularText style={componentStyles.label}>Payment Details:</RegularText>
      <RegularText style={componentStyles.value}>
        Paid: {rideDetails?.paid?.isPaid ? 'Yes' : 'No'} | Method:{' '}
        {rideDetails?.paid?.paymentMethod || 'N/A'}
      </RegularText>

      <RegularText style={componentStyles.label}>Ride Status:</RegularText>
      <RegularText style={componentStyles.value}>
        Accepted: {rideDetails?.acceptRide ? 'Yes' : 'No'} | Started:{' '}
        {rideDetails?.startRide?.isStarted ? 'Yes' : 'No'} | Ended:{' '}
        {rideDetails?.endRide?.isEnded ? 'Yes' : 'No'} | Cancelled:{' '}
        {rideDetails?.cancelRide?.isCancelled ? 'Yes' : 'No'}
      </RegularText>

      {rideDetails?.createdAt && (
        <>
          <RegularText style={componentStyles.label}>Created At:</RegularText>
          <RegularText style={componentStyles.value}>
            {formatDate(rideDetails?.createdAt)}
          </RegularText>
        </>
      )}

      <>
        {!rideDetails?.acceptRide ? (
          <>
            <TouchableOpacity
              style={[
                componentStyles.actionButton,
                { backgroundColor: getButtonBackgroundColor('acceptRide') },
                isButtonDisabled && componentStyles.disabledButton,
              ]}
              onPress={() => handleAction('acceptRide')}
              disabled={isButtonDisabled}>
              <RegularText style={[componentStyles.actionButtonText, { color: getButtonTextColor('acceptRide') }]}>
                {isButtonDisabled ? 'Processing...' : 'Accept Ride'}
              </RegularText>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={[
                componentStyles.actionButton,
                { backgroundColor: getButtonBackgroundColor('rejectRide') },
                isButtonDisabled && componentStyles.disabledButton,
              ]}
              onPress={() => handleAction('rejectRide')}
              disabled={isButtonDisabled}>
              <RegularText style={[componentStyles.actionButtonText, { color: getButtonTextColor('rejectRide') }]}>
                {isButtonDisabled ? 'Processing...' : 'Reject Ride'}
              </RegularText>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={[
                componentStyles.cancelButton,
                { backgroundColor: getButtonBackgroundColor('cancelRide') },
                isButtonDisabled && componentStyles.disabledButton,
              ]}
              onPress={() => handleAction('cancelRide')}
              disabled={isButtonDisabled}>
              <RegularText style={[componentStyles.actionButtonText, { color: getButtonTextColor('cancelRide') }]}>
                {isButtonDisabled ? 'Processing...' : 'Cancel Ride'}
              </RegularText>
            </TouchableOpacity>
          </>
        ) : rideDetails?.startRide?.isStarted === false ? (
          <>
            <TouchableOpacity
              style={[
                componentStyles.actionButton,
                { backgroundColor: getButtonBackgroundColor('chat') },
                isButtonDisabled && componentStyles.disabledButton,
              ]}
              onPress={() =>
                navigation.navigate('ChatPage', {
                  _id: rideDetails?._id,
                  plateNumber: rideDetails?.rider?.plateNumber,
                  driverName: `${rideDetails?.rider?.lastName} ${rideDetails?.rider?.firstName}`,
                  imageUrl: rideDetails?.rider?.imageUrl,
                  phoneNumber: rideDetails?.rider?.phoneNumber,
                })
              }
              disabled={isButtonDisabled}>
              <RegularText style={[componentStyles.actionButtonText, { color: getButtonTextColor('chat') }]}>
                Send a Message
              </RegularText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                componentStyles.actionButton,
                { backgroundColor: getButtonBackgroundColor('startRide') },
                isButtonDisabled && componentStyles.disabledButton,
              ]}
              onPress={() => handleAction('startRide')}
              disabled={isButtonDisabled}>
              <RegularText style={[componentStyles.actionButtonText, { color: getButtonTextColor('startRide') }]}>
                Start Ride
              </RegularText>
            </TouchableOpacity>
          </>
        ) : rideDetails?.endRide?.isEnded === false ? (
          <>
            <TouchableOpacity
              style={[
                componentStyles.actionButton,
                { backgroundColor: getButtonBackgroundColor('endRide') },
                isButtonDisabled && componentStyles.disabledButton,
              ]}
              onPress={() => handleAction('endRide')}
              disabled={isButtonDisabled}>
              <RegularText style={[componentStyles.actionButtonText, { color: getButtonTextColor('endRide') }]}>
                End Ride
              </RegularText>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[
              componentStyles.actionButton,
              { backgroundColor: getButtonBackgroundColor('reportRide') },
              isButtonDisabled && componentStyles.disabledButton,
            ]}
            onPress={() => handleAction('reportRide')}
            disabled={isButtonDisabled}>
            <RegularText style={[componentStyles.actionButtonText, { color: getButtonTextColor('reportRide') }]}>
              Report Ride
            </RegularText>
          </TouchableOpacity>
        )}
      </>
    </View>
  );
};

const componentStyles = StyleSheet.create({
  container: {marginTop: 48},
  label: {fontSize: 16, color: '#555', marginTop: 8},
  value: {fontSize: 16, color: '#333', marginBottom: 8},
  noDataText: {fontSize: 16, color: '#999', textAlign: 'center', marginTop: 16},
  actionButton: {
    paddingVertical: 16,
    marginVertical: 6,
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 16,
    marginVertical: 6,
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {color: '#FFF', fontSize: 16},
  disabledButton: {backgroundColor: '#D1D1D1'},
});

export default RideStatusAndActions;
