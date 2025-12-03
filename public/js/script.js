'use strict'; // Enforces stricter parsing and error handling in our JavaScript code.

// This is our main JavaScript file, acting as the central hub for all other scripts.
// We're importing different parts of our application's frontend logic,
// keeping things organized and modular.

// Imports general utility functions that can be reused across different parts of the site.
import './used/utilities.js';
// Imports the logic that controls the interactive sidebar.
import './used/sidebar.js';
// Imports the functionality for expanding and viewing testimonials.
import './used/testimonials.js';
// Imports the logic for filtering portfolio items and managing the custom select dropdown.
import './used/portfolio-filter.js';
import './used/projects.js';
// Imports the script that handles the contact form's interactive behavior.
import './used/contact-form.js';
// Imports the logic for expanding and viewing contact details.
import './used/view-contacts.js';

// If there's any code that needs to run globally or orchestrate interactions
// between these modules, it would go here. For now, simply importing them
// is enough to get their individual functionalities up and running.
