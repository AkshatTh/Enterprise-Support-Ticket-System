const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a ticket title'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please describe your issue']
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved'],
        default: 'Open'
    },
    category: {
        type: String,
        enum: ['Bug Report', 'Feature Request', 'Billing', 'Technical Support'],
        default: 'Technical Support'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true 
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false,
        select: false 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);