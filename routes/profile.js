const express = require('express');
const router = express.Router();
console.log("Loading profile controller...");
const profileController = require('../controllers/profile');
console.log("Profile controller loaded.");

// HOME
router.get('/', profileController.homeRedirect);

// PROFILE
router.get('/profile', profileController.renderProfile);

// RESUME
router.get('/resume', profileController.renderResume);
router.get('/resume/download', profileController.downloadResume);

// PORTFOLIO
router.get('/portfolio', profileController.renderPortfolio);

// BLOG
router.get('/blog', profileController.renderBlog);

// ERROR
router.get('/error', (req, res) => {
    res.render('error', { message: 'Something went wrong.' });
});

module.exports = router;
