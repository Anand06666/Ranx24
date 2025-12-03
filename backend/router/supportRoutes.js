import express from 'express';
import {
    createTicket,
    getUserTickets,
    getAllTickets,
    addMessage,
    updateTicketStatus,
    markAsRead,
} from '../controller/supportController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import { supportTicketSchema } from '../utils/validationSchemas.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User/Worker routes
router.post('/', validate(supportTicketSchema), createTicket);
router.get('/my', getUserTickets);
router.post('/:id/message', addMessage);

// Admin routes
router.get('/admin/all', getAllTickets);
router.patch('/:id/status', updateTicketStatus);
router.patch('/:id/read', markAsRead);

export default router;
