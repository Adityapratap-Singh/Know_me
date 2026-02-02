const Client = require('../models/client');
const supabase = require('../supabase');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const catchAsync = require('../utils/catchAsync');

const uploadWithErrorHandler = (req, res, next) => {
    upload.single('logo')(req, res, (err) => {
        if (err) {
            console.error('Uh oh, a file upload error occurred:', err);
            return res.status(500).json({ message: 'We had trouble uploading your file. Please try again!' });
        }
        next();
    });
};

module.exports.renderAddClient = (req, res) => {
    res.render('inputs/updatingClient', { action: 'add', currentPage: 'update-client' });
};

module.exports.addClient = catchAsync(async (req, res) => {
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
    if (req.body.save_action === 'save_and_add_another') {
        return res.redirect('/updating/client/add');
    }
    res.redirect('/updating/client/view');
});

module.exports.renderEditClient = catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundClient = await Client.findById(id);
    if (!foundClient) {
        return res.status(404).render('error', { message: 'Client not found.' });
    }
    res.render('inputs/updatingClient', { data: foundClient, action: 'edit', currentPage: 'update-client' });
});

module.exports.editClient = catchAsync(async (req, res) => {
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
});

module.exports.deleteClient = catchAsync(async (req, res) => {
    const { id } = req.params;
    const deletedClient = await Client.findById(id);

    if (!deletedClient) {
        return res.status(404).render('error', { message: 'Client not found.' });
    }

    if (deletedClient.logo && deletedClient.logo.filename) {
        await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`client_logos/${deletedClient.logo.filename}`]);
    }

    await Client.findByIdAndDelete(id);
    res.redirect('/updating/client/view');
});

module.exports.deleteBatchClient = catchAsync(async (req, res) => {
    const { ids } = req.body;
    if (ids && ids.length > 0) {
        const clients = await Client.find({ _id: { $in: ids } });
        for (const client of clients) {
            if (client.logo && client.logo.filename) {
                await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`client_logos/${client.logo.filename}`]);
            }
        }
        await Client.deleteMany({ _id: { $in: ids } });
    }
    res.redirect('/updating/client/view');
});

module.exports.renderDeleteClient = catchAsync(async (req, res) => {
    const clients = await Client.find({});
    res.render('inputs/updatingClient', { data: clients, action: 'delete', currentPage: 'update-client' });
});

module.exports.uploadWithErrorHandler = uploadWithErrorHandler;
