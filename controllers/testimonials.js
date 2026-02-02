const Testimonial = require('../models/testimonials');
const supabase = require('../supabase');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const catchAsync = require('../utils/catchAsync');

const uploadWithErrorHandler = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Uh oh, a file upload error occurred:', err);
            return res.status(500).render('error', { message: 'We had trouble uploading your image. Please try again!' });
        }
        next();
    });
};

module.exports.renderAddTestimonial = (req, res) => {
    res.render('inputs/updatingTestimonials', { action: 'add', currentPage: 'update-testimonials' });
};

module.exports.addTestimonial = catchAsync(async (req, res) => {
    const newTestimonial = new Testimonial(req.body);

    if (req.file) {
        const uniqueFilename = `testimonial_images/${Date.now()}-${req.file.originalname}`;
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
        newTestimonial.image = { url: urlData.publicUrl, filename: req.file.originalname };
    }

    await newTestimonial.save();
    if (req.body.save_action === 'save_and_add_another') {
        return res.redirect('/updating/testimonial/add');
    }
    res.redirect('/updating/testimonial/view');
});

module.exports.renderEditTestimonial = catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundTestimonial = await Testimonial.findById(id);
    if (!foundTestimonial) {
        return res.status(404).render('error', { message: 'Testimonial not found.' });
    }
    res.render('inputs/updatingTestimonials', { data: foundTestimonial, action: 'edit', currentPage: 'update-testimonials' });
});

module.exports.editTestimonial = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedTestimonial = await Testimonial.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedTestimonial) {
        return res.status(404).render('error', { message: 'Testimonial not found.' });
    }

    if (req.file) {
        if (updatedTestimonial.image && updatedTestimonial.image.filename) {
            await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`testimonial_images/${updatedTestimonial.image.filename}`]);
        }

        const uniqueFilename = `testimonial_images/${Date.now()}-${req.file.originalname}`;
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
        updatedTestimonial.image = { url: urlData.publicUrl, filename: req.file.originalname };
        await updatedTestimonial.save();
    } else if (req.body.deleteImage === 'true') {
        if (updatedTestimonial.image && updatedTestimonial.image.filename) {
            await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`testimonial_images/${updatedTestimonial.image.filename}`]);
        }
        updatedTestimonial.image = undefined;
        await updatedTestimonial.save();
    }

    res.redirect('/updating/testimonial/view');
});

module.exports.deleteTestimonial = catchAsync(async (req, res) => {
    const { id } = req.params;
    const deletedTestimonial = await Testimonial.findById(id);

    if (!deletedTestimonial) {
        return res.status(404).render('error', { message: 'Testimonial not found.' });
    }

    if (deletedTestimonial.image && deletedTestimonial.image.filename) {
        await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`testimonial_images/${deletedTestimonial.image.filename}`]);
    }

    await Testimonial.findByIdAndDelete(id);
    res.redirect('/updating/testimonial/view');
});

module.exports.deleteBatchTestimonial = catchAsync(async (req, res) => {
    const { ids } = req.body;
    if (ids && ids.length > 0) {
        const testimonials = await Testimonial.find({ _id: { $in: ids } });
        for (const testimonial of testimonials) {
            if (testimonial.image && testimonial.image.filename) {
                await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`testimonial_images/${testimonial.image.filename}`]);
            }
        }
        await Testimonial.deleteMany({ _id: { $in: ids } });
    }
    res.redirect('/updating/testimonial/view');
});

module.exports.renderDeleteTestimonial = catchAsync(async (req, res) => {
    const testimonials = await Testimonial.find({});
    res.render('inputs/updatingTestimonials', { data: testimonials, action: 'delete', currentPage: 'update-testimonials' });
});

module.exports.uploadWithErrorHandler = uploadWithErrorHandler;
