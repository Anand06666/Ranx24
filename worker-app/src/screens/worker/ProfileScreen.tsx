import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    StatusBar,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../services/api';
import { theme } from '../../theme/theme';
import { ImageSkeleton } from '../../components/SkeletonLoader';

const ProfileScreen = ({ navigation }: any) => {
    const { worker, logout } = useAuth();
    const [imageLoading, setImageLoading] = useState(true);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', onPress: logout, style: 'destructive' },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.imageContainer}>
                        {imageLoading && <ImageSkeleton size={110} />}
                        {worker?.livePhoto ? (
                            <Image
                                source={{
                                    uri: `${API_URL.replace('/api', '')}/${worker.livePhoto}`,
                                }}
                                style={[styles.profileImage, imageLoading && { display: 'none' }]}
                                onLoadEnd={() => setImageLoading(false)}
                            />
                        ) : (
                            <View style={styles.profileImagePlaceholder}>
                                <Ionicons name="person" size={48} color={theme.colors.text.tertiary} />
                            </View>
                        )}
                        <View style={styles.editIconContainer}>
                            <Ionicons name="camera" size={14} color="white" />
                        </View>
                    </View>

                    <Text style={styles.name}>
                        {worker?.firstName} {worker?.lastName}
                    </Text>
                    <Text style={styles.phone}>{worker?.mobileNumber}</Text>

                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor:
                                    worker?.status === 'approved' ? '#ECFDF5' : '#FFFBEB',
                            },
                        ]}
                    >
                        <View style={[styles.statusDot, { backgroundColor: worker?.status === 'approved' ? theme.colors.success : theme.colors.warning }]} />
                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color: worker?.status === 'approved' ? theme.colors.success : theme.colors.warning,
                                },
                            ]}
                        >
                            {worker?.status?.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* Performance Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{worker?.averageRating?.toFixed(1) || '0.0'}</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{worker?.totalReviews || '0'}</Text>
                            <Text style={styles.statLabel}>Reviews</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {worker?.workerType?.toUpperCase() || 'STD'}
                            </Text>
                            <Text style={styles.statLabel}>Tier</Text>
                        </View>
                    </View>
                </View>

                {/* Info Sections */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <View style={styles.card}>
                        <InfoRow icon="location-outline" label="City" value={worker?.city || 'N/A'} />
                        <InfoRow
                            icon="map-outline"
                            label="District"
                            value={worker?.district || 'N/A'}
                        />
                        <InfoRow icon="globe-outline" label="State" value={worker?.state || 'N/A'} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Documents</Text>
                    <View style={styles.card}>
                        <InfoRow
                            icon="card-outline"
                            label="Aadhaar Number"
                            value={worker?.aadhaarNumber || 'N/A'}
                        />
                        <InfoRow
                            icon="document-text-outline"
                            label="PAN Number"
                            value={worker?.panNumber || 'Not Provided'}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Services Offered</Text>
                    <View style={styles.card}>
                        {worker?.services && worker.services.length > 0 ? (
                            <View style={styles.servicesGrid}>
                                {worker.services.map((service, index) => (
                                    <View key={index} style={styles.serviceChip}>
                                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                                        <Text style={styles.serviceText}>{service}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.emptyText}>No services added</Text>
                        )}
                    </View>
                </View>

                {/* Action Buttons */}
                <TouchableOpacity style={styles.editButton}>
                    <Ionicons name="create-outline" size={20} color="white" />
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.supportButton}
                    onPress={() => navigation.navigate('Support')}
                >
                    <Ionicons name="help-circle-outline" size={20} color={theme.colors.info} />
                    <Text style={styles.supportButtonText}>Help & Support</Text>
                </TouchableOpacity>

                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                    <Text style={styles.versionSubtext}>Build {Platform.OS === 'android' ? 'Android' : 'iOS'}</Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const InfoRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
    <View style={styles.infoRow}>
        <View style={styles.infoLeft}>
            <View style={styles.iconBox}>
                <Ionicons name={icon} size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.infoLabel}>{label}</Text>
        </View>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.l,
        paddingVertical: theme.spacing.m,
        backgroundColor: theme.colors.background,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    headerTitle: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
    },
    logoutButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#FEF2F2',
    },
    content: {
        flex: 1,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
        marginBottom: theme.spacing.s,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: theme.spacing.m,
        ...theme.shadows.medium,
    },
    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: theme.colors.surface,
    },
    profileImagePlaceholder: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: theme.colors.surface,
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: theme.colors.background,
    },
    name: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    phone: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.m,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.m,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    statsContainer: {
        paddingHorizontal: theme.spacing.m,
        marginBottom: theme.spacing.l,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.small,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: theme.colors.border,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.text.tertiary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        paddingHorizontal: theme.spacing.m,
        marginBottom: theme.spacing.l,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.m,
        marginLeft: theme.spacing.xs,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.small,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.background,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: theme.colors.text.primary,
        fontWeight: '600',
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.s,
    },
    serviceChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.primary + '20',
    },
    serviceText: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.text.tertiary,
        fontSize: 14,
        paddingVertical: theme.spacing.m,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        marginHorizontal: theme.spacing.m,
        paddingVertical: 16,
        borderRadius: theme.borderRadius.l,
        gap: 8,
        marginBottom: theme.spacing.m,
        ...theme.shadows.primary,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
    supportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
        marginHorizontal: theme.spacing.m,
        paddingVertical: 16,
        borderRadius: theme.borderRadius.l,
        gap: 8,
        borderWidth: 1,
        borderColor: theme.colors.info,
        ...theme.shadows.small,
    },
    supportButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.info,
    },
    versionContainer: {
        alignItems: 'center',
        marginTop: theme.spacing.xl,
        paddingTop: theme.spacing.l,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        marginHorizontal: theme.spacing.m,
    },
    versionText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.secondary,
        marginBottom: 4,
    },
    versionSubtext: {
        fontSize: 12,
        color: theme.colors.text.tertiary,
    },
});

export default ProfileScreen;
