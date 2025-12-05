import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
}, [subCategoryId, minPrice, maxPrice, minRating]);

const fetchWorkers = async () => {
    try {
        setLoading(true);
        const params: Record<string, any> = {};
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (minRating) params.minRating = minRating;

        const response = await api.get(`/workers/subcategory/${subCategoryId}`, { params });
        setWorkers(response.data);
    } catch (error) {
        console.error('Error fetching workers:', error);
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load professionals',
        });
    } finally {
        setLoading(false);
    }
};

const handleAddToCart = async () => {
    try {
        await addToCart({
            workerId: selectedWorker._id,
            workerName: `${selectedWorker.firstName} ${selectedWorker.lastName}`,
            service: subCategoryName,
            category: categoryName,
            price: selectedWorker.price || 500,
            bookingType: bookingType as "full-day" | "half-day",
            days,
        });
        setShowBookingModal(false);
        setSelectedWorker(null);
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
};

const renderWorker = ({ item }) => (
    <TouchableOpacity
        style={styles.workerCard}
        onPress={() => {
            setSelectedWorker(item);
            setShowBookingModal(true);
        }}
    >
        <View style={styles.workerHeader}>
            <View style={styles.workerImage}>
                <Ionicons name="person-circle-outline" size={60} color="#9CA3AF" />
            </View>
            <View style={styles.workerInfo}>
                <Text style={styles.workerName}>{item.firstName} {item.lastName}</Text>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color={COLORS.primary} />
                    <Text style={styles.rating}>{item.averageRating || '4.5'}</Text>
                    <Text style={styles.reviews}>({item.totalReviews || 0})</Text>
                </View>
            </View>
        </View>

        <View style={styles.workerFooter}>
            <Text style={styles.price}>₹{item.price || 500}/day</Text>
            <TouchableOpacity
                style={styles.bookButton}
                onPress={() => {
                    setSelectedWorker(item);
                    setShowBookingModal(true);
                }}
            >
                <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
        </View>
    </TouchableOpacity>
);

return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>{subCategoryName}</Text>
                <Text style={styles.headerSubtitle}>{categoryName}</Text>
            </View>
            <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilters(!showFilters)}
            >
                <Ionicons name="options" size={24} color="#111827" />
            </TouchableOpacity>
        </View>

        {showFilters && (
            <View style={styles.filtersContainer}>
                <View style={styles.filterRow}>
                    <TextInput
                        style={styles.filterInput}
                        placeholder="Min Price"
                        keyboardType="numeric"
                        value={minPrice}
                        onChangeText={setMinPrice}
                    />
                    <TextInput
                        style={styles.filterInput}
                        placeholder="Max Price"
                        keyboardType="numeric"
                        value={maxPrice}
                        onChangeText={setMaxPrice}
                    />
                </View>
            </View>
        )}

        <FlatList
            data={workers}
            renderItem={renderWorker}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.workerList}
            ListEmptyComponent={
                loading ? (
                    <Text style={styles.emptyText}>Loading professionals...</Text>
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
                        <Text style={styles.modalTitle}>Book Service</Text>
                        <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                            <Ionicons name="close" size={24} color="#111827" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView>
                        {selectedWorker && (
                            <>
                                <View style={styles.workerDetails}>
                                    <View style={styles.modalWorkerImage}>
                                        <Ionicons name="person-circle-outline" size={80} color="#9CA3AF" />
                                    </View>
                                    <Text style={styles.modalWorkerName}>
                                        {selectedWorker.firstName} {selectedWorker.lastName}
                                    </Text>
                                    <Text style={styles.modalService}>{subCategoryName}</Text>
                                </View>

                                <View style={styles.daysContainer}>
                                    <Text style={styles.sectionTitle}>Number of Days</Text>
                                    <View style={styles.daysSelector}>
                                        <TouchableOpacity
                                            style={styles.daysButton}
                                            onPress={() => setDays(Math.max(1, days - 1))}
                                        >
                                            <Ionicons name="remove" size={20} color={COLORS.secondary} />
                                        </TouchableOpacity>
                                        <Text style={styles.daysText}>{days}</Text>
                                        <TouchableOpacity
                                            style={styles.daysButton}
                                            onPress={() => setDays(days + 1)}
                                        >
                                            <Ionicons name="add" size={20} color={COLORS.secondary} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.priceContainer}>
                                    <Text style={styles.totalLabel}>Total Amount:</Text>
                                    <Text style={styles.totalAmount}>
                                        ₹{(selectedWorker.price || 500) * days}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.addToCartButton}
                                    onPress={handleAddToCart}
                                >
                                    <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    </SafeAreaView>
);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: SPACING.s,
    },
    headerTitleContainer: {
        flex: 1,
        marginHorizontal: SPACING.s + 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textLight,
    },
    filterButton: {
        padding: SPACING.s,
    },
    filtersContainer: {
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    filterRow: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    filterInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        padding: SPACING.m,
        fontSize: 14,
        color: COLORS.text,
        backgroundColor: COLORS.inputBackground,
    },
    workerList: {
        padding: SPACING.m,
    },
    workerCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    workerHeader: {
        flexDirection: 'row',
        marginBottom: SPACING.m,
    },
    workerImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    workerInfo: {
        flex: 1,
        marginLeft: SPACING.m,
    },
    workerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginLeft: 4,
    },
    reviews: {
        fontSize: 12,
        color: COLORS.textLight,
        marginLeft: 4,
    },
    workerFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.m,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    bookButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.s + 2,
        borderRadius: 8,
        ...SHADOWS.small,
    },
    bookButtonText: {
        color: COLORS.secondary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: SPACING.xxl,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textLight,
        fontSize: 16,
        marginTop: SPACING.m,
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
        maxHeight: '80%',
        ...SHADOWS.large,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.l,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    workerDetails: {
        alignItems: 'center',
        padding: SPACING.l,
    },
    modalWorkerImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: SPACING.m,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    modalWorkerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    modalService: {
        fontSize: 16,
        color: COLORS.textLight,
    },
    daysContainer: {
        padding: SPACING.l,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    daysSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.l,
    },
    daysButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    daysText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        minWidth: 40,
        textAlign: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.l,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    totalLabel: {
        fontSize: 16,
        color: COLORS.textLight,
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    addToCartButton: {
        backgroundColor: COLORS.primary,
        margin: SPACING.l,
        padding: SPACING.m,
        borderRadius: 12,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    addToCartButtonText: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default BookingScreen;

