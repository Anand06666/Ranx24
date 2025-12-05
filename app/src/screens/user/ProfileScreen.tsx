import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SIZES, SPACING, SHADOWS } from '../../constants/theme';
import api from '../../services/api';

const ProfileScreen = ({ navigation }: any) => {
    const { user, logout } = useAuth();
    const { colors, isDark } = useTheme();
    const [wallet, setWallet] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        fetchWallet();
    }, []);

    const fetchWallet = async () => {
        try {
            setLoading(true);
            const response = await api.get('/wallet');
            setWallet(response.data);
        } catch (error) {
            console.log('Error fetching wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { icon: 'person-outline', label: 'Edit Profile', screen: 'EditProfile', color: '#3B82F6' },
        { icon: 'location-outline', label: 'My Addresses', screen: 'MyAddresses', color: '#10B981' },
        { icon: 'calendar-outline', label: 'My Bookings', screen: 'MyBookings', color: '#8B5CF6' },
        { icon: 'notifications-outline', label: 'Notifications', screen: 'Notifications', color: '#F59E0B' },
        { icon: 'help-circle-outline', label: 'Help & Support', screen: 'Help', color: '#6B7280' },
        { icon: 'settings-outline', label: 'Settings', screen: 'Settings', color: '#4B5563' },
    ];

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => await logout()
                }
            ]
        );
    };

    const renderMenuItem = (item: any, index: number) => (
        <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => item.screen ? navigation.navigate(item.screen) : Alert.alert("Coming Soon", "This feature is under development.")}
        >
            <View style={[styles.menuIconBox, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <Text style={[styles.menuItemText, { color: colors.text }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>My Profile</Text>
                    <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.input }]} onPress={() => navigation.navigate('EditProfile')}>
                        <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit</Text>
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <Image
                        source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
                        style={[styles.avatar, { borderColor: colors.card }]}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'User'}</Text>
                        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email || 'user@example.com'}</Text>
                        <Text style={[styles.phone, { color: colors.textSecondary }]}>+91 {user?.phone || '9876543210'}</Text>
                    </View>
                </View>

                {/* Wallet Card */}
                <View style={[styles.walletCard, { backgroundColor: colors.primary }]}>
                    <View style={styles.walletHeader}>
                        <View>
                            <Text style={styles.walletLabel}>Total Balance</Text>
                            <Text style={styles.walletAmount}>₹{wallet?.balance || '0.00'}</Text>
                        </View>
                        <View style={styles.walletIcon}>
                            <Ionicons name="wallet" size={20} color="#FFF" />
                        </View>
                    </View>
                    <View style={styles.walletActions}>
                        <TouchableOpacity style={styles.walletBtn} onPress={() => navigation.navigate('Wallet')}>
                            <Ionicons name="add-circle-outline" size={20} color="#FFF" />
                            <Text style={styles.walletBtnText}>Add Money</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.walletBtn} onPress={() => navigation.navigate('Wallet')}>
                            <Ionicons name="time-outline" size={20} color="#FFF" />
                            <Text style={styles.walletBtnText}>History</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Menu */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>General</Text>
                    <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
                        {menuItems.slice(0, 3).map(renderMenuItem)}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>
                    <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
                        {menuItems.slice(3).map(renderMenuItem)}
                    </View>
                </View>

                <TouchableOpacity style={[styles.logoutButton, { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' }]} onPress={handleLogout}>
                    <Text style={[styles.logoutText, { color: isDark ? '#FCA5A5' : '#EF4444' }]}>Log Out</Text>
                </TouchableOpacity>

                <Text style={[styles.version, { color: colors.textLight }]}>App Version 1.0.0</Text>
                <View style={{ height: 100 }} />
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
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
    },
    headerTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
    },
    editBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    editBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        marginBottom: SPACING.l,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
    },
    profileInfo: {
        marginLeft: SPACING.m,
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        marginBottom: 2,
    },
    phone: {
        fontSize: 14,
    },
    walletCard: {
        marginHorizontal: SPACING.m,
        borderRadius: 20,
        padding: SPACING.l,
        marginBottom: SPACING.l,
        ...SHADOWS.medium,
    },
    walletHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.l,
    },
    walletLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 4,
    },
    walletAmount: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
    walletIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    walletActions: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    walletBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: SPACING.m,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    walletBtnText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    section: {
        paddingHorizontal: SPACING.m,
        marginBottom: SPACING.l,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: SPACING.s,
        marginLeft: SPACING.s,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    menuContainer: {
        borderRadius: 16,
        padding: SPACING.s,
        ...SHADOWS.light,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
    },
    menuIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    logoutButton: {
        marginHorizontal: SPACING.m,
        padding: SPACING.m,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        marginBottom: SPACING.l,
    },
});

export default ProfileScreen;
