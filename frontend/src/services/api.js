import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; // Use env var for production


const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
export { API_URL };

// Razorpay configuration - fetch from backend for security
export const getRazorpayConfig = async () => {
    try {
        const response = await api.get('/payment/config');
        return response.data.razorpayKeyId;
    } catch (error) {
        console.error('Failed to fetch Razorpay config:', error);
        // Fallback to env var (not recommended for production)
        return import.meta.env.VITE_RAZORPAY_KEY_ID;
    }
};
