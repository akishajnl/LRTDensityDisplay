// model/Comment.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    // Relationships
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links this comment to a specific User document
        required: true
    },
    // We store the username separately so we can display it quickly without always needing to 'populate' the full User object.
    // Note: If a user changes their name, we update this field manually.
    authorUsername: {
        type: String,
        required: true
    },
    stationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station', // Links this comment to a specific Station
        required: true
    },

    // Content
    text: {
        type: String,
        required: true,
        maxlength: 500 // Keeps comments concise and prevents spam/abuse
    },
    timestamp: {
        type: Date,
        default: Date.now // Auto-generates the time of posting
    },

    // Voting System
    // We maintain simple counters for quick display
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0
    },
    // but we also track exactly WHO voted in these arrays.
    // This allows us to prevent duplicate votes and let users toggle their votes off.
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Comment', CommentSchema);