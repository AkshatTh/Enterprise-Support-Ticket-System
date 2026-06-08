const express = require('express');
const { 
    createTicket, 
    getTickets, 
    updateTicketStatus, 
    deleteTicket 
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); 

router.route('/')
    .get(getTickets)
    .post(createTicket);

router.route('/:id')
    .put(authorize('admin'), updateTicketStatus)
    .delete(authorize('admin'), deleteTicket);

module.exports = router;