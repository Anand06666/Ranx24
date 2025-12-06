import Admin from '../model/Admin.js';

import User from '../model/User.js';
import Worker from '../model/Worker.js';
import Booking from '../model/Booking.js';
import Review from '../model/Review.js';
import Wallet from '../model/userWallet.js';
import WorkerWallet from '../model/WorkerWallet.js';
import WithdrawalRequest from '../model/WithdrawalRequest.js';
import jwt from 'jsonwebtoken';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Counts
    const userCount = await User.countDocuments();
    const workerCount = await Worker.countDocuments();
    const pendingWorkers = await Worker.countDocuments({ status: 'pending' });
    const verifiedWorkers = await Worker.countDocuments({ status: 'approved' });
    const bookingCount = await Booking.countDocuments();

    // 2. Booking Stats
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const bookingsToday = await Booking.countDocuments({ createdAt: { $gte: startOfDay } });
    const bookingsMonth = await Booking.countDocuments({ createdAt: { $gte: startOfMonth } });

    // 3. Earnings (Platform Fee from completed bookings)
    const earningsAgg = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } }
    ]);
    const earnings = earningsAgg.length > 0 ? earningsAgg[0].total : 0;

    // 4. Wallet Stats
    // Total In: Sum of amountPaid from paid bookings
    const totalInAgg = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    const totalIn = totalInAgg.length > 0 ? totalInAgg[0].total : 0;

    // Total Out: Sum of payouts from Wallets
    const totalOutAgg = await Wallet.aggregate([
      { $unwind: '$transactions' },
      { $match: { 'transactions.type': 'payout' } },
      { $group: { _id: null, total: { $sum: { $abs: '$transactions.amount' } } } }
    ]);
    const totalOut = totalOutAgg.length > 0 ? totalOutAgg[0].total : 0;

    const availableWallet = (await Wallet.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]))[0]?.total || 0;

    // 5. Review Stats
    const reviewStats = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);
    const avgRating = reviewStats.length > 0 ? reviewStats[0].avgRating.toFixed(1) : 0;
    const totalReviews = reviewStats.length > 0 ? reviewStats[0].count : 0;

    // Reviews this week
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const reviewsWeek = await Review.countDocuments({ createdAt: { $gte: startOfWeek } });

    res.json({
      users: userCount,
      workers: workerCount,
      workersPending: pendingWorkers,
      verifiedWorkers: verifiedWorkers,
      bookings: bookingCount,
      earnings,
      // New stats
      activeServices: 0, // Frontend calculates this from categories
      availableCities: 0, // Frontend calculates this from cities
      completedBookings,
      bookingsToday,
      bookingsMonth,
      wallet: {
        totalIn,
        totalOut,
        available: availableWallet
      },
      reviews: {
        average: avgRating,
        total: totalReviews,
        week: reviewsWeek
      }
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const adminRegister = async (req, res) => {
  const { mobileNumber, password } = req.body;

  try {
    // Check if admin with mobile number already exists
    let admin = await Admin.findOne({ mobileNumber });
    if (admin) {
      return res.status(400).json({ message: 'Admin with this mobile number already exists' });
    }

    // Create new admin
    admin = new Admin({
      mobileNumber,
      password, // NOTE: In a real application, hash the password before saving
    });

    await admin.save();

    // Generate Token
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Admin registered successfully',
      adminId: admin._id,
      token,
      user: {
        _id: admin._id,
        mobileNumber: admin.mobileNumber,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createUser = async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    const user = new User({
      name,
      email,
      phone,
    });

    const createdUser = await user.save();
    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (user) {
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const adminLogin = async (req, res) => {
  let { mobileNumber, password } = req.body;
  if (typeof mobileNumber === 'string') mobileNumber = mobileNumber.trim();
  if (typeof password === 'string') password = password.trim();

  try {
    // Find admin by mobile number
    const admin = await Admin.findOne({ mobileNumber });
    console.log('Admin Login Attempt:', { mobileNumber, password });

    // Check if admin exists
    if (!admin) {
      console.log('Admin not found in DB');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords (NOTE: In a real application, use bcrypt for password hashing and comparison)
    if (admin.password !== password) {
      console.log('Password mismatch. DB:', admin.password, 'Input:', password);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate Token
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // If credentials are valid
    res.status(200).json({
      message: 'Admin login successful',
      adminId: admin._id,
      token,
      user: {
        _id: admin._id,
        mobileNumber: admin.mobileNumber,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all withdrawal requests
// @route   GET /api/admin/withdrawals
// @access  Private (Admin)
export const getWithdrawalRequests = async (req, res) => {
  try {
    const requests = await WithdrawalRequest.find({})
      .populate('worker', 'firstName lastName mobileNumber bankDetails')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve withdrawal request
// @route   PUT /api/admin/withdrawals/:id/approve
// @access  Private (Admin)
export const approveWithdrawal = async (req, res) => {
  try {
    const request = await WithdrawalRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.status = 'approved';
    request.processedAt = Date.now();
    await request.save();

    res.json({ message: 'Withdrawal approved', request });
  } catch (error) {
    console.error('Error approving withdrawal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject withdrawal request
// @route   PUT /api/admin/withdrawals/:id/reject
// @access  Private (Admin)
export const rejectWithdrawal = async (req, res) => {
  const { reason } = req.body;
  try {
    const request = await WithdrawalRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.status = 'rejected';
    request.processedAt = Date.now();
    request.adminNote = reason;
    await request.save();

    // Refund balance to worker wallet
    const wallet = await WorkerWallet.findOne({ worker: request.worker });
    if (wallet) {
      wallet.balance += request.amount;
      wallet.transactions.push({
        type: 'credit',
        amount: request.amount,
        description: `Refund: Withdrawal Rejected (${reason || 'No reason'})`,
        withdrawalRequestId: request._id
      });
      await wallet.save();
    }

    res.json({ message: 'Withdrawal rejected and refunded', request });
  } catch (error) {
    console.error('Error rejecting withdrawal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
