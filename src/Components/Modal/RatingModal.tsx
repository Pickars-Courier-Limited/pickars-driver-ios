import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import ModalComponent from './ModalComponent'; // Adjust the path as needed
import { Colors } from '../Colors/Colors';
import { SemiBoldText } from '../Texts/CustomTexts/BaseTexts';
import RatingIcon from '../Icons/RatingIcon/RatingIcon'; // Empty star icon
import RatingIconFull from '../Icons/RatingIcon/RatingIconFull'; // Full star icon

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (rating: number) => void; // Function to handle the confirmed rating
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [rating, setRating] = useState(0); // State to hold the selected rating

  const handleStarPress = (index: number) => {
    setRating(index);
    console.log('Rating selected:', index); // Updated log for clarity
  };

  const handleConfirm = () => {
    onConfirm(rating);
    onClose();
  };

  const handleClose = () => {
    setRating(0); // Reset rating when modal closes
    onClose();
  };

  return (
    <ModalComponent
      visible={visible}
      onClose={handleClose}
      onConfirm={handleConfirm}
      cancelText='Submit Rating'
      title="Rate the Rider"
      message="Please select a rating from 1 to 5 stars."
      confirmText="Cancel">
      <View style={styles.starsContainer}>
        {Array.from({ length: 5 }, (_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleStarPress(index + 1)}
            style={styles.starButton}>
            {index < rating ? <RatingIconFull /> : <RatingIcon />}
          </TouchableOpacity>
        ))}
      </View>
    </ModalComponent>
  );
};

const styles = StyleSheet.create({
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  starButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6, // 12px spacing between stars (6px on each side)
  },
});

export default RatingModal;