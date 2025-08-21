import React from 'react';
import {View, Modal, TouchableOpacity, StyleSheet} from 'react-native';
import {Colors} from '../Colors/Colors';
import {SemiBoldText, RegularText} from '../Texts/CustomTexts/BaseTexts';

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  cancelText?: string;
  confirmText?: string;
  cancelButtonBgColor?: string; // Optional background color for the cancel button
  children?: React.ReactNode; // Add children prop
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  visible,
  onClose,
  onConfirm,
  title = 'Confirm you want to Logout',
  message = 'Are you sure you want to logout?',
  cancelText = 'No, Cancel',
  confirmText = 'Logout',
  cancelButtonBgColor = Colors.errorColor, // Default to error color
  children, // Destructure children
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <SemiBoldText
              fontSize={17}
              color={Colors.headerColor}
              style={{textAlign: 'center'}}>
              {title}
            </SemiBoldText>
            <RegularText
              style={{textAlign: 'center'}}
              fontSize={14}
              color={Colors.grayColor}>
              {message}
            </RegularText>
          </View>

          {/* Render children here */}
          {children}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {backgroundColor: cancelButtonBgColor}, // Use the passed background color
              ]}
              onPress={onClose}>
              <RegularText fontSize={14} color={Colors.whiteColor}>
                {cancelText}
              </RegularText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <RegularText fontSize={14} color={Colors.grayColor}>
                {confirmText}
              </RegularText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  modalHeader: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
  },

  cancelButton: {
    flex: 1,
    marginRight: 10,
    padding: 18,
    paddingHorizontal: 24,
    width: '49%',
    borderRadius: 4888,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    marginRight: 10,
    padding: 18,
    paddingHorizontal: 24,
    width: '49%',
    borderRadius: 4888,
    alignItems: 'center',
    backgroundColor: Colors.grayColorFaded,
  },

  modalContent: {
    backgroundColor: Colors.whiteColor,
    padding: 12,
    borderRadius: 10,
    width: '95%',
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 36,
    gap: 8,
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    justifyContent: 'space-between',
  },
});

export default ModalComponent;
