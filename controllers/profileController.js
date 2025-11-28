// controllers/profileController.js
const User = require('../model/User');
const Comment = require('../model/Comment'); 
const sharp = require('sharp'); 

const profileController = {

    getProfilePage: async (req, res) => {
        // Security: Ensure user is logged in
        if (!req.session.user) {
            return res.redirect('/login');
        }

        try {
            const userData = await User.findOne({ username: req.session.user.username }).lean();
            
            // Map error codes from the URL to human-readable messages
            const errorMessages = {
                'username_taken': 'That username is already taken. Please choose another.',
                'update': 'An error occurred while updating your profile.',
                'session': 'Session error. Please log in again.',
                'file_type': 'Invalid file type. Please upload an image (JPG, PNG).'
            };

            const errorMessage = errorMessages[req.query.error] || '';

            res.render('profile', {
                pageTitle: 'User Profile',
                user: userData,
                errorMessage: errorMessage 
            });

        } catch (error) {
            console.error('Error fetching profile:', error);
            res.redirect('/');
        }
    },

    postProfile: async (req, res) => {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        
        const { newUsername, notes, tag, badge } = req.body;
        const userId = req.session.user._id; 
        const oldUsername = req.session.user.username;

        let updateData = {
            username: newUsername.toLowerCase(),
            notes,
            tag,
            badge
        };

        // Image Processing
        // If a file was uploaded, we need to resize, compress, and convert it
        if (req.file) {
            try {
                if (!req.file.mimetype.startsWith('image/')) {
                    return res.redirect('/profile?error=file_type');
                }

                // Use 'sharp' to resize to 200x200 (thumbnail size) and compress to 70% quality
                // This ensures the database doesn't get bloated with massive images, since we are using a free database and we have limited storage
                const processedBuffer = await sharp(req.file.buffer)
                    .resize(200, 200)
                    .toFormat('jpeg')
                    .jpeg({ quality: 70 })
                    .toBuffer();

                // Convert buffer to Base64 string for easy storage/display
                updateData.avatarUrl = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;

            } catch (err) {
                console.error('Image processing error:', err);
                return res.redirect('/profile?error=update');
            }
        }

        // Data Synchronization
        // If the username changed, update it in all their old comments so they don't look broken
        // We run this in the background (no await) to keep the response fast
        if (oldUsername.toLowerCase() !== newUsername.toLowerCase()) {
            Comment.updateMany(
                { authorId: userId }, 
                { $set: { authorUsername: newUsername.toLowerCase() } } 
            ).catch(err => console.error('Failed to update comment usernames:', err));
        }

        // Database Update
        try {
            await User.updateOne(
                { _id: userId }, 
                { $set: updateData }       
            );

            // Update the active session immediately
            // This ensures the Navbar updates (e.g., shows new Avatar) without needing a re-login
            req.session.user.username = updateData.username;
            req.session.user.tag = updateData.tag;
            if (updateData.avatarUrl) {
                req.session.user.avatarUrl = updateData.avatarUrl;
            }
            
            // Save session explicitly before redirecting to ensure data persists
            req.session.save((err) => {
                if (err) {
                    console.error('Error saving session:', err);
                    return res.redirect('/profile?error=session');
                }
                return res.redirect('/profile');
            });

        } catch (error) {
            console.error('Error updating profile:', error);
            
            // Handle duplicate username error (MongoDB error code 11000)
            if (error.code === 11000) {
                return res.redirect('/profile?error=username_taken');
            }
            return res.redirect('/profile?error=update');
        }
    },

     deleteAccount: async (req, res) => {
        if (!req.session.user) return res.redirect('/login');
        
        try {
            const userId = req.session.user._id;

            // 1. Delete the User from Database
            await User.findByIdAndDelete(userId);

            // 2. Destroy the Session (Log them out)
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session during delete:', err);
                }
                // 3. Redirect to Home
                res.redirect('/');
            });

        } catch (error) {
            console.error('Error deleting account:', error);
            res.redirect('/profile?error=delete');
        }
    }
};


module.exports = profileController;
