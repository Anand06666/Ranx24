import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ScrollView,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const WalletScreen = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const [walletData, setWalletData] = useState({
        balance: 0,
        ycCoins: 0,
    });
    const [coinData, setCoinData] = useState({
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
    });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchWalletData();
        }, [])
    );

    const fetchWalletData = async () => {
        try {
            const [walletRes, coinsRes, transactionsRes] = await Promise.all([
                api.get('/wallet/'),
                api.get('/coins/my-balance'),
                api.get('/wallet/transactions'),
            ]);

            setWalletData({
                balance: walletRes.data.balance || 0,
                ycCoins: walletRes.data.ycCoins || 0,
            });

            setCoinData({
                balance: coinsRes.data.balance || 0,
                totalEarned: coinsRes.data.totalEarned || 0,
                totalSpent: coinsRes.data.totalSpent || 0,
            });

            setTransactions(transactionsRes.data || []);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load wallet data',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'credit':
            case 'transfer_in':
            case 'credit_yc':
                return 'arrow-down-circle';
            case 'debit':
            case 'transfer_out':
            case 'redeem_yc':
                return 'arrow-up-circle';
            default:
                return 'swap-horizontal';
        }
    };

    const getTransactionColor = (type) => {
        switch (type) {
            case 'credit':
            case 'transfer_in':
            case 'credit_yc':
                return '#10B981';
            case 'debit':
            case 'transfer_out':
            case 'redeem_yc':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    const renderTransaction = ({ item }) => (
        <View style={[styles.transactionCard, { backgroundColor: colors.card }]}>
            <View style={styles.transactionLeft}>
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: `${getTransactionColor(item.type)}20` },
                    ]}
                >
                    <Ionicons
                        name={getTransactionIcon(item.type)}
                        size={24}
                        color={getTransactionColor(item.type)}
                    />
                </View>
                <View>
                    <Text style={[styles.transactionDesc, { color: colors.text }]}>
                        {item.note || item.type.replace('_', ' ')}
                    </Text>
                    <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                        {new Date(item.createdAt || item.date || Date.now()).toLocaleDateString()}
                    </Text>
                </View>
            </View>
            <View>
                {item.amount && (
                    <Text
                        style={[
                            styles.transactionAmount,
                            { color: getTransactionColor(item.type) },
                        ]}
                    >
                        {item.type.includes('credit') || item.type.includes('in') ? '+' : '-'}₹
                        {item.amount}
                    </Text>
                )}
                {item.coinAmount && (
                    <Text style={styles.coinAmount}>
                        {item.coinAmount > 0 ? '+' : ''}
                        {item.coinAmount} YC
                    </Text>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Wallet</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            fetchWalletData();
                        }}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Wallet Balance Card */}
                <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
                    <Text style={styles.balanceLabel}>Wallet Balance</Text>
                    <Text style={styles.balanceAmount}>₹{walletData.balance.toFixed(2)}</Text>
                    <View style={styles.balanceActions}>
                        <TouchableOpacity
                            style={styles.balanceButton}
                            onPress={() => Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'This feature is under development' })}
                        >
                            <Ionicons name="add-circle-outline" size={20} color="white" />
                            <Text style={styles.balanceButtonText}>Add Money</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* YCCoins Card */}
                <View style={[styles.coinsCard, { backgroundColor: colors.card }]}>
                    <View style={styles.coinsHeader}>
                        <View>
                            <Text style={[styles.coinsLabel, { color: colors.textSecondary }]}>RanX24 Coins</Text>
                            <Text style={styles.coinsAmount}>{coinData.balance} YC</Text>
                        </View>
                        <View style={[styles.coinIcon, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7' }]}>
                            <Ionicons name="star" size={32} color="#F59E0B" />
                        </View>
                    </View>
                    <View style={styles.coinsStats}>
                        <View style={[styles.coinStat, { backgroundColor: isDark ? '#374151' : '#F9FAFB' }]}>
                            <Text style={[styles.coinStatLabel, { color: colors.textSecondary }]}>Earned</Text>
                            <Text style={[styles.coinStatValue, { color: colors.text }]}>{coinData.totalEarned}</Text>
                        </View>
                        <View style={[styles.coinStat, { backgroundColor: isDark ? '#374151' : '#F9FAFB' }]}>
                            <Text style={[styles.coinStatLabel, { color: colors.textSecondary }]}>Spent</Text>
                            <Text style={[styles.coinStatValue, { color: colors.text }]}>{coinData.totalSpent}</Text>
                        </View>
                    </View>
                    {coinData.balance > 0 && (
                        <TouchableOpacity
                            style={styles.redeemButton}
                            onPress={() => navigation.navigate('Home')}
                        >
                            <Text style={styles.redeemButtonText}>Redeem Coins</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Transactions */}
                <View style={styles.transactionsSection}>
                    <Text style={[styles.transactionsTitle, { color: colors.text }]}>Transaction History</Text>
                    {transactions.length > 0 ? (
                        transactions.map((item, index) => (
                            <View key={index}>{renderTransaction({ item })}</View>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="wallet-outline" size={60} color={colors.textLight} />
                            <Text style={[styles.emptyText, { color: colors.textLight }]}>No transactions yet</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    balanceCard: {
        margin: 16,
        padding: 24,
        borderRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#BFDBFE',
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 24,
    },
    balanceActions: {
        flexDirection: 'row',
        gap: 12,
    },
    balanceButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    withdrawButton: {
        backgroundColor: 'white',
    },
    balanceButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    coinsCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 20,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    coinsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    coinsLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    coinsAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#F59E0B',
    },
    coinIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coinsStats: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    coinStat: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
    },
    coinStatLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    coinStatValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    redeemButton: {
        backgroundColor: '#F59E0B',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    redeemButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    transactionsSection: {
        padding: 16,
    },
    transactionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    transactionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionDesc: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    transactionDate: {
        fontSize: 12,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    coinAmount: {
        fontSize: 12,
        color: '#F59E0B',
        fontWeight: '600',
        textAlign: 'right',
        marginTop: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 48,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
    },
});

export default WalletScreen;
