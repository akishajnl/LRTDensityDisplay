// routes/routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

// File Upload Configuration
// We use memoryStorage to hold the uploaded file in RAM temporarily.
// This allows us to resize/compress it with 'sharp' in the controller before effectively saving it to the database.
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit to prevent server overload
});

// Import Controllers
const controller = require('../controllers/controller.js');
const authController = require('../controllers/authController.js');
const profileController = require('../controllers/profileController.js');
const stationController = require('../controllers/stationController.js');
const commentController = require('../controllers/commentController.js');


// General Navigation
router.get('/', controller.getHomePage);
router.get('/about', controller.getAboutPage);
router.get('/search', stationController.getSearch); 

// Authentication
router.get('/login', authController.getLoginPage);
router.post('/login', authController.postLogin);
router.get('/register', authController.getRegisterPage);
router.post('/register', authController.postRegister);
router.get('/logout', authController.getLogout);

// User Profile
router.get('/profile', profileController.getProfilePage);

// Note: We inject the 'upload.single' middleware here.
// It intercepts the request to process the 'avatar' file from the form
// BEFORE the request reaches our profileController.
router.post('/profile', upload.single('avatar'), profileController.postProfile);

// Station Details
// The ':name' parameter makes this dynamic, allowing one route handler
// to serve every station page (e.g., /station/Baclaran, /station/Monumento)
router.get('/station/:name', stationController.getStationDetail);

// Comment Actions
router.post('/comment', commentController.postComment);
router.post('/comment/react', commentController.postReaction); // API endpoint for AJAX votes
router.post('/comment/delete', commentController.deleteComment);
router.post('/comment/edit', commentController.editComment);

module.exports = router;