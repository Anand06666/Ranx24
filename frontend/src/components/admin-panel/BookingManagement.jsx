import React, { useState, useMemo, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

import { useNavigate } from 'react-router-dom';

const BookingManagement = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'scheduled', 'completed'

  // Worker Assignment State
  const [workers, setWorkers] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/bookings/admin/all');
      setBookings(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const { data } = await api.get('/workers'); // Adjust if needed
      setWorkers(data.data || []);
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchWorkers();
  }, []);

  const filteredBookings = useMemo(() => {
    if (filter === 'all') return bookings;
    return bookings.filter(b => b.status === filter);
  }, [bookings, filter]);

  const handleAssignWorker = async () => {
    if (!selectedBooking || !selectedWorker) return;

    try {
      setAssigning(true);
      await api.put(`/bookings/${selectedBooking._id}/assign`, { workerId: selectedWorker });
      toast.success("Worker assigned successfully!");
      setSelectedBooking(null);
      setSelectedWorker('');
      fetchBookings();
    } catch (error) {
      console.error("Error assigning worker:", error);
      toast.error(error.response?.data?.message || "Failed to assign worker");
    } finally {
      setAssigning(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'assigned':
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading bookings...</div>;

  return (
    <>
      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-black text-blue-900 mb-2 flex items-center gap-2 tracking-tight">
          <i className="fa-solid fa-tag text-teal-600"></i> Booking Management
        </h2>
        <div className="flex border-b border-gray-200">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-medium cursor-pointer ${filter === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>All</button>
          <button onClick={() => setFilter('pending')} className={`px-4 py-2 text-sm font-medium cursor-pointer ${filter === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Pending</button>
          <button onClick={() => setFilter('assigned')} className={`px-4 py-2 text-sm font-medium cursor-pointer ${filter === 'assigned' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Assigned</button>
          <button onClick={() => setFilter('completed')} className={`px-4 py-2 text-sm font-medium cursor-pointer ${filter === 'completed' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Completed</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-100 slim-scrollbar max-h-[650px]">
        <table className="min-w-full w-full text-[15px] leading-relaxed">
          <thead className="sticky top-0 z-10 bg-blue-50 shadow">
            <tr>
              <th className="px-4 py-3 font-bold text-blue-700 text-left">Booking ID</th>
              <th className="px-4 py-3 font-bold text-blue-700 text-left">User</th>
              <th className="px-4 py-3 font-bold text-blue-700 text-left">Service</th>
              <th className="px-4 py-3 font-bold text-blue-700 text-left">Amount</th>
              <th className="px-4 py-3 font-bold text-blue-700 text-left">Date</th>
              <th className="px-4 py-3 font-bold text-blue-700 text-center">Status</th>
              <th className="px-4 py-3 font-bold text-blue-700 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
              <tr key={booking._id || booking.id} className="border-b border-gray-100 hover:bg-sky-50">
                <td className="px-4 py-3 font-mono text-sm">#{booking._id?.slice(-6) || booking.id}</td>
                <td className="px-4 py-3">
                  {booking.user?.name ||
                    (booking.user?.firstName ? `${booking.user.firstName} ${booking.user.lastName || ''}` : null) ||
                    (typeof booking.user === 'string' ? booking.user : 'Unknown')}
                </td>
                <td className="px-4 py-3">{booking.service}</td>
                <td className="px-4 py-3 font-semibold">₹{(booking.finalPrice || booking.totalPrice || 0).toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">{new Date(booking.bookingDate || booking.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => navigate(`/admin/bookings/${booking._id}/assign`)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition"
                    >
                      Assign Worker
                    </button>
                  )}
                  {booking.status === 'assigned' && (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-500">
                        Worker: {booking.worker?.name ||
                          (booking.worker?.firstName ? `${booking.worker.firstName} ${booking.worker.lastName || ''}` : null) ||
                          (typeof booking.worker === 'string' ? booking.worker : 'Assigned')}
                      </span>
                      <button
                        onClick={() => navigate(`/admin/bookings/${booking._id}/assign`)}
                        className="bg-orange-500 text-white px-3 py-1 rounded text-xs hover:bg-orange-600 transition"
                      >
                        Re-assign
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">No bookings found for this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Worker Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold mb-4">Assign Worker</h3>
            <p className="text-sm text-gray-600 mb-4">Booking: {selectedBooking.service}</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Worker</label>
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">-- Choose Worker --</option>
                {workers.map(worker => (
                  <option key={worker._id} value={worker._id}>
                    {worker.name} ({worker.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setSelectedBooking(null); setSelectedWorker(''); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignWorker}
                disabled={!selectedWorker || assigning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingManagement;
