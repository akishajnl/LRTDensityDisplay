// server.js

// --- 1. Dependencies and Setup ---
require('dotenv').config(); 
const express = require('express');
const hbs = require('hbs');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session'); 
const moment = require('moment'); // <-- Import moment

const app = express();
const PORT = process.env.PORT || 3000;

// --- 2. Require New Routes File ---
const routes = require('./routes/routes.js');

// --- 3. Middleware Configuration ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// --- Register Handlebars Helpers ---
hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

hbs.registerHelper('formatDate', function (date) {
    if (!date) return '';
    const options = { year: 'numeric', month: 'long' };
    return new Date(date).toLocaleDateString('en-US', options);
});

// --- *** NEW HELPER: timeAgo *** ---
hbs.registerHelper('timeAgo', function(date) {
    if (!date) return '';
    
    const now = moment();
    const commentDate = moment(date);
    
    // If older than 24 hours, show full date (e.g., "November 27, 2025 at 11:00 PM")
    if (now.diff(commentDate, 'hours') >= 24) {
        return commentDate.format('MMMM D, YYYY [at] h:mm A');
    }
    
    // Otherwise, show relative time (e.g., "10 minutes ago")
    return commentDate.fromNow();
});
// -----------------------------------

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'lrt', 
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 } 
}));

// --- 4. Use Routes ---
app.use('/', routes);

// --- 5. MongoDB Connection Logic ---
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully!');
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err);
    });