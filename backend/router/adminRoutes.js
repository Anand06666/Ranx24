import express from 'express';
import { adminLogin, adminRegister, getAllUsers, deleteUser, createUser, getDashboardStats, getWithdrawalRequests, approveWithdrawal, rejectWithdrawal } from '../controller/adminController.js';

const router = express.Router();

// Admin Registration Route
router.post('/register', adminRegister);

// Admin Login Route
router.post('/login', adminLogin);

import { protect, admin } from '../middleware/authMiddleware.js';

// Get dashboard stats
router.get('/stats', protect, admin, getDashboardStats);

// Get all users route
router.get('/users', protect, admin, getAllUsers);

// Create user route
router.post('/users', protect, admin, createUser);

// Delete user route
router.delete('/users/:id', protect, admin, deleteUser);

import { getFees, updateFees } from '../controller/feeController.js';

// Fee Management Routes
router.get('/fees', protect, getFees);
router.put('/fees', protect, admin, updateFees);

// Withdrawal Management Routes
router.get('/withdrawals', protect, admin, getWithdrawalRequests);
router.put('/withdrawals/:id/approve', protect, admin, approveWithdrawal);
router.put('/withdrawals/:id/reject', protect, admin, rejectWithdrawal);

export default router;
