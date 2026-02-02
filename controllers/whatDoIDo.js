const WhatDoIDo = require('../models/whatDoIDo');
const supabase = require('../supabase');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const catchAsync = require('../utils/catchAsync');

const uploadWithErrorHandler = (req, res, next) => {
    upload.single('icon')(req, res, (err) => {
        if (err) {
            console.error('Uh oh, a file upload error occurred:', err);
            return res.status(500).render('error', { message: 'We had trouble uploading your icon. Please try again!' });
        }
        next();
    });
};

module.exports.renderAddWhatDoIDo = (req, res) => {
    res.render('inputs/updatingWhatdoIdo', { action: 'add', currentPage: 'update-whatdoido' });
};

module.exports.addWhatDoIDo = catchAsync(async (req, res) => {
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
    if (req.body.save_action === 'save_and_add_another') {
        return res.redirect('/updating/whatdoido/add');
    }
    res.redirect('/updating/whatdoido/view');
});

module.exports.renderEditWhatDoIDo = catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundItem = await WhatDoIDo.findById(id);
    if (!foundItem) {
        return res.status(404).render('error', { message: '"What I Do" item not found.' });
    }
    res.render('inputs/updatingWhatdoIdo', { data: foundItem, action: 'edit', currentPage: 'update-whatdoido' });
});

module.exports.editWhatDoIDo = catchAsync(async (req, res) => {
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

    res.redirect('/updating/whatdoido/view');
});

module.exports.deleteWhatDoIDo = catchAsync(async (req, res) => {
    const { id } = req.params;
    const deletedItem = await WhatDoIDo.findById(id);

    if (!deletedItem) {
        return res.status(404).render('error', { message: '"What I Do" item not found.' });
    }

    if (deletedItem.icon && deletedItem.icon.filename) {
        await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`whatdoido_icons/${deletedItem.icon.filename}`]);
    }

    await WhatDoIDo.findByIdAndDelete(id);
    res.redirect('/updating/whatdoido/view');
});

module.exports.deleteBatchWhatDoIDo = catchAsync(async (req, res) => {
    const { ids } = req.body;
    if (ids && ids.length > 0) {
        // Fetch items to delete images
        const items = await WhatDoIDo.find({ _id: { $in: ids } });
        for (const item of items) {
            if (item.icon && item.icon.filename) {
                await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`whatdoido_icons/${item.icon.filename}`]);
            }
        }
        await WhatDoIDo.deleteMany({ _id: { $in: ids } });
    }
    res.redirect('/updating/whatdoido/view');
});

module.exports.renderDeleteWhatDoIDo = catchAsync(async (req, res) => {
    const items = await WhatDoIDo.find({});
    res.render('inputs/updatingWhatdoIdo', { data: items, action: 'delete', currentPage: 'update-whatdoido' });
});

module.exports.uploadWithErrorHandler = uploadWithErrorHandler;
module.exports.upload = upload;
