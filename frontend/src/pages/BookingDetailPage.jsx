import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaRupeeSign, FaUser, FaToolbox, FaInfoCircle, FaStar, FaCommentAlt, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { MessageCircle } from 'lucide-react';
import ReviewModal from '../components/ReviewModal';
import ReviewCard from '../components/ReviewCard';
import Navbar from '../components/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view booking details.');
        navigate('/login');
        return;
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(`${API_URL}/bookings/${id}`, config);
      setBooking(data);
      setError(null);

      if (data.status === 'completed') {
        fetchUserReview();
      }
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError(err.response?.data?.message || 'Failed to load booking details.');
      toast.error(err.response?.data?.message || 'Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReview = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(`${API_URL}/reviews/my`, config);
      const review = data.find((r) => r.booking._id === id);
      setUserReview(review || null);
    } catch (err) {
      console.error('Error fetching user review:', err);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.put(`${API_URL}/bookings/${id}/cancel`, {}, config);
      toast.success('Booking cancelled successfully!');
      fetchBookingDetails(); // Refresh details
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.put(`${API_URL}/bookings/${id}/verify-payment`, {}, config);

      if (data.status === 'paid') {
        toast.success('Payment verified successfully!');
        setBooking(data.booking);
      } else {
        toast('Payment not yet completed.', { icon: 'ℹ️' });
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      toast.error('Failed to verify payment status.');
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'in-progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const getPaymentBadgeVariant = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-[Poppins]">
        <Navbar />
        <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
          <Skeleton height="200px" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton height="150px" />
            <Skeleton height="150px" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 font-[Poppins]">
        <Navbar />
        <div className="max-w-3xl mx-auto py-10 px-4">
          <EmptyState
            title="Error Loading Booking"
            description={error}
            icon={<FaExclamationCircle size={48} className="text-red-400" />}
            action={<Button onClick={() => navigate('/my-bookings')}>Back to Bookings</Button>}
          />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 font-[Poppins]">
        <Navbar />
        <div className="max-w-3xl mx-auto py-10 px-4">
          <EmptyState
            title="Booking Not Found"
            description="We couldn't find the booking details you requested."
            action={<Button onClick={() => navigate('/my-bookings')}>Back to Bookings</Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-[Poppins]">
      <Navbar />
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Service Info */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Service Information</h2>
            <div className="space-y-3">
              <p className="flex items-center gap-3 text-gray-700">
                <FaToolbox className="text-blue-500" />
                <span>Service: <span className="font-semibold">{booking.service}</span></span>
              </p>
              <p className="flex items-center gap-3 text-gray-700">
                <FaInfoCircle className="text-blue-500" />
                <span>Category: <span className="font-semibold">{booking.category}</span></span>
              </p>
              {booking.description && (
                <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-3 rounded-lg">
                  {booking.description}
                </p>
              )}
            </div>
          </Card>

          {/* Booking Status & Payment */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Status & Payment</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <Badge variant={getStatusBadgeVariant(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment</span>
                <Badge variant={getPaymentBadgeVariant(booking.paymentStatus)}>
                  {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                </Badge>
              </div>

              <div className="pt-2 border-t border-gray-100 mt-2">
                <p className="flex items-center gap-3 text-gray-700">
                  <FaRupeeSign className="text-green-600" />
                  <span>Total Price: <span className="font-bold text-xl">₹{booking.price.toLocaleString()}</span></span>
                </p>
              </div>

              {booking.status === 'completed' && booking.paymentStatus === 'pending' && booking.paymentLink && (
                <div className="flex flex-col gap-2 mt-4">
                  <Button
                    fullWidth
                    variant="success"
                    onClick={() => window.open(booking.paymentLink, '_blank')}
                  >
                    Pay Now
                  </Button>
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={checkPaymentStatus}
                  >
                    Check Payment Status
                  </Button>
                </div>
              )}

              {booking.status === 'pending' && (
                <div className="mt-4">
                  <Button
                    fullWidth
                    variant="danger"
                    onClick={handleCancelBooking}
                  >
                    Cancel Booking
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Date & Location */}
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Date & Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="flex items-center gap-3 text-gray-700">
                <FaCalendarAlt className="text-blue-500" />
                <span>Date: <span className="font-semibold">{new Date(booking.bookingDate).toLocaleDateString()}</span></span>
              </p>
              <p className="flex items-center gap-3 text-gray-700">
                <FaClock className="text-blue-500" />
                <span>Time: <span className="font-semibold">{booking.bookingTime}</span></span>
              </p>
            </div>
            <div>
              <p className="flex items-start gap-3 text-gray-700">
                <FaMapMarkerAlt className="text-red-500 mt-1" />
                <span>
                  <span className="font-semibold block mb-1">Service Address:</span>
                  {booking.address.street}, {booking.address.city}, {booking.address.state} - {booking.address.zipCode}
                </span>
              </p>
            </div>
          </div>
        </Card>

        {/* Worker Info */}
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Worker Details</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <FaUser size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {booking.worker?.firstName} {booking.worker?.lastName}
              </h3>
              <p className="text-gray-500">{booking.worker?.mobileNumber}</p>
            </div>
            <div className="ml-auto">
              <Button
                size="sm"
                variant="warning"
                onClick={() => navigate(`/chat/${booking._id}`)}
                icon={<MessageCircle size={16} />}
              >
                Chat
              </Button>
            </div>
          </div>
        </Card>

        {/* Review Section */}
        {booking.status === 'completed' && (
          <Card className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Your Review</h2>
            {userReview ? (
              <ReviewCard
                userName="You"
                rating={userReview.rating}
                comment={userReview.comment}
                date={userReview.createdAt}
              />
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <FaStar className="text-yellow-400 text-4xl mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Rate your experience</h3>
                <p className="text-gray-500 mb-4 text-sm">How was the service provided by {booking.worker?.firstName}?</p>
                <Button
                  onClick={() => setShowReviewModal(true)}
                  icon={<FaStar />}
                >
                  Write Review
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Review Modal */}
      {booking && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          bookingId={booking._id}
          workerId={booking.worker?._id}
          workerName={`${booking.worker?.firstName} ${booking.worker?.lastName}`}
          onSubmitSuccess={() => {
            fetchUserReview();
          }}
        />
      )}
    </div>
  );
}
