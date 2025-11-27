// model/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Authentication Credentials
    username: {
        type: String,
        required: true,
        unique: true, 
        trim: true,
        // vital for case-insensitive login (e.g., "User1" and "user1" are treated the same)
        lowercase: true 
    },
    password: {
        type: String,
        required: true
        // Security Note: We store the BCRYPT HASH here, never the plain text password.
        // This ensures user security even if the database is compromised.
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Strict validation: allows only these two roles
        default: 'user'
    },

    // Profile Display Fields
    // These fields are used to populate the user's public profile card
    tag: {
        type: String,
        default: generateRandomTag // Mongoose runs this function for every new user
    },
    memberSince: {
        type: Date,
        default: Date.now // Automatically sets the registration timestamp
    },
    rank: {
        type: String,
        default: 'Commuter' // Can be modified later on, the idea is like a gamification rank to influence commuters to use the website more
    },
    badge: {
        type: String,
        default: 'Unverified'
    },
    notes: {
        type: String,
        default: '' // User bio/status message
    },
    avatarUrl: {
        type: String,
        // We use a default placeholder so the UI doesn't break for new users.
        // Custom uploads will be stored here as Base64 strings.
        default: 'https://placehold.co/80x80/6b7280/ffffff?text=U'
    }
});

module.exports = mongoose.model('User', UserSchema);