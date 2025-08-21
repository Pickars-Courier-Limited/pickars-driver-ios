import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import {Colors} from '../../Components/Colors/Colors';
import {
  BoldText,
  MediumText,
  RegularText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {
  fetchEarnings,
  fetchAccountDetails,
  fetchWithdrawals,
} from '../../Redux/User/userSlice';
import {AppDispatch} from '../../Redux/Store';
import IconsContainer from '../../Components/Icons/IconContainer';
import EarningsIcon from '../../Components/Icons/EarningsIcon/EarningsIcon';
import CustomButton from '../../Components/Buttons/CustomButton';
import ArrowRightIcon from '../../Components/Icons/Arrows/ArrowRightIcon';

// Helper function to group data by month and year
const groupByMonth = (data: any[]) => {
  return data.reduce((acc: any, item) => {
    const date = new Date(item.createdAt);
    const monthYear = `${date.toLocaleString('default', {
      month: 'long',
    })} ${date.getFullYear()}`;
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(item);
    return acc;
  }, {});
};

const Earnings: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [accountDetails, setAccountDetails] = useState<any[]>([]);
  const [accountDetailsBank, setAccountDetailsBank] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAccountDetails, setLoadingAccountDetails] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'earnings' | 'withdrawals'>(
    'earnings',
  );
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);

  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  const handleWithdraw = async () => {
    try {
      setLoadingAccountDetails(true);

      const response: any = await dispatch(fetchAccountDetails());

      if (response.payload.success) {
        const {accountDetails = [], balance} = response.payload;
        setAccountDetails(accountDetails);

        navigation.navigate('WithdrawPage', {
          accountDetails,
          balancePassed: balance,
        });
      } else {
        console.error('Failed to fetch account details');
      }
    } catch (error) {
      console.error('Error during account details fetch:', error);
    } finally {
      setLoadingAccountDetails(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setRefreshing(true);

    try {
      const withdrawalsResponse = await dispatch(fetchWithdrawals());
      setWithdrawals(withdrawalsResponse.payload?.withdrawals || []);

      const earningsResponse = await dispatch(fetchEarnings());
      setEarnings(earningsResponse.payload?.earnings || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();

      dispatch(fetchAccountDetails())
        .then((response: any) => {
          if (response.payload.success) {
            console.log(response.payload);
            setAccountDetails(response.payload.accountDetails || []);
            setAccountDetailsBank(response.payload.balance || []);
          }
        })
        .catch(console.error);
    }, [dispatch]),
  );

  const renderEarningsItem = ({item}: {item: any}) => (
    <View style={styles.logItem}>
      <View style={styles.logTextContainer}>
        <View style={{flexDirection: 'row', gap: 8, alignItems: 'center'}}>
          <IconsContainer
            backgroundColor={Colors.grayColorFaded}
            IconComponent={EarningsIcon}
            iconColor={Colors.grayColor}
            iconWidth={20}
            iconHeight={20}
            padding={20}
          />
          <View>
            <MediumText style={styles.logDescription}>{item.header}</MediumText>
            <RegularText style={styles.logDate}>
              {formatDate(item.createdAt)}
            </RegularText>
          </View>
        </View>
      </View>
      <BoldText style={{color: Colors.headerColor}}>
        +₦{item.amount.toLocaleString()}
      </BoldText>
    </View>
  );

  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    return new Date(date).toLocaleDateString('en-GB', options);
  };

  const renderWithdrawalsItem = ({item}: {item: any}) => (
    <Pressable
      style={styles.logItem}
      onPress={() => {
        setSelectedWithdrawal(item);
        setModalVisible(true);
      }}>
      <View style={styles.logTextContainer}>
        <View style={{flexDirection: 'row', gap: 8, alignItems: 'center'}}>
          <IconsContainer
            backgroundColor={Colors.errorColorFaded}
            IconComponent={EarningsIcon}
            iconColor={Colors.errorColor}
            iconWidth={16}
            iconHeight={16}
            padding={16}
          />
          <View>
            <BoldText
              style={[
                styles.logDescription,
                {fontSize: 14, color: Colors.errorColor},
              ]}>
              - ₦{item.amount.toLocaleString()}
            </BoldText>
            <RegularText style={styles.logDate}>
              {item?.status} || {formatDate(item.createdAt)}
            </RegularText>
          </View>
        </View>
      </View>
      <View style={{flexDirection: 'column', alignItems: 'flex-end', gap: 2}}>
        <IconsContainer
          backgroundColor={Colors.grayColorFaded}
          IconComponent={ArrowRightIcon}
          iconColor={Colors.grayColor}
          iconWidth={12}
          iconHeight={12}
          padding={16}
        />
      </View>
    </Pressable>
  );

  const dataToDisplay = activeTab === 'earnings' ? earnings : withdrawals;
  const groupedData = groupByMonth(dataToDisplay);

  const renderSection = ({item: month}) => (
    <View key={month}>
      <RegularText style={styles.monthHeader}>{month}</RegularText>
      <FlatList
        data={groupedData[month]}
        keyExtractor={item => item._id}
        renderItem={
          activeTab === 'earnings' ? renderEarningsItem : renderWithdrawalsItem
        }
        contentContainerStyle={styles.listContainer}
        // No need for refreshing on inner FlatList if the outer one handles it
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={Object.keys(groupedData)}
        keyExtractor={item => item}
        renderItem={renderSection}
        ListHeaderComponent={
          <Pressable
            onPress={() => setShowBalance(!showBalance)}
            style={styles.balanceContainer}>
            <RegularText color={Colors.grayColor} fontSize={13}>
              {showBalance ? 'Hide Balance' : 'Show Balance'}
            </RegularText>
            <BoldText color={Colors.grayColor} fontSize={32}>
              {showBalance
                ? `₦${accountDetailsBank.toLocaleString()}`
                : '₦******'}
            </BoldText>
          </Pressable>
        }
        ListEmptyComponent={
          loading || refreshing ? (
            <ActivityIndicator
              size="large"
              color={Colors.primaryColor}
              style={styles.loader}
            />
          ) : (
            <RegularText style={styles.emptyText}>No records found</RegularText>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchData}
            tintColor={Colors.primaryColor}
          />
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <BoldText style={styles.modalTitle}>
              {' '}
              -₦{selectedWithdrawal?.amount?.toLocaleString()}
            </BoldText>

            <View style={styles.modalRow}>
              <RegularText style={styles.modalLabel}>Account Name:</RegularText>
              <BoldText style={styles.modalValue}>
                {selectedWithdrawal?.accountName}
              </BoldText>
            </View>

            <View style={styles.modalRow}>
              <RegularText style={styles.modalLabel}>Status:</RegularText>
              <BoldText style={styles.modalValue}>
                {selectedWithdrawal?.status}
              </BoldText>
            </View>

            <View style={styles.modalRow}>
              <RegularText style={styles.modalLabel}>
                Account Number:
              </RegularText>
              <BoldText style={styles.modalValue}>
                {selectedWithdrawal?.accountNumber}
              </BoldText>
            </View>

            <View style={styles.modalRow}>
              <RegularText style={styles.modalLabel}>Bank:</RegularText>
              <BoldText style={styles.modalValue}>
                {selectedWithdrawal?.bank}
              </BoldText>
            </View>

            <View style={styles.modalRow}>
              <RegularText style={styles.modalLabel}>
                Date of Transfer
              </RegularText>
              <BoldText style={styles.modalValue}>
                {formatDate(selectedWithdrawal?.createdAt)}
              </BoldText>
            </View>

            <View style={{marginVertical: 16, marginBottom: 48}}>
              <CustomButton
                title="Close"
                onPress={() => setModalVisible(false)}
                backgroundColors={Colors.errorColor}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loader: {
    marginTop: 20,
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.whiteColorF4,
  },
  balanceContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 8,
    padding: 16,
    paddingTop: 48,
  },
  logItem: {
    flexDirection: 'row',
    backgroundColor: Colors.whiteColor,
    borderRadius: 16,
    marginVertical: 4,
    marginHorizontal: 12,
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  logTextContainer: {
    flex: 1,
  },
  logDate: {
    fontSize: 12,
    color: Colors.grayColor,
  },
  logDescription: {
    fontSize: 18,
    color: Colors.grayColor,
  },
  monthHeader: {
    fontSize: 13,
    color: Colors.textColor,
    marginTop: 8,
    marginLeft: 12,
  },
  listContainer: {
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.grayColor,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 16,
    width: '100%',
    minHeight: 300,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 10,
    marginVertical: 16,
    textAlign: 'right',
    color: Colors.errorColor,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 8,
  },
  modalLabel: {
    flex: 1,
    textAlign: 'left',
    fontSize: 13,
  },
  modalValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
  },
});

export default Earnings;
