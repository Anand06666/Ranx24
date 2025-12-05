export interface Worker {
    _id: string;
    firstName: string;
    lastName: string;
    name?: string;
    mobileNumber: string;
    state: string;
    district: string;
    city: string;
    latitude?: string;
    longitude?: string;
    livePhoto: string;
    aadhaarNumber: string;
    aadhaarCard: string;
    panNumber?: string;
    panCard?: string;
    categories: string[];
    services: string[];
    status: 'pending' | 'approved' | 'rejected';
    workerType: 'premium' | 'standard' | 'basic';
    servicePricing: ServicePricing[];
    assignedCities: string[];
    price: number;
    averageRating: number;
    totalReviews: number;
    profilePic?: string;
}

export interface ServicePricing {
    subCategory: string;
    categoryName: string;
    serviceName: string;
    price: number;
    isActive: boolean;
}

export interface Booking {
    _id: string;
    user: {
        _id: string;
        name: string;
        phone?: string;
        mobileNumber?: string;
    };
    worker: string;
    service: string | {
        category: string;
        subCategory: string;
        name: string;
    };
    scheduledDate: string;
    scheduledTime: string;
    bookingDate: string;
    bookingTime: string;
    address: string | {
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
    status: 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
    totalAmount: number;
    finalPrice: number;
    price: number;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    createdAt: string;
}

export interface AuthContextType {
    worker: Worker | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (mobileNumber: string, otp: string) => Promise<void>;
    logout: () => Promise<void>;
    updateWorker: (worker: Worker) => void;
}

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Dashboard: undefined;
    Profile: undefined;
    BookingDetails: { bookingId: string };
    EditProfile: undefined;
    ChatList: undefined;
    Chat: { bookingId: string; userName: string; userId: string };
    Wallet: undefined;
    EarningsAnalytics: undefined;
    Support: undefined;
    PendingBookings: undefined;
    ActiveBookings: undefined;
    Notifications: undefined;
};

export interface Chat {
    _id: string;
    bookingId: string;
    serviceName: string;
    otherPerson: {
        _id: string;
        name: string;
        profileImage?: string;
    };
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}
