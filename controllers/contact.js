// This file manages all operations related to contact messages.
// It handles receiving new messages, uploading attachments, verifying access to view messages,
// and displaying/deleting them.

// We bring in our Contact data model to interact with the database.
const contact = require('../models/contact');
// Supabase is used for storing file attachments securely.
const supabase = require('../supabase');
// Multer helps us process file uploads from forms.
const multer = require('multer');
// We configure Multer to store files in memory temporarily before sending them to Supabase.
const upload = multer({ storage: multer.memoryStorage() });
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// This is a special helper that wraps Multer's upload process.
// It catches any errors during file upload and sends a friendly message back to the user.
const uploadWithErrorHandler = (req, res, next) => {
    // We're expecting a single file named 'attachment'.
    upload.single('attachment')(req, res, (err) => {
        if (err) {
            console.error('Uh oh, a file upload error occurred:', err);
            // Send JSON error response for AJAX
            return res.status(500).json({ message: 'We had trouble uploading your file. Please try again!' });
        }
        // If all goes well, we move on to the next step.
        next();
    });
};

// --- Functions for Handling Contact Pages ---

// Renders the contact form page where visitors can send messages.
module.exports.renderContactForm = (req, res) => {
    try {
        res.render('profile/contact', { currentPage: 'contact' });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Failed to load contact form.' });
    }
};

// Processes the submitted contact form, saves the message, and uploads any attachments to Supabase.
module.exports.submitContactForm = async (req, res) => {
    console.log('A new contact message just came in!');
    console.log('Message details:', req.body);
    console.log('Attached file (if any):', req.file);
    try {
        const { name, email, phone, message } = req.body;
        // Create a new contact entry with the submitted details.
        const newContact = new contact({
            name: name,
            email,
            phone,
            message
        });
        // If there's an attached file, we'll upload it to Supabase.
        if (req.file) {
            // Generate a unique filename to prevent conflicts
            const uniqueFilename = `attachments/${Date.now()}-${req.file.originalname}`;

            // Upload the file to our Supabase storage bucket.
            const { data, error } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .upload(uniqueFilename, req.file.buffer, {
                    contentType: req.file.mimetype,
                    cacheControl: '3600',
                    upsert: false, // With unique filenames, upsert: false is fine.
                });

            if (error) {
                throw error; // If Supabase upload fails, we stop here.
            }

            // Get the public web address (URL) for the uploaded file.
            const { data: urlData, error: urlError } = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(uniqueFilename);
            if (urlError) {
                throw urlError; // If getting the URL fails, we stop here.
            }
            // Save the attachment's URL and original filename with the contact message.
            newContact.attachment = { url: urlData.publicUrl, filename: req.file.originalname };
        }
        console.log('Preparing to save this new contact message:', JSON.stringify(newContact, null, 2));
        await newContact.save(); // Save the complete contact message to our database.
        console.log('Contact message saved successfully!');

        // Send Telegram notification
        try {
            let telegramMessage = `New Contact Message!\n\nName: ${newContact.name}\nEmail: ${newContact.email}\nPhone: ${newContact.phone || 'N/A'}\nMessage: ${newContact.message}`;
            if (newContact.attachment && newContact.attachment.url) {
                telegramMessage += `\nAttachment: ${newContact.attachment.url}`;
            }
            await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, telegramMessage);
            console.log('Telegram notification sent successfully.');
        } catch (telegramError) {
            console.error('Failed to send Telegram notification:', telegramError);
        }

        // Send JSON success response for AJAX
        res.status(200).json({ message: 'Your response has been shared and saved.' });
    } catch (err) {
        console.error('Oops! There was an error saving the contact message:', err);
        // Send JSON error response for AJAX
        res.status(500).json({ message: 'We couldn\'t save your message right now. Please try again!' });
    }
};

// Renders the page where users can enter a secret code to view contact messages.
module.exports.renderVerifyContacts = (req, res) => {
    try {
        res.render('profile/verify-contacts');
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Failed to load verification page.' });
    }
};

// Checks the submitted secret code to grant access to view contact messages.
module.exports.verifyContacts = (req, res) => {
    try {
        const { secret } = req.body;
        // If the secret code is correct, we mark the session as verified for contacts.
        if (secret === process.env.CONTACT_SECRET_KEY) {
            req.session.isContactsVerified = true;
            return res.redirect('/view-contacts'); // Send them to the page to view all contacts.
        }
        console.log('Someone tried to view contacts with an invalid secret code.');
        res.status(400).send('That secret code isn\'t quite right for contacts. Please try again!');
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Failed to verify contacts.' });
    }
};

// Renders the page that displays all submitted contact messages.
module.exports.viewContacts = async (req, res) => {
    try {
        // Fetch all contact messages, sorted by the newest first.
        const contacts = await contact.find().sort({ createdAt: -1 });
        console.log('Displaying all contacts:', JSON.stringify(contacts, null, 2));
        res.render('profile/view-contacts', { contacts, currentPage: 'view-contacts' });
    } catch (err) {
        console.error('Oops! There was an error fetching contact messages:', err);
        res.status(500).render('error', { message: 'We couldn\'t load the contact messages right now. Please try again!' });
    }
};

// Renders a page to view the details of a single contact message.
module.exports.viewSingleContact = async (req, res) => {
    try {
        const { id } = req.params;
        // Find the specific contact message by its ID.
        const foundContact = await contact.findById(id);
        if (!foundContact) {
            return res.status(404).send('Sorry, we couldn\'t find that contact message.');
        }
        res.render('profile/view-contact', { contact: foundContact, currentPage: 'view-contact' });
    } catch (err) {
        console.error('Oops! There was an error fetching a single contact message:', err);
        res.status(500).render('error', { message: 'We couldn\'t load that contact message right now. Please try again!' });
    }
};

// Deletes a specific contact message and its associated attachment from Supabase.
module.exports.deleteContact = async (req, res) => {
    console.log('Attempting to delete contact with ID:', req.params.id);
    try {
        const { id } = req.params;
        // Delete the contact message from our database.
        const deletedContact = await contact.findByIdAndDelete(id);
        console.log('Contact deleted from MongoDB:', deletedContact);

        // If the deleted contact had an attachment, we also remove it from Supabase.
        if (deletedContact && deletedContact.attachment && deletedContact.attachment.filename) {
            console.log('Also deleting attachment from Supabase:', deletedContact.attachment.filename);
            const { data, error } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .remove([`attachments/${deletedContact.attachment.filename}`]);

            if (error) {
                console.error('Uh oh, Supabase attachment deletion failed:', error);
            } else {
                console.log('Supabase attachment deleted successfully:', data);
            }
        }

        res.redirect('/view-contacts'); // Redirect back to the page showing all contacts.
    } catch (err) {
        console.error('Oops! There was an error deleting the contact message:', err);
        res.status(500).render('error', { message: 'We couldn\'t delete that contact message right now. Please try again!' });
    }
};

// We're making our custom file upload error handler available for use in our routes.
// We're making our custom file upload error handler available for use in our routes.
module.exports.renderEditContactForm = async (req, res) => {
    try {
        const { id } = req.params;
        const foundContact = await contact.findById(id);
        if (!foundContact) {
            return res.status(404).render('error', { message: 'Sorry, we couldn\'t find that contact message to edit.' });
        }
        res.render('inputs/updatingContact', { contact: foundContact, action: 'edit', currentPage: 'update-contact' });
    } catch (err) {
        console.error('Oops! There was an error fetching the contact message for editing:', err);
        res.status(500).render('error', { message: 'We couldn\'t load the edit form right now. Please try again!' });
    }
};

// Updates a specific contact message and its associated attachment.
module.exports.updateContact = async (req, res) => {
    console.log('Attempting to update contact with ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Attached file (if any):', req.file);

    try {
        const { id } = req.params;
        const { name, email, phone, message } = req.body;

        const updatedContact = await contact.findByIdAndUpdate(id, { name, email, phone, message }, { new: true, runValidators: true });

        if (!updatedContact) {
            return res.status(404).render('error', { message: 'Sorry, we couldn\'t find that contact message to update.' });
        }

        // Handle attachment update
        if (req.file) {
            // If there\'s an old attachment, delete it from Supabase
            if (updatedContact.attachment && updatedContact.attachment.filename) {
                console.log('Deleting old attachment from Supabase:', updatedContact.attachment.filename);
                const { error: removeError } = await supabase.storage
                    .from(process.env.SUPABASE_BUCKET)
                    .remove([`attachments/${updatedContact.attachment.filename}`]);

                if (removeError) {
                    console.error('Supabase old attachment deletion failed:', removeError);
                } else {
                    console.log('Supabase old attachment deleted successfully.');
                }
            }

            // Upload new attachment to Supabase
            const uniqueFilename = `attachments/${Date.now()}-${req.file.originalname}`;
            const { data, error: uploadError } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .upload(uniqueFilename, req.file.buffer, {
                    contentType: req.file.mimetype,
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                throw uploadError;
            }

            const { data: urlData, error: urlError } = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(uniqueFilename);
            if (urlError) {
                throw urlData;
            }

            updatedContact.attachment = { url: urlData.publicUrl, filename: req.file.originalname };
            await updatedContact.save(); // Save the updated attachment info
        } else if (req.body.deleteAttachment === 'true') {
            // If deleteAttachment checkbox is checked and no new file is uploaded
            if (updatedContact.attachment && updatedContact.attachment.filename) {
                console.log('Deleting attachment from Supabase as requested:', updatedContact.attachment.filename);
                const { error: removeError } = await supabase.storage
                    .from(process.env.SUPABASE_BUCKET)
                    .remove([`attachments/${updatedContact.attachment.filename}`]);

                if (removeError) {
                    console.error('Supabase attachment deletion failed:', removeError);
                } else {
                    console.log('Supabase attachment deleted successfully.');
                }
            }
            updatedContact.attachment = undefined; // Remove attachment reference from DB
            await updatedContact.save();
        }


        console.log('Contact message updated successfully:', updatedContact);
        res.redirect(`/contacts/${updatedContact._id}`); // Redirect to the single contact view
    } catch (err) {
        console.error('Oops! There was an error updating the contact message:', err);
        res.status(500).render('error', { message: 'We couldn\'t update that contact message right now. Please try again!' });
    }
};

module.exports.uploadWithErrorHandler = uploadWithErrorHandler;
