const WhatDoIDo = require('../models/whatDoIDo');
const supabase = require('../supabase');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const uploadWithErrorHandler = (req, res, next) => {
    upload.single('icon')(req, res, (err) => {
        if (err) {
            console.error('Uh oh, a file upload error occurred:', err);
            return res.status(500).render('error', { message: 'We had trouble uploading your icon. Please try again!' });
        }
        next();
    });
};

module.exports.renderAddWhatDoIDoForm = (req, res) => {
    try {
        res.render('inputs/updatingWhatdoIdo', { action: 'add', currentPage: 'update-whatdoido' });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Failed to load add "What I Do" form.' });
    }
};

module.exports.addWhatDoIDo = async (req, res) => {
    try {
        const newItem = new WhatDoIDo(req.body);

        if (req.file) {
            const uniqueFilename = `whatdoido_icons/${Date.now()}-${req.file.originalname}`;
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
                throw urlData;
            }
            newItem.icon = { url: urlData.publicUrl, filename: req.file.originalname };
        }

        await newItem.save();
        res.redirect('/updating/whatDoIDo/view');
    } catch (err) {
        console.error('Error adding "What I Do" item:', err);
        res.status(500).render('error', { message: 'Failed to add "What I Do" item.' });
    }
};

module.exports.renderEditWhatDoIDoForm = async (req, res) => {
    try {
        const { id } = req.params;
        const foundItem = await WhatDoIDo.findById(id);
        if (!foundItem) {
            return res.status(404).render('error', { message: '"What I Do" item not found.' });
        }
        res.render('inputs/updatingWhatdoIdo', { data: foundItem, action: 'edit', currentPage: 'update-whatdoido' });
    } catch (err) {
        console.error('Error rendering edit "What I Do" form:', err);
        res.status(500).render('error', { message: 'Failed to load edit "What I Do" form.' });
    }
};

module.exports.updateWhatDoIDo = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedItem = await WhatDoIDo.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedItem) {
            return res.status(404).render('error', { message: '"What I Do" item not found.' });
        }

        if (req.file) {
            if (updatedItem.icon && updatedItem.icon.filename) {
                await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`whatdoido_icons/${updatedItem.icon.filename}`]);
            }

            const uniqueFilename = `whatdoido_icons/${Date.now()}-${req.file.originalname}`;
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
                throw urlData;
            }
            updatedItem.icon = { url: urlData.publicUrl, filename: req.file.originalname };
            await updatedItem.save();
        } else if (req.body.deleteIcon === 'true') {
            if (updatedItem.icon && updatedItem.icon.filename) {
                await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`whatdoido_icons/${updatedItem.icon.filename}`]);
            }
            updatedItem.icon = undefined;
            await updatedItem.save();
        }

        res.redirect('/updating/whatDoIDo/view');
    } catch (err) {
        console.error('Error updating "What I Do" item:', err);
        res.status(500).render('error', { message: 'Failed to update "What I Do" item.' });
    }
};

module.exports.deleteWhatDoIDo = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await WhatDoIDo.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).render('error', { message: '"What I Do" item not found.' });
        }

        if (deletedItem.icon && deletedItem.icon.filename) {
            await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`whatdoido_icons/${deletedItem.icon.filename}`]);
        }

        res.redirect('/updating/whatDoIDo/view');
    } catch (err) {
        console.error('Error deleting "What I Do" item:', err);
        res.status(500).render('error', { message: 'Failed to delete "What I Do" item.' });
    }
};

module.exports.viewWhatDoIDo = async (req, res) => {
    try {
        const items = await WhatDoIDo.find({});
        res.render('inputs/updatingWhatdoIdo', { data: items, action: 'delete', currentPage: 'update-whatdoido' });
    } catch (err) {
        console.error('Error viewing "What I Do" items:', err);
        res.status(500).render('error', { message: 'Failed to retrieve "What I Do" items.' });
    }
};

module.exports.uploadWithErrorHandler = uploadWithErrorHandler;