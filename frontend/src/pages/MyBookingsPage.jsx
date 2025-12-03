import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';

const API_URL = 'http://localhost:5000/api';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in');
        navigate('/login');
        return;
      }

      const { data } = await axios.get(`${API_URL}/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewModal = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
    setRating(5);
    setComment('');
  };

  const handleOpenChat = (booking) => {
    setSelectedBooking(booking);
    setShowChatModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      return toast.error('Please write a comment');
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/reviews`,
        {
          worker: selectedBooking.worker._id,
          booking: selectedBooking._id,
          rating,
          comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
      fetchBookings();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">My Bookings</h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No bookings yet</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Book a Service
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{booking.service}</h3>
                    <p className="text-gray-600">{booking.category}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Worker: {booking.worker?.firstName} {booking.worker?.lastName}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-semibold">Date:</span> {new Date(booking.bookingDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-semibold">Time:</span> {booking.bookingTime}
                  </div>
                  <div>
                    <span className="font-semibold">Price:</span> ₹{booking.price}
                  </div>
                  <div>
                    <span className="font-semibold">Payment:</span> {booking.paymentStatus}
                  </div>
                </div>

                {booking.status === 'completed' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenReviewModal(booking)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600"
                    >
                      ⭐ Write Review
                    </button>
                    <button
                      onClick={() => handleOpenChat(booking)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600"
                    >
                      💬 Chat
                    </button>
                  </div>
                )}
                {booking.status === 'accepted' && (
                  <button
                    onClick={() => handleOpenChat(booking)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600"
                  >
                    💬 Chat with Worker
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Write Review</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-500 hover:text-red-600 text-2xl"
                >
                  &times;
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                For: {selectedBooking.worker?.firstName} {selectedBooking.worker?.lastName}
              </p>

              <form onSubmit={handleSubmitReview}>
                {/* Rating */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-3xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Your Review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 h-32"
                    placeholder="Share your experience..."
                    required
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{comment.length}/500</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Chat Window */}
        <ChatWindow
          bookingId={selectedBooking?._id}
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          userRole="user"
        />
      </div>
    </div>
  );
}