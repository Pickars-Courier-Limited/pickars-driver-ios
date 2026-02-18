import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AuthHeaders from '../../Components/Headers/AuthHeaders';
import {
  BoldText,
  MediumText,
  RegularText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import CustomTextInput from '../../Components/TextInputs/CustomTextInputs';
import CustomButton from '../../Components/Buttons/CustomButton';
import { Colors } from '../../Components/Colors/Colors';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../Redux/Store';
import { addWithdrawal } from '../../Redux/User/userSlice';

const WithdrawPage = () => {
  const route = useRoute();
  const { accountDetails = [], balancePassed = 0 } = route.params as any;

  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .required('Enter an amount')
      .positive()
      .max(balancePassed, 'Insufficient balance')
      .min(100, 'Minimum withdrawal is ₦100'),
  });

  const handleWithdrawSubmit = (values: any) => {
    if (!selectedAccount) {
      Alert.alert(
        'Selection Required',
        'Please tap on a bank account to continue.',
      );
      return;
    }
    setModalVisible(true);
  };

  const confirmWithdrawal = (values: any) => {
    setLoading(true);
    const withdrawalData = {
      amount: values.amount,
      bank: selectedAccount?.bank,
      accountName: selectedAccount?.accountName,
      accountNumber: selectedAccount?.accountNumber,
      status: 'pending',
    };

    dispatch(addWithdrawal(withdrawalData))
      .then((response: any) => {
        if (response.payload.success) {
          Alert.alert('Sent!', 'Your withdrawal request is being processed.');
          setModalVisible(false);
          navigation.goBack();
        }
      })
      .catch(() =>
        Alert.alert('Error', 'Transaction failed. Please try again.'),
      )
      .finally(() => setLoading(false));
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthHeaders
        title="Withdraw"
        infoText="Transfer funds to your linked bank account"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Formik
          initialValues={{ amount: '' }}
          validationSchema={validationSchema}
          onSubmit={handleWithdrawSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            touched,
            errors,
          }) => (
            <>
              <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* Balance Card */}
                <View style={styles.balanceCard}>
                  <RegularText style={styles.balanceLabel}>
                    Available for withdrawal
                  </RegularText>
                  <BoldText style={styles.balanceAmount}>
                    ₦{balancePassed.toLocaleString()}
                  </BoldText>
                </View>

                {/* Account Selection Section */}
                <MediumText style={styles.sectionTitle}>
                  Select Destination
                </MediumText>
                <View style={styles.accountGrid}>
                  {accountDetails.map((account: any) => (
                    <TouchableOpacity
                      key={account._id}
                      activeOpacity={0.8}
                      style={[
                        styles.accountItem,
                        selectedAccount?._id === account._id &&
                          styles.selectedAccountItem,
                      ]}
                      onPress={() => setSelectedAccount(account)}
                    >
                      <View
                        style={[
                          styles.radioCircle,
                          selectedAccount?._id === account._id &&
                            styles.radioCircleActive,
                        ]}
                      />
                      <View>
                        <BoldText style={styles.bankName}>
                          {account.bank}
                        </BoldText>
                        <RegularText style={styles.accountNum}>
                          {account.accountNumber}
                        </RegularText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Input Section */}
                <View style={styles.inputWrapper}>
                  <CustomTextInput
                    label="How much do you want to withdraw?"
                    placeholder="₦ 0.00"
                    keyboardType="numeric"
                    onChangeText={handleChange('amount')}
                    onBlur={handleBlur('amount')}
                    value={values.amount}
                    error={touched.amount && errors.amount ? errors.amount : ''}
                  />
                </View>
              </ScrollView>

              {/* Sticky Footer Button */}
              <View style={styles.footer}>
                <CustomButton
                  title="Continue"
                  onPress={handleSubmit}
                  disabled={!selectedAccount || !values.amount}
                />
              </View>

              {/* Confirmation Bottom Sheet */}
              <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                  <View style={styles.modalSheet}>
                    <View style={styles.dragHandle} />
                    <MediumText style={styles.confirmHeader}>
                      Confirm Transaction
                    </MediumText>

                    <View style={styles.confirmValueBox}>
                      <RegularText style={{ color: '#666' }}>
                        You are sending
                      </RegularText>
                      <BoldText style={styles.confirmAmount}>
                        ₦{Number(values.amount).toLocaleString()}
                      </BoldText>
                    </View>

                    <View style={styles.summaryBox}>
                      <SummaryRow label="Bank" value={selectedAccount?.bank} />
                      <SummaryRow
                        label="Account Name"
                        value={selectedAccount?.accountName}
                      />
                      <SummaryRow
                        label="Account Number"
                        value={selectedAccount?.accountNumber}
                      />
                      <SummaryRow
                        label="Fee"
                        value="₦0.00"
                        color={Colors.primaryColor}
                      />
                    </View>

                    <CustomButton
                      title={loading ? 'Processing...' : 'Confirm Withdrawal'}
                      onPress={() => confirmWithdrawal(values)}
                      loading={loading}
                      disabled={loading}
                    />
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      style={styles.cancelBtn}
                    >
                      <MediumText style={{ color: '#999' }}>Cancel</MediumText>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const SummaryRow = ({ label, value, color }: any) => (
  <View style={styles.summaryRow}>
    <RegularText style={{ color: '#888', fontSize: 13 }}>{label}</RegularText>
    <MediumText style={{ color: color || '#111', fontSize: 13 }}>
      {value}
    </MediumText>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContainer: { padding: 20 },
  balanceCard: {
    backgroundColor: '#F8F9FB',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  balanceLabel: { color: '#888', fontSize: 13, marginBottom: 5 },
  balanceAmount: { fontSize: 32, letterSpacing: -1 },
  sectionTitle: { fontSize: 16, marginBottom: 15, color: '#1A1A1A' },
  accountGrid: { marginBottom: 25 },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    marginBottom: 12,
  },
  selectedAccountItem: {
    borderColor: '#111',
    backgroundColor: '#FBFBFB',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    marginRight: 15,
  },
  radioCircleActive: {
    borderColor: '#111',
    borderWidth: 6,
  },
  bankName: { fontSize: 15, color: '#1A1A1A' },
  accountNum: { fontSize: 12, color: '#999' },
  inputWrapper: { marginTop: 10 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#EEE',
    alignSelf: 'center',
    borderRadius: 2,
    marginBottom: 20,
  },
  confirmHeader: { textAlign: 'center', fontSize: 18, marginBottom: 25 },
  confirmValueBox: { alignItems: 'center', marginBottom: 30 },
  confirmAmount: { fontSize: 36, letterSpacing: -1, marginTop: 5 },
  summaryBox: {
    backgroundColor: '#F8F9FB',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cancelBtn: { alignSelf: 'center', marginTop: 20, padding: 10 },
});

export default WithdrawPage;
