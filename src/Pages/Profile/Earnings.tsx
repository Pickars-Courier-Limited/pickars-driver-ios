import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  SectionList,
  SafeAreaView,
  RefreshControl,
  Modal,
  StatusBar,
} from 'react-native';
import { Colors } from '../../Components/Colors/Colors';
import {
  BoldText,
  MediumText,
  RegularText,
} from '../../Components/Texts/CustomTexts/BaseTexts';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import {
  fetchEarnings,
  fetchAccountDetails,
  fetchWithdrawals,
} from '../../Redux/User/userSlice';
import { AppDispatch } from '../../Redux/Store';
import IconsContainer from '../../Components/Icons/IconContainer';
import EarningsIcon from '../../Components/Icons/EarningsIcon/EarningsIcon';
import CustomButton from '../../Components/Buttons/CustomButton';
import ArrowRightIcon from '../../Components/Icons/Arrows/ArrowRightIcon';
import ShimmerLoader from '../../Components/Loader/ShimmerLoader';

const Earnings: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [accountDetailsBank, setAccountDetailsBank] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'earnings' | 'withdrawals'>(
    'earnings',
  );
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);

  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [wRes, eRes, aRes]: any = await Promise.all([
        dispatch(fetchWithdrawals()),
        dispatch(fetchEarnings()),
        dispatch(fetchAccountDetails()),
      ]);
      setWithdrawals(wRes.payload?.withdrawals || []);
      setEarnings(eRes.payload?.earnings || []);
      setAccountDetailsBank(aRes.payload?.balance || 0);
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
    }, []),
  );

  const sections = useMemo(() => {
    const data = activeTab === 'earnings' ? earnings : withdrawals;
    const groups = data.reduce((acc: any, item) => {
      const date = new Date(item.createdAt);
      const title = `${date.toLocaleString('default', {
        month: 'long',
      })} ${date.getFullYear()}`;
      if (!acc[title]) acc[title] = [];
      acc[title].push(item);
      return acc;
    }, {});
    return Object.keys(groups).map(title => ({ title, data: groups[title] }));
  }, [activeTab, earnings, withdrawals]);

  const renderItem = ({ item }: { item: any }) => {
    const isEarning = activeTab === 'earnings';
    return (
      <Pressable
        style={styles.transactionItem}
        onPress={() =>
          !isEarning && (setSelectedWithdrawal(item), setModalVisible(true))
        }
      >
        <View
          style={[
            styles.iconBox,
            { backgroundColor: isEarning ? '#E8F5E9' : '#FFEBEE' },
          ]}
        >
          <EarningsIcon
            color={isEarning ? '#2E7D32' : '#C62828'}
            width={20}
            height={20}
          />
        </View>
        <View style={styles.transactionDetails}>
          <MediumText style={styles.transactionTitle}>
            {isEarning ? item.header : `To ${item.bank}`}
          </MediumText>
          <RegularText style={styles.transactionDate}>
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
            })}
            {!isEarning && ` • ${item.status}`}
          </RegularText>
        </View>
        <View style={styles.amountContainer}>
          <BoldText
            style={[
              styles.amountText,
              { color: isEarning ? '#2E7D32' : '#1A1A1A' },
            ]}
          >
            {isEarning ? '+' : '-'} ₦{item.amount.toLocaleString()}
          </BoldText>
          {!isEarning && <ArrowRightIcon width={10} height={10} color="#CCC" />}
        </View>
      </Pressable>
    );
  };

  if (loading && !refreshing) return <ShimmerLoader />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Neo-Bank Header */}
      <View style={styles.header}>
        <View>
          <RegularText style={styles.balanceLabel}>
            Available Balance
          </RegularText>
          <Pressable
            onPress={() => setShowBalance(!showBalance)}
            style={styles.balanceRow}
          >
            <BoldText style={styles.balanceAmount}>
              {showBalance
                ? `₦${accountDetailsBank.toLocaleString()}`
                : '₦ • • • • •'}
            </BoldText>
          </Pressable>
        </View>
        {/* <Pressable
          style={styles.withdrawCircle}
          onPress={() =>
            navigation.navigate('WithdrawPage', {
              balancePassed: accountDetailsBank,
            })
          }
        >
          <BoldText style={styles.withdrawCircleText}>Send</BoldText>
        </Pressable> */}
      </View>

      {/* Segmented Control */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabBg}>
          {(['earnings', 'withdrawals'] as const).map(tab => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabButton,
                activeTab === tab && styles.tabButtonActive,
              ]}
            >
              <MediumText
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab === 'earnings' ? 'Income' : 'Outflow'}
              </MediumText>
            </Pressable>
          ))}
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderSectionHeader={({ section: { title } }) => (
          <RegularText style={styles.sectionTitle}>{title}</RegularText>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
        }
        ListEmptyComponent={
          <RegularText style={styles.emptyText}>
            No transactions this period
          </RegularText>
        }
      />

      {/* Transaction Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.handle} />
            <MediumText style={styles.modalHeader}>
              Transaction Details
            </MediumText>
            <View style={styles.modalMain}>
              <BoldText style={styles.modalAmount}>
                -₦{selectedWithdrawal?.amount?.toLocaleString()}
              </BoldText>
              <RegularText style={{ color: '#666' }}>
                Withdrawal to Bank
              </RegularText>
            </View>
            <View style={styles.divider} />
            <DetailRow
              label="Recipient Bank"
              value={selectedWithdrawal?.bank}
            />
            <DetailRow
              label="Account Number"
              value={selectedWithdrawal?.accountNumber}
            />
            <DetailRow
              label="Status"
              value={selectedWithdrawal?.status}
              isStatus
            />
            <View style={{ marginTop: 30 }}>
              <CustomButton
                title="Done"
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const DetailRow = ({ label, value, isStatus }: any) => (
  <View style={styles.detailRow}>
    <RegularText style={{ color: '#888' }}>{label}</RegularText>
    <MediumText style={{ color: isStatus ? '#2E7D32' : '#1A1A1A' }}>
      {value}
    </MediumText>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  balanceLabel: { color: '#888', fontSize: 13, marginBottom: 4 },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceAmount: { fontSize: 32, letterSpacing: -1 },
  withdrawCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawCircleText: { color: '#FFF', fontSize: 12 },
  tabWrapper: { paddingHorizontal: 20, marginBottom: 20 },
  tabBg: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F7',
    borderRadius: 14,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#FFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  tabText: { color: '#888', fontSize: 14, textTransform: 'capitalize' },
  tabTextActive: { color: '#1A1A1A' },
  sectionTitle: {
    fontSize: 12,
    color: '#BBB',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: { flex: 1, marginLeft: 15 },
  transactionTitle: { fontSize: 15, color: '#1A1A1A' },
  transactionDate: { fontSize: 12, color: '#AAA', marginTop: 2 },
  amountContainer: { alignItems: 'flex-end', flexDirection: 'row', gap: 8 },
  amountText: { fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#EEE',
    alignSelf: 'center',
    borderRadius: 2,
    marginBottom: 20,
  },
  modalHeader: { textAlign: 'center', fontSize: 16, color: '#888' },
  modalMain: { alignItems: 'center', marginVertical: 30 },
  modalAmount: { fontSize: 36, letterSpacing: -1 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#CCC' },
});

export default Earnings;
