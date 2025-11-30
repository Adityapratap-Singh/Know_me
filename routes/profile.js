const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile');

// HOME
router.get('/', profileController.homeRedirect);

// PROFILE
router.get('/profile', profileController.renderProfile);

// RESUME
router.get('/resume', profileController.renderResume);

// PORTFOLIO
router.get('/portfolio', profileController.renderPortfolio);

// BLOG
router.get('/blog', profileController.renderBlog);

// ERROR
router.get('/error', (req, res) => {
    res.render('error', { message: 'Something went wrong.' });
});

module.exports = router;