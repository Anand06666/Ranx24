import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    ScrollView,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api, { API_URL } from '../../services/api';
type: 'error',
    text1: 'Error',
        text2: 'Failed to load workers',
            });
        } finally {
    setLoading(false);
}
    };

const checkWorkerAvailability = async (workerId, date) => {
    try {
        setCheckingAvailability(true);
        const dateString = date.toISOString().split('T')[0];
        const response = await api.get('/availability/check', {
            params: { workerId, date: dateString }
        });

        setWorkerAvailability(prev => ({
            ...prev,
            [workerId]: response.data
        }));
    } catch (error) {
        console.error('Error checking availability:', error);
    } finally {
        setCheckingAvailability(false);
    }
};

const calculatePrice = () => {
    if (!selectedWorker) return 0;
    const basePrice = selectedWorker.price || 500;

    if (bookingType === 'half-day') {
        return Math.round(basePrice * 0.6); // 60% of full day
    } else if (bookingType === 'full-day') {
        return basePrice;
    } else {
        return basePrice * days;
    }
};

const handleAddToCart = async () => {
    const availability = workerAvailability[selectedWorker._id];

    if (availability && !availability.available) {
        Toast.show({
            type: 'error',
            text1: 'Worker Not Available',
            text2: `This worker is booked for ${selectedDate.toLocaleDateString()}`,
        });
        return;
    }

    try {
        await addToCart({
            workerId: selectedWorker._id,
            workerName: `${selectedWorker.firstName} ${selectedWorker.lastName}`,
            service: subCategoryName || categoryName,
            category: categoryName,
            price: calculatePrice(),
            bookingDate: selectedDate.toISOString().split('T')[0],
            bookingTime: '09:00',
            bookingType: bookingType === 'multiple-days' ? 'full-day' : bookingType,
            days: bookingType === 'multiple-days' ? days : 1,
        });

        setShowBookingModal(false);
        setSelectedWorker(null);

        Toast.show({
            type: 'success',
            text1: 'Added to Cart',
            text2: 'Proceed to checkout to complete booking',
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to add to cart',
        });
    }
};

const handleBookNow = () => {
    const availability = workerAvailability[selectedWorker._id];

    if (availability && !availability.available) {
        Toast.show({
            type: 'error',
            text1: 'Worker Not Available',
            text2: `This worker is booked for ${selectedDate.toLocaleDateString()}`,
        });
        return;
    }

    const bookingData = {
        workerId: selectedWorker._id,
        workerName: `${selectedWorker.firstName} ${selectedWorker.lastName}`,
        service: subCategoryName || categoryName,
        category: categoryName,
        price: calculatePrice(),
        bookingDate: selectedDate.toISOString().split('T')[0],
        bookingTime: '09:00',
        bookingType: bookingType === 'multiple-days' ? 'full-day' : bookingType,
        days: bookingType === 'multiple-days' ? days : 1,
        worker: selectedWorker,
    };

    setShowBookingModal(false);
    setSelectedWorker(null);
    navigation.navigate('Checkout', { directBooking: bookingData });
};

const renderWorker = ({ item }) => (
    <TouchableOpacity
        style={styles.workerCard}
        onPress={() => {
            setSelectedWorker(item);
            setShowBookingModal(true);
        }}
        activeOpacity={0.9}
    >
        <Image
            source={{
                uri: item.profileImage
                    ? `${API_URL.replace('/api', '')}/${item.profileImage}`
                    : "https://cdn-icons-png.flaticon.com/512/4333/4333609.png"
            }}
            style={styles.workerImage}
        />
        <View style={styles.workerInfo}>
            <Text style={styles.workerName}>
                {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.workerService}>{subCategoryName || categoryName}</Text>
            <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.rating}>{item.rating || '4.5'}</Text>
                <Text style={styles.reviews}>({item.reviewCount || 0} reviews)</Text>
            </View>
            <Text style={styles.price}>₹{item.price || 500}/day</Text>
        </View>
        <TouchableOpacity
            style={styles.bookButton}
            onPress={() => {
                setSelectedWorker(item);
                setShowBookingModal(true);
            }}
        >
            <Text style={styles.bookButtonText}>Book</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
    </TouchableOpacity>
);

return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>{subCategoryName || categoryName}</Text>
                <Text style={styles.headerSubtitle}>Select a Professional</Text>
            </View>
            <View style={{ width: 40 }} />
        </View>

        <FlatList
            data={workers}
            renderItem={renderWorker}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.workerList}
            ListEmptyComponent={
                loading ? (
                    <View style={styles.emptyContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.emptyText}>Loading professionals...</Text>
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={60} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No professionals found</Text>
                    </View>
                )
            }
        />

        {/* Booking Modal */}
        <Modal
            visible={showBookingModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowBookingModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Book Worker</Text>
                        <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                            <Ionicons name="close" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        {selectedWorker && (
                            <>
                                {/* Worker Info */}
                                <View style={styles.modalWorkerCard}>
                                    <Image
                                        source={{
                                            uri: selectedWorker.profileImage
                                                ? `${API_URL.replace('/api', '')}/${selectedWorker.profileImage}`
                                                : "https://cdn-icons-png.flaticon.com/512/4333/4333609.png"
                                        }}
                                        style={styles.modalWorkerImage}
                                    />
                                    <View style={styles.modalWorkerInfo}>
                                        <Text style={styles.modalWorkerName}>
                                            {selectedWorker.firstName} {selectedWorker.lastName}
                                        </Text>
                                        <Text style={styles.modalService}>
                                            {subCategoryName || categoryName}
                                        </Text>
                                        <View style={styles.modalRating}>
                                            <Ionicons name="star" size={14} color="#F59E0B" />
                                            <Text style={styles.modalRatingText}>
                                                {selectedWorker.rating || '4.5'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Date Selection */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Select Booking Date</Text>
                                    <DatePicker
                                        selectedDate={selectedDate}
                                        onDateChange={setSelectedDate}
                                    />
                                </View>

                                {/* Availability Status */}
                                <View style={styles.section}>
                                    {checkingAvailability ? (
                                        <View style={styles.availabilityCheck}>
                                            <ActivityIndicator size="small" color={COLORS.primary} />
                                            <Text style={styles.checkingText}>Checking availability...</Text>
                                        </View>
                                    ) : (
                                        <AvailabilityBadge
                                            available={workerAvailability[selectedWorker._id]?.available !== false}
                                            nextAvailableDate={workerAvailability[selectedWorker._id]?.nextAvailableDate}
                                        />
                                    )}
                                </View>

                                {/* Booking Duration */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Booking Duration</Text>
                                    <View style={styles.durationContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.durationButton,
                                                bookingType === 'half-day' && styles.durationButtonActive
                                            ]}
                                            onPress={() => {
                                                setBookingType('half-day');
                                                setDays(1);
                                            }}
                                        >
                                            <Ionicons
                                                name="sunny-outline"
                                                size={24}
                                                color={bookingType === 'half-day' ? COLORS.primary : COLORS.textSecondary}
                                            />
                                            <Text style={[
                                                styles.durationText,
                                                bookingType === 'half-day' && styles.durationTextActive
                                            ]}>
                                                Half Day
                                            </Text>
                                            <Text style={styles.durationSubtext}>4 hours</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.durationButton,
                                                bookingType === 'full-day' && styles.durationButtonActive
                                            ]}
                                            onPress={() => {
                                                setBookingType('full-day');
                                                setDays(1);
                                            }}
                                        >
                                            <Ionicons
                                                name="calendar-outline"
                                                size={24}
                                                color={bookingType === 'full-day' ? COLORS.primary : COLORS.textSecondary}
                                            />
                                            <Text style={[
                                                styles.durationText,
                                                bookingType === 'full-day' && styles.durationTextActive
                                            ]}>
                                                Full Day
                                            </Text>
                                            <Text style={styles.durationSubtext}>8 hours</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.durationButton,
                                                bookingType === 'multiple-days' && styles.durationButtonActive
                                            ]}
                                            onPress={() => {
                                                setBookingType('multiple-days');
                                                if (days === 1) setDays(2);
                                            }}
                                        >
                                            <Ionicons
                                                name="calendar-number-outline"
                                                size={24}
                                                color={bookingType === 'multiple-days' ? COLORS.primary : COLORS.textSecondary}
                                            />
                                            <Text style={[
                                                styles.durationText,
                                                bookingType === 'multiple-days' && styles.durationTextActive
                                            ]}>
                                                Multiple
                                            </Text>
                                            <Text style={styles.durationSubtext}>{days} days</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Days Selector for Multiple Days */}
                                {bookingType === 'multiple-days' && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Number of Days</Text>
                                        <View style={styles.daysSelector}>
                                            <TouchableOpacity
                                                style={[styles.daysButton, days <= 2 && styles.daysButtonDisabled]}
                                                onPress={() => setDays(Math.max(2, days - 1))}
                                                disabled={days <= 2}
                                            >
                                                <Ionicons name="remove" size={20} color={days <= 2 ? '#9CA3AF' : COLORS.text} />
                                            </TouchableOpacity>
                                            <View style={styles.daysDisplay}>
                                                <Text style={styles.daysText}>{days}</Text>
                                                <Text style={styles.daysLabel}>Days</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.daysButton}
                                                onPress={() => setDays(days + 1)}
                                            >
                                                <Ionicons name="add" size={20} color={COLORS.text} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}

                                {/* Price Summary */}
                                <View style={styles.summaryCard}>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Service</Text>
                                        <Text style={styles.summaryValue}>
                                            {subCategoryName || categoryName}
                                        </Text>
                                    </View>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Date</Text>
                                        <Text style={styles.summaryValue}>
                                            {selectedDate.toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </Text>
                                    </View>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Duration</Text>
                                        <Text style={styles.summaryValue}>
                                            {bookingType === 'half-day' ? 'Half Day' :
                                                bookingType === 'full-day' ? 'Full Day' :
                                                    `${days} Days`}
                                        </Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.totalLabel}>Total Amount</Text>
                                        <Text style={styles.totalAmount}>
                                            ₹{calculatePrice()}
                                        </Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </ScrollView>

                    {/* Footer Buttons */}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.addToCartButton}
                            onPress={handleAddToCart}
                            disabled={checkingAvailability || workerAvailability[selectedWorker?._id]?.available === false}
                        >
                            <Ionicons name="cart-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                (checkingAvailability || workerAvailability[selectedWorker?._id]?.available === false) && styles.confirmButtonDisabled
                            ]}
                            onPress={handleBookNow}
                            disabled={checkingAvailability || workerAvailability[selectedWorker?._id]?.available === false}
                        >
                            <Text style={styles.confirmButtonText}>Book Now</Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    </SafeAreaView>
);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.m,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    workerList: {
        padding: SPACING.m,
    },
    workerCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        ...SHADOWS.medium,
    },
    workerImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: SPACING.m,
    },
    workerInfo: {
        flex: 1,
    },
    workerName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    workerService: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 6,
    },
    rating: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    reviews: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
    },
    bookButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        alignSelf: 'center',
    },
    bookButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.l,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
    },
    modalScroll: {
        padding: SPACING.l,
    },
    modalWorkerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.l,
        padding: SPACING.m,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
    },
    modalWorkerImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: SPACING.m,
    },
    modalWorkerInfo: {
        flex: 1,
    },
    modalWorkerName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    modalService: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    modalRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    modalRatingText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.text,
    },
    section: {
        marginBottom: SPACING.l,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    availabilityCheck: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: SPACING.m,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
    },
    checkingText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    durationContainer: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between',
    },
    durationButton: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: SPACING.m,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        minHeight: 100,
    },
    durationButtonActive: {
        backgroundColor: '#FEF3C7',
        borderColor: COLORS.primary,
    },
    durationText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: 6,
        textAlign: 'center',
    },
    durationTextActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    durationSubtext: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 2,
    },
    daysSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: SPACING.s,
    },
    daysButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.light,
    },
    daysButtonDisabled: {
        opacity: 0.5,
        backgroundColor: '#F8FAFC',
        shadowOpacity: 0,
    },
    daysDisplay: {
        alignItems: 'center',
    },
    daysText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    daysLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    summaryCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: SPACING.m,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    summaryValue: {
        color: COLORS.text,
        fontWeight: '600',
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: SPACING.s,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.primary,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: SPACING.l,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: COLORS.white,
    },
    addToCartButton: {
        flex: 1,
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    addToCartButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
    },
    confirmButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        ...SHADOWS.medium,
    },
    confirmButtonDisabled: {
        backgroundColor: '#9CA3AF',
        opacity: 0.6,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default BookingScreen;
