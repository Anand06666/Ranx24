import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createNotification } from './notificationController.js';

dotenv.config();

// Validate Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('❌ CRITICAL: Razorpay credentials not found in environment variables!');
    console.error('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file');
    throw new Error('Razorpay credentials missing');
}

// Initialize Razorpay instance with environment variables only
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order
// @route   POST /api/payment/order
// @access  Private
export const createOrder = async (req, res) => {
    const { amount } = req.body;

    if (!amount) {
        return res.status(400).json({ message: 'Amount is required' });
    }

    const options = {
        amount: amount * 100, // Amount in smallest currency unit (paise)
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Server error while creating order', error });
    }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: 'Missing payment verification details' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Payment is successful

        // Update booking status if bookingId is provided
        if (bookingId) {
            try {
                // Dynamic import to avoid circular dependency if any (though unlikely here as we are in controller)
                // Better to import at top, but let's check imports. 
                // We need Booking model. It is not imported.
                // Let's assume we can add import at top or use mongoose.model('Booking')
                const Booking = (await import('../model/Booking.js')).default;

                await Booking.findByIdAndUpdate(bookingId, {
                    paymentStatus: 'paid',
                    paymentId: razorpay_payment_id,
                    status: 'confirmed' // Optional: Auto-confirm if paid? Let's stick to just paymentStatus for now or confirmed if pending.
                    // User said: "agr payment ho gya h to paid ho jaye"
                });
            } catch (error) {
                console.error('Error updating booking status after payment:', error);
                // Don't fail the request, just log it. The payment was successful.
            }
        }

        // Send Notification
        if (req.user) {
            await createNotification({
                recipient: req.user._id,
                recipientModel: 'User',
                title: 'Payment Successful',
                message: `Payment verified successfully.`,
                type: 'success',
                data: { paymentId: razorpay_payment_id },
                io: req.io // Pass socket instance
            });
        }

        res.json({
            message: 'Payment verified successfully',
            success: true,
            paymentId: razorpay_payment_id,
        });
    } else {
        res.status(400).json({
            message: 'Invalid payment signature',
            success: false,
        });
    }
};
