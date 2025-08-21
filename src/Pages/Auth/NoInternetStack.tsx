import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  ActivityIndicator,
  StatusBar,
  Modal,
  Dimensions,
} from 'react-native';
import {Colors} from '../../Components/Colors/Colors';
import {
  BoldText,
  RegularText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import CustomButton from '../../Components/Buttons/CustomButton';
import {useInternet} from '../../Context/InternetContext';

const {width, height} = Dimensions.get('window');

const NoInternetPage = () => {
  const [modalVisible, setModalVisible] = useState(true);
  const {refreshInternetStatus} = useInternet();

  const handleRetry = async () => {
    console.log('handleRetryhandleRetry')
    await refreshInternetStatus();
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={Colors.primaryColor}
        barStyle="light-content"
      />

    
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          console.log('Modal cannot be closed by back button.');
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <BoldText style={styles.modalTitle}>
              Poor Internet Connection
            </BoldText>
            <RegularText style={styles.modalDescription}>
              It looks like your device is not connected to the internet. Please
              check your Wi-Fi or mobile data settings to continue using the
              app.
            </RegularText>
            <ActivityIndicator
              size="large"
              color={Colors.primaryColor}
              style={styles.loader}
            />
            <CustomButton
              onPress={handleRetry}
              title="Retry Connection"
              backgroundColor={Colors.primaryColor}
              textColor="#fff"
              style={styles.retryButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default NoInternetPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.whiteColor,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  mainPageText: {
    fontSize: 18,
    color: Colors.primaryColor,
    marginTop: 20,
  },
  logo: {
    width: 48,
    height: 48,
    marginBottom: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    margin: 16,
    backgroundColor: Colors.whiteColor,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: width * 0.92,
    maxHeight: height * 0.7,
    paddingVertical: 28,
  },
  modalTitle: {
    fontSize: 20,
    color: Colors.primaryColor,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 15,
    color: Colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  loader: {
    marginTop: 10,
  },
  retryButton: {
    marginTop: 20,
    width: '100%',
  },
});