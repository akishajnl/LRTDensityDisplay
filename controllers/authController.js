// controllers/authController.js
const User = require('../model/User');
const bcrypt = require('bcrypt'); 

const authController = {

    getLoginPage: (req, res) => {
        // If the user is already logged in, redirect them to their profile
        if (req.session.user) {
            return res.redirect('/profile');
        }

        // Map URL query parameters to human-readable messages
        const messages = {
            'invalid': 'Invalid username or password. Please try again.',
            'session': 'There was a problem starting your session. Please try again.',
            'db': 'A database error occurred. Please try again later.',
            'comment': 'You must be logged in to post a comment.',
            'registered': 'Registration successful! Please log in.'
        };

        // Determine if we have an error or a success message based on the query
        // Note: We use the 'success' key specifically for the registration redirect
        const errorMessage = req.query.error ? messages[req.query.error] : '';
        const successMessage = req.query.success === 'registered' ? messages['registered'] : '';

        res.render('login', { 
            pageTitle: 'Log In',
            errorMessage,
            successMessage
        });
    },

    postLogin: async (req, res) => {
        const { username, password } = req.body;

        try {
            // lookup user (case-insensitive)
            const user = await User.findOne({ username: username.toLowerCase() });
            
            // If user doesn't exist, generic error 
            if (!user) {
                return res.redirect('/login?error=invalid');
            }

            // --- Security Check ---
            // Use bcrypt to compare the plain text password from the form
            // with the encrypted hash stored in the database.
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                // Create the session object with essential user info
                req.session.user = {
                    _id: user._id,
                    username: user.username,
                    avatarUrl: user.avatarUrl,
                    tag: user.tag,
                    role: user.role
                };

                // Explicitly save the session before redirecting 
                req.session.save((err) => {
                    if (err) return res.redirect('/login?error=session');
                    return res.redirect('/profile');
                });
            } else {
                return res.redirect('/login?error=invalid');
            }
        } catch (error) {
            console.error('Login error:', error);
            res.redirect('/login?error=db');
        }
    },

    getRegisterPage: (req, res) => {
        if (req.session.user) {
            return res.redirect('/profile');
        }

        const errorMessages = {
            'mismatch': 'Passwords do not match. Please try again.',
            'exists': 'That username is already taken. Please choose another.',
            'db': 'A database error occurred. Please try again later.',
            'weak': 'Password must be at least 8 characters and contain a number.'
        };

        const errorMessage = errorMessages[req.query.error] || '';

        res.render('register', { 
            pageTitle: 'Register',
            errorMessage
        });
    },

    postRegister: async (req, res) => {
        const { username, password, confirmPassword } = req.body;

        // Validation Step
        
        // 1. Check if passwords match
        if (password !== confirmPassword) {
            return res.redirect('/register?error=mismatch');
        }

        // 2. Strong Password Enforcement (Server-side)
        // Even if the frontend checks this, we must check it here for security.
        const hasNumber = /\d/.test(password);
        if (password.length < 8 || !hasNumber) {
            return res.redirect('/register?error=weak');
        }

        try {
            // 3. Check for uniqueness
            const existingUser = await User.findOne({ username: username.toLowerCase() });
            if (existingUser) {
                return res.redirect('/register?error=exists');
            }

            // Hashing Step
            // We hash the password with a "salt" (10 rounds) before saving.
            // This ensures that even if our DB is leaked, the real passwords remain hidden.
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            await User.create({ username, password: hashedPassword });
            
            return res.redirect('/login?success=registered');

        } catch (error) {
            console.error('Registration error:', error);
            return res.redirect('/register?error=db');
        }
    },

    getLogout: (req, res) => {
        // Destroy the session on the server side to log the user out
        req.session.destroy((err) => {
            if (err) console.error('Error destroying session:', err);
            res.redirect('/');
        });
    }
};

module.exports = authController;