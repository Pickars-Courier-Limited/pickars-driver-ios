import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  RegularText,
  SemiBoldText,
  BoldText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import { Colors } from '../../Components/Colors/Colors';

// ────────────────────────────────────────────────────────────────────
// UTILITY: DATE FORMATTER
// ────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ────────────────────────────────────────────────────────────────────

const StatusBadge = ({ label, value }: { label: string; value: boolean }) => (
  <View style={styles.statusBadge}>
    <View
      style={[
        styles.statusIndicator,
        { backgroundColor: value ? '#10B981' : '#6B7280' },
      ]}
    />
    <RegularText fontSize={13} color="#4B5563">
      {label}: <SemiBoldText fontSize={13}>{value ? 'Yes' : 'No'}</SemiBoldText>
    </RegularText>
  </View>
);

const InfoCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.infoCard}>
    <BoldText fontSize={14} color={Colors.headerColor} style={styles.cardTitle}>
      {title}
    </BoldText>
    {children}
  </View>
);

// ────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────────────

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
      <View style={styles.emptyContainer}>
        <RegularText style={styles.noDataText}>
          No ride details available.
        </RegularText>
      </View>
    );
  }

  const getButtonConfig = (buttonType: string) => {
    if (isButtonDisabled) {
      return { bg: '#D1D5DB', text: '#6B7280' };
    }

    if (rideDetails?.cancelRide?.isCancelled === true) {
      return { bg: '#D1D5DB', text: '#6B7280' };
    } else if (rideDetails?.endRide?.isEnded === true) {
      return { bg: '#D1D5DB', text: '#6B7280' };
    } else if (rideDetails?.startRide?.isStarted === true) {
      if (buttonType === 'endRide') {
        return { bg: '#10B981', text: '#FFFFFF' };
      }
      return { bg: Colors.primaryColor, text: '#FFFFFF' };
    } else if (rideDetails?.acceptRide) {
      if (buttonType === 'startRide') {
        return { bg: '#10B981', text: '#FFFFFF' };
      } else if (buttonType === 'cancelRide') {
        return { bg: '#EF4444', text: '#FFFFFF' };
      }
      return { bg: Colors.primaryColor, text: '#FFFFFF' };
    } else {
      if (buttonType === 'cancelRide') {
        return { bg: '#EF4444', text: '#FFFFFF' };
      } else if (buttonType === 'acceptRide' || buttonType === 'rejectRide') {
        return { bg: Colors.primaryColor, text: '#FFFFFF' };
      }
      return { bg: '#D1D5DB', text: '#6B7280' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Payment Information Card */}
      <InfoCard title="💳 PAYMENT DETAILS">
        <View style={styles.paymentRow}>
          <View style={styles.paymentItem}>
            <RegularText fontSize={12} color="#6B7280">
              Status
            </RegularText>
            <View
              style={[
                styles.paymentStatusBadge,
                {
                  backgroundColor: rideDetails?.paid?.isPaid
                    ? '#D1FAE5'
                    : '#FEF3C7',
                },
              ]}
            >
              <SemiBoldText
                fontSize={12}
                color={rideDetails?.paid?.isPaid ? '#065F46' : '#92400E'}
              >
                {rideDetails?.paid?.isPaid ? 'Paid' : 'Unpaid'}
              </SemiBoldText>
            </View>
          </View>

          <View style={styles.paymentItem}>
            <RegularText fontSize={12} color="#6B7280">
              Method
            </RegularText>
            <SemiBoldText fontSize={14} color="#1F2937">
              {rideDetails?.paid?.paymentMethod || 'N/A'}
            </SemiBoldText>
          </View>
        </View>
      </InfoCard>

      {/* Ride Status Card */}
      <InfoCard title="📋 RIDE STATUS">
        <View style={styles.statusGrid}>
          <StatusBadge label="Accepted" value={!!rideDetails?.acceptRide} />
          <StatusBadge
            label="Started"
            value={!!rideDetails?.startRide?.isStarted}
          />
          <StatusBadge label="Ended" value={!!rideDetails?.endRide?.isEnded} />
          <StatusBadge
            label="Cancelled"
            value={!!rideDetails?.cancelRide?.isCancelled}
          />
        </View>
      </InfoCard>

      {/* Created Date Card */}
      {rideDetails?.createdAt && (
        <InfoCard title="🕒 CREATED">
          <RegularText fontSize={14} color="#4B5563" style={styles.dateText}>
            {formatDate(rideDetails?.createdAt)}
          </RegularText>
        </InfoCard>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {!rideDetails?.acceptRide ? (
          <>
            <ActionButton
              label={isButtonDisabled ? 'Processing...' : 'Accept Ride'}
              config={getButtonConfig('acceptRide')}
              onPress={() => handleAction('acceptRide')}
              disabled={isButtonDisabled}
              primary
            />
            <ActionButton
              label={isButtonDisabled ? 'Processing...' : 'Cancel Ride'}
              config={getButtonConfig('cancelRide')}
              onPress={() => handleAction('cancelRide')}
              disabled={isButtonDisabled}
              danger
            />
          </>
        ) : rideDetails?.startRide?.isStarted === false ? (
          <>
            <ActionButton
              label="Send a Message"
              config={getButtonConfig('chat')}
              onPress={() =>
                navigation.navigate('ChatPage', {
                  _id: rideDetails?._id,
                  plateNumber: rideDetails?.rider?.plateNumber,
                  driverName: `${rideDetails?.rider?.lastName} ${rideDetails?.rider?.firstName}`,
                  imageUrl: rideDetails?.rider?.imageUrl,
                  phoneNumber: rideDetails?.rider?.phoneNumber,
                })
              }
              disabled={isButtonDisabled}
              secondary
            />
            <ActionButton
              label="Start Ride"
              config={getButtonConfig('startRide')}
              onPress={() => handleAction('startRide')}
              disabled={isButtonDisabled}
              primary
            />
          </>
        ) : rideDetails?.endRide?.isEnded === false ? (
          <ActionButton
            label="End Ride"
            config={getButtonConfig('endRide')}
            onPress={() => handleAction('endRide')}
            disabled={isButtonDisabled}
            primary
          />
        ) : (
          <ActionButton
            label="Report Ride"
            config={getButtonConfig('reportRide')}
            onPress={() => handleAction('reportRide')}
            disabled={isButtonDisabled}
            secondary
          />
        )}
      </View>
    </View>
  );
};

// ────────────────────────────────────────────────────────────────────
// ACTION BUTTON COMPONENT
// ────────────────────────────────────────────────────────────────────

const ActionButton = ({
  label,
  config,
  onPress,
  disabled,
  primary,
  secondary,
  danger,
}: {
  label: string;
  config: { bg: string; text: string };
  onPress: () => void;
  disabled: boolean;
  primary?: boolean;
  secondary?: boolean;
  danger?: boolean;
}) => (
  <TouchableOpacity
    style={[
      styles.actionButton,
      { backgroundColor: config.bg },
      primary && styles.primaryButton,
      secondary && styles.secondaryButton,
      danger && styles.dangerButton,
      disabled && styles.disabledButton,
    ]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
  >
    <SemiBoldText fontSize={16} style={{ color: config.text }}>
      {label}
    </SemiBoldText>
  </TouchableOpacity>
);

// ────────────────────────────────────────────────────────────────────
// PROFESSIONAL STYLES
// ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Main Container
  container: {
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noDataText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // Info Card
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardTitle: {
    marginBottom: 14,
    letterSpacing: 0.5,
  },

  // Payment Section
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  paymentItem: {
    flex: 1,
  },
  paymentStatusBadge: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },

  // Status Section
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: '47%',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  // Date Section
  dateText: {
    lineHeight: 20,
  },

  // Actions Container
  actionsContainer: {
    marginTop: 8,
    gap: 12,
  },

  // Action Buttons
  actionButton: {
    paddingVertical: 16,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryButton: {
    // Primary styling already handled by config
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: Colors.primaryColor,
  },
  dangerButton: {
    // Danger styling already handled by config
  },
  disabledButton: {
    opacity: 0.6,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.05,
      },
      android: {
        elevation: 1,
      },
    }),
  },
});

export default RideStatusAndActions;
