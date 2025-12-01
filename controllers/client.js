const Client = require('../models/client');
const supabase = require('../supabase');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const uploadWithErrorHandler = (req, res, next) => {
    upload.single('logo')(req, res, (err) => {
        if (err) {
            console.error('Uh oh, a file upload error occurred:', err);
            return res.status(500).json({ message: 'We had trouble uploading your file. Please try again!' });
        }
        next();
    });
};

module.exports.renderAddClientForm = (req, res) => {
    try {
        res.render('inputs/updatingClient', { action: 'add', currentPage: 'update-client' });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Failed to load add client form.' });
    }
};

module.exports.addClient = async (req, res) => {
    try {
        const { name, website, description } = req.body;
        const newClient = new Client({ name, website, description });

        if (req.file) {
            const uniqueFilename = `client_logos/${Date.now()}-${req.file.originalname}`;
            const { data, error } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .upload(uniqueFilename, req.file.buffer, {
                    contentType: req.file.mimetype,
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                throw error;
            }

            const { data: urlData, error: urlError } = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(uniqueFilename);
            if (urlError) {
                throw urlError;
            }
            newClient.logo = { url: urlData.publicUrl, filename: req.file.originalname };
        }

        await newClient.save();
        res.redirect('/updating/client/view');
    } catch (err) {
        console.error('Error adding client:', err);
        res.status(500).render('error', { message: 'Failed to add client.' });
    }
};

module.exports.renderEditClientForm = async (req, res) => {
    try {
        const { id } = req.params;
        const foundClient = await Client.findById(id);
        if (!foundClient) {
            return res.status(404).render('error', { message: 'Client not found.' });
        }
        res.render('inputs/updatingClient', { data: foundClient, action: 'edit', currentPage: 'update-client' });
    } catch (err) {
        console.error('Error rendering edit client form:', err);
        res.status(500).render('error', { message: 'Failed to load edit client form.' });
    }
};

module.exports.updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, website, description } = req.body;

        const updatedClient = await Client.findByIdAndUpdate(id, { name, website, description }, { new: true, runValidators: true });

        if (!updatedClient) {
            return res.status(404).render('error', { message: 'Client not found.' });
        }

        if (req.file) {
            if (updatedClient.logo && updatedClient.logo.filename) {
                await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`client_logos/${updatedClient.logo.filename}`]);
            }

            const uniqueFilename = `client_logos/${Date.now()}-${req.file.originalname}`;
            const { data, error } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .upload(uniqueFilename, req.file.buffer, {
                    contentType: req.file.mimetype,
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                throw error;
            }

            const { data: urlData, error: urlError } = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(uniqueFilename);
            if (urlError) {
                throw urlError;
            }
            updatedClient.logo = { url: urlData.publicUrl, filename: req.file.originalname };
            await updatedClient.save();
        } else if (req.body.deleteLogo === 'true') {
            if (updatedClient.logo && updatedClient.logo.filename) {
                await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`client_logos/${updatedClient.logo.filename}`]);
            }
            updatedClient.logo = undefined;
            await updatedClient.save();
        }

        res.redirect('/updating/client/view');
    } catch (err) {
        console.error('Error updating client:', err);
        res.status(500).render('error', { message: 'Failed to update client.' });
    }
};

module.exports.deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedClient = await Client.findByIdAndDelete(id);

        if (!deletedClient) {
            return res.status(404).render('error', { message: 'Client not found.' });
        }

        if (deletedClient.logo && deletedClient.logo.filename) {
            await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`client_logos/${deletedClient.logo.filename}`]);
        }

        res.redirect('/updating/client/view');
    } catch (err) {
        console.error('Error deleting client:', err);
        res.status(500).render('error', { message: 'Failed to delete client.' });
    }
};

module.exports.viewClients = async (req, res) => {
    try {
        const clients = await Client.find({});
        res.render('inputs/updatingClient', { data: clients, action: 'delete', currentPage: 'update-client' });
    } catch (err) {
        console.error('Error viewing clients:', err);
        res.status(500).render('error', { message: 'Failed to retrieve clients.' });
    }
};

module.exports.uploadWithErrorHandler = uploadWithErrorHandler;