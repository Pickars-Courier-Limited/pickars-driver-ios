import React, {useState} from 'react';
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import AuthHeaders from '../../Components/Headers/AuthHeaders';
import {
  BoldText,
  RegularText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import CustomTextInput from '../../Components/TextInputs/CustomTextInputs';
import CustomButton from '../../Components/Buttons/CustomButton';
import {Colors} from '../../Components/Colors/Colors';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../Redux/store';
import {addWithdrawal} from '../../Redux/User/userSlice';

const WithdrawPage = () => {
  const route = useRoute();
  const {accountDetails, balancePassed} = route.params;

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [balance, setBalance] = useState(balancePassed);
  const [loading, setLoading] = useState(false); // Added loading state
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive')
      .min(1, 'Amount must be at least 1'),
  });

  const handleWithdrawSubmit = values => {
    if (!selectedAccount) {
      Alert.alert('Error', 'Please select an account');
      return;
    }
    if (values.amount > balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }
    setFormValues(values);
    setModalVisible(true); // Show confirmation modal
  };

  const confirmWithdrawal = () => {
    if (!selectedAccount) {
      Alert.alert('Error', 'Please select an account');
      return;
    }
    if (formValues.amount > balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    // Set loading state to true when confirming
    setLoading(true);

    // Prepare data to be dispatched
    const withdrawalData = {
      amount: formValues.amount,
      bank: selectedAccount?.bank,
      accountName: selectedAccount?.accountName,
      accountNumber: selectedAccount?.accountNumber,
      status: 'pending', // Set status as 'pending'
    };

    // Dispatch action to add withdrawal with the data
    dispatch(addWithdrawal(withdrawalData))
      .then(response => {
        if (response.payload.success) {
          console.log('Withdrawal Response:', response);
          Alert.alert('Success', 'Withdrawal successfully submitted');
          setModalVisible(false); // Close modal after success
          setLoading(false); // Set loading state to false after success
          navigation.goBack();
        } else {
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Withdrawal Error:', error);
        Alert.alert('Error', 'Failed to submit withdrawal');
        setLoading(false); // Set loading state to false after error
      });
  };

  return (
    <View style={styles.container}>
      <AuthHeaders
        title=""
        infoText="Choose an amount and an account for withdrawal"
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <RegularText style={styles.balanceText}>
          Available Balance: ₦{balance.toLocaleString('en-NG')}
        </RegularText>
        <Formik
          initialValues={{amount: ''}}
          validationSchema={validationSchema}
          onSubmit={handleWithdrawSubmit}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            touched,
            errors,
          }) => (
            <>
              <RegularText style={styles.title}>Withdrawal Page</RegularText>

              {/* Account Selection */}
              <RegularText style={styles.subtitle}>
                Choose an Account
              </RegularText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.accountScroll}>
                {accountDetails.map(account => (
                  <TouchableOpacity
                    key={account._id}
                    style={[
                      styles.accountButton,
                      selectedAccount && selectedAccount._id === account._id
                        ? styles.selectedAccount
                        : {},
                    ]}
                    onPress={() => setSelectedAccount(account)}>
                    <RegularText
                      style={[
                        styles.accountText,
                        selectedAccount && selectedAccount._id === account._id
                          ? styles.selectedText
                          : {},
                      ]}>
                      {account.bank}
                    </RegularText>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Display Selected Account Details */}
              {selectedAccount && (
                <View style={styles.accountDetails}>
                  <BoldText style={styles.detailsTitle}>
                    Withdrawing money to:
                  </BoldText>
                  <RegularText style={styles.detail}>
                    Bank Name: {selectedAccount.bank}
                  </RegularText>
                  <RegularText style={styles.detail}>
                    Account Name: {selectedAccount.accountName}
                  </RegularText>
                  <RegularText style={styles.detail}>
                    Account Number: {selectedAccount.accountNumber}
                  </RegularText>
                </View>
              )}

              <CustomTextInput
                label="Amount"
                placeholder="Enter Amount"
                onChangeText={handleChange('amount')}
                onBlur={handleBlur('amount')}
                value={values.amount}
                error={
                  touched.amount && errors.amount
                    ? errors.amount
                    : values.amount > balance
                    ? 'Amount exceeds balance'
                    : ''
                }
              />

              {/* Submit Button */}
              <CustomButton
                title="Submit Withdrawal"
                onPress={handleSubmit}
                disabled={
                  !selectedAccount || !values.amount || values.amount > balance
                }
              />
            </>
          )}
        </Formik>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <RegularText style={styles.modalTitle}>
              Confirm Withdrawal
            </RegularText>
            <BoldText style={styles.modalAmount}>
              ₦{Number(formValues.amount).toLocaleString('en-NG')}
            </BoldText>
            <RegularText>Bank: {selectedAccount?.bank || ''}</RegularText>
            <RegularText>
              Account Name: {selectedAccount?.accountName || ''}
            </RegularText>
            <RegularText>
              Account Number: {selectedAccount?.accountNumber || ''}
            </RegularText>
            <CustomButton
              title="Confirm"
              onPress={confirmWithdrawal}
              loading={loading} // Pass loading state
              disabled={loading} // Disable button while loading
              marginTop={20}
            />
            <CustomButton
              title="Cancel"
              onPress={() => setModalVisible(false)}
              backgroundColors={Colors.primaryColorFaded}
              marginTop={10}
              textColor={Colors.primaryColor}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WithdrawPage;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.whiteColor},
  scrollContainer: {padding: 20},
  title: {fontSize: 20, marginBottom: 10},
  subtitle: {fontSize: 14, marginBottom: 10},
  balanceText: {fontSize: 16, marginBottom: 20},
  accountScroll: {paddingVertical: 10},
  accountButton: {
    padding: 10,
    backgroundColor: Colors.grayColorFaded,
    marginRight: 10,
    borderRadius: 5,
  },
  selectedAccount: {backgroundColor: Colors.primaryColor},
  accountText: {fontSize: 14, color: Colors.grayColor},
  selectedText: {color: Colors.whiteColor},
  accountDetails: {
    marginVertical: 32,
    backgroundColor: Colors.greenColorFaded,
    padding: 12,
    borderRadius: 12,
  },
  detailsTitle: {fontSize: 14, marginBottom: 7},
  detail: {fontSize: 14},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 16,
    width: '90%',
    borderRadius: 8,
  },
  modalTitle: {fontSize: 20, marginBottom: 10},
  modalAmount: {fontSize: 24, marginVertical: 20},
});
