import React from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Colors } from '../Colors/Colors';
import { SemiBoldText, RegularText } from '../Texts/CustomTexts/BaseTexts';

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  cancelText?: string;
  confirmText?: string;
  cancelButtonBgColor?: string;
  children?: React.ReactNode;
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  visible,
  onClose,
  onConfirm,
  title = 'Confirm Logout',
  message = 'Are you sure you want to logout of your account?',
  cancelText = 'Discard',
  confirmText = 'Yes, Logout',
  cancelButtonBgColor = '#F3F4F6', // Subtle grey for secondary actions
  children,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Dimmed Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Modal Sheet - Slides from bottom */}
        <View style={styles.sheetContainer}>
          <Pressable style={styles.modalContent}>
            {/* Drag Indicator Handle */}
            <View style={styles.dragHandle} />

            <View style={styles.textContainer}>
              <SemiBoldText fontSize={20} color="#111827">
                {title}
              </SemiBoldText>
              <RegularText
                fontSize={15}
                color="#6B7280"
                style={styles.messageText}
              >
                {message}
              </RegularText>
            </View>

            {children && <View style={styles.childrenWrapper}>{children}</View>}

            <View style={styles.buttonStack}>
              <TouchableOpacity
                style={[styles.confirmButton]}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <SemiBoldText fontSize={15} color={Colors.whiteColor}>
                  {confirmText}
                </SemiBoldText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { backgroundColor: cancelButtonBgColor },
                ]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <SemiBoldText fontSize={15} color="#4B5563">
                  {cancelText}
                </SemiBoldText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end', // Aligns modal to bottom
  },
  sheetContainer: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: Colors.whiteColor,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40, // Extra padding for home indicator on iOS
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  dragHandle: {
    width: 38,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  messageText: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  childrenWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  buttonStack: {
    width: '100%',
    gap: 12, // Modern vertical stack for buttons
  },
  confirmButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#111827', // Use dark for primary action
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
});

export default ModalComponent;
