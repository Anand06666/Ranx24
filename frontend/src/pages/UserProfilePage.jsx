import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEdit, FaCog, FaWallet, FaMapMarkerAlt, FaHistory, FaStar, FaSignOutAlt } from 'react-icons/fa';
import { MdWork } from 'react-icons/md';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';
const SERVER_URL = 'http://localhost:5000';

export default function UserProfilePage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({
        totalBookings: 0,
        completedBookings: 0,
        totalSpent: 0,
        reviewsGiven: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
        fetchStats();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const { data } = await axios.get(`${API_URL}/users/profile`, config);
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            // Fetch bookings to calculate stats
            const bookingsRes = await axios.get(`${API_URL}/bookings/my`, config);
            const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : (bookingsRes.data.data || []);

            const completed = bookings.filter(b => b.status === 'completed').length;
            const totalSpent = bookings
                .filter(b => b.paymentStatus === 'paid')
                .reduce((sum, b) => sum + (b.finalPrice || 0), 0);

            // Fetch reviews
            const reviewsRes = await axios.get(`${API_URL}/reviews/my`, config);

            setStats({
                totalBookings: bookings.length,
                completedBookings: completed,
                totalSpent,
                reviewsGiven: reviewsRes.data.length,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <Skeleton height="200px" className="mb-6" />
                    <Skeleton height="150px" count={2} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Profile Header */}
                <Card className="mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                                {profile?.profileImage ? (
                                    <img
                                        src={`${SERVER_URL}/${profile.profileImage}`}
                                        alt={profile.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FaUser className="text-blue-600 text-4xl" />
                                )}
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                {profile?.name || user?.name}
                            </h1>
                            <p className="text-gray-600 mb-2">{profile?.email || user?.email}</p>
                            <p className="text-gray-600">{profile?.phone || user?.phone}</p>
                        </div>

                        {/* Edit Button */}
                        <Button
                            variant="outline"
                            onClick={() => navigate('/edit-profile')}
                            icon={<FaEdit />}
                        >
                            Edit Profile
                        </Button>
                    </div>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                            {stats.totalBookings}
                        </div>
                        <div className="text-sm text-gray-600">Total Bookings</div>
                    </Card>
                    <Card className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                            {stats.completedBookings}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                    </Card>
                    <Card className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                            ₹{stats.totalSpent.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Spent</div>
                    </Card>
                    <Card className="text-center">
                        <div className="text-3xl font-bold text-yellow-600 mb-1">
                            {stats.reviewsGiven}
                        </div>
                        <div className="text-sm text-gray-600">Reviews Given</div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                            onClick={() => navigate('/my-bookings')}
                            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                        >
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <MdWork className="text-blue-600 text-xl" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">My Bookings</div>
                                <div className="text-sm text-gray-600">View all your bookings</div>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/user-wallet')}
                            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                        >
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <FaWallet className="text-green-600 text-xl" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">Wallet & Coins</div>
                                <div className="text-sm text-gray-600">Manage your wallet</div>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/my-address')}
                            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                        >
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <FaMapMarkerAlt className="text-purple-600 text-xl" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">My Addresses</div>
                                <div className="text-sm text-gray-600">Manage saved addresses</div>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/help')}
                            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                        >
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <FaStar className="text-yellow-600 text-xl" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">Help & Support</div>
                                <div className="text-sm text-gray-600">Get assistance</div>
                            </div>
                        </button>
                    </div>
                </Card>

                {/* Settings & Logout */}
                <Card>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/settings')}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <FaCog className="text-gray-600 text-xl" />
                                <span className="font-semibold text-gray-900">Settings</span>
                            </div>
                            <span className="text-gray-400">→</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        >
                            <div className="flex items-center gap-3">
                                <FaSignOutAlt className="text-xl" />
                                <span className="font-semibold">Logout</span>
                            </div>
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
