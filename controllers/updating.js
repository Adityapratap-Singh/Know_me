const { Jimp } = require('jimp');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// We're setting a minimum size for uploaded images (like client logos) to ensure quality.
const MIN_WIDTH = 100; // The smallest width an image should have.
const MIN_HEIGHT = 100; // The smallest height an image should have.

// This special check makes sure that any uploaded image meets our minimum size requirements.
const validateImageDimensions = async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    try {
        const image = await Jimp.read(req.file.buffer);
        const { width, height } = image.bitmap;
        if (width < MIN_WIDTH || height < MIN_HEIGHT) {
            return res.status(400).send(`Oops! Your image needs to be at least ${MIN_WIDTH}x${MIN_HEIGHT} pixels. Please try a larger one.`);
        }
        next();
    } catch (error) {
        console.error('Error in validateImageDimensions:', error);
        return res.status(500).send('We had trouble processing your image. Please try again.');
    }
};

// --- Functions for Handling Update Pages and Authentication ---

// Renders the page where users choose what they want to update
module.exports.renderUpdatingOptions = (req, res) => {
    res.render('inputs/updating/updatings');
};

// Processes the user's choice from the update options page
module.exports.updateOptionsHandler = (req, res) => {
    const { updates, action } = req.body;
    // Redirects the user to the specific add or delete form based on their choice.
    if (action === 'add') {
        return res.redirect(`/updating/${updates}/add`);
    }
    if (action === 'delete') {
        return res.redirect(`/updating/${updates}/view`);
    }
    if (action === 'edit') {
        return res.redirect(`/updating/${updates}/view`);
    }
    // If the action isn't recognized, something went wrong.
    res.status(400).send('We couldn\'t understand your request. Please try again.');
};

// Handles logging out from the update section
module.exports.logout = (req, res) => {
    req.session.destroy(); // Clears all session data.
    res.redirect('/updating'); // Sends the user back to the main update login page.
};

module.exports.validateImageDimensions = validateImageDimensions;
module.exports.upload = upload;
