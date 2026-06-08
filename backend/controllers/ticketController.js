const Ticket = require('../models/Ticket');

exports.createTicket = async (req, res) => {
    try {
        const { title, description, category } = req.body;

        const ticket = await Ticket.create({
            title,
            description,
            category,
            createdBy: req.user.id 
        });

        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


exports.getTickets = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        let query = { isDeleted: false };

        if (req.user.role !== 'admin') {
            query.createdBy = req.user.id;
        }

        const tickets = await Ticket.find(query)
            .populate('createdBy', 'name email') 
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Ticket.countDocuments(query);

        res.status(200).json({
            success: true,
            count: tickets.length,
            pagination: { page, limit, totalPages: Math.ceil(total / limit) },
            data: tickets
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateTicketStatus = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, { isDeleted: true });

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.status(200).json({ success: true, message: 'Ticket removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};