const Testimonial = require('../models/testimonials');
const supabase = require('../supabase');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const uploadWithErrorHandler = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Uh oh, a file upload error occurred:', err);
            return res.status(500).render('error', { message: 'We had trouble uploading your image. Please try again!' });
        }
        next();
    });
};

module.exports.renderAddTestimonialForm = (req, res) => {
    try {
        res.render('inputs/updatingTestimonials', { action: 'add', currentPage: 'update-testimonials' });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Failed to load add testimonial form.' });
    }
};

module.exports.addTestimonial = async (req, res) => {
    try {
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
        res.redirect('/updating/testimonial/view');
    } catch (err) {
        console.error('Error adding testimonial:', err);
        res.status(500).render('error', { message: 'Failed to add testimonial.' });
    }
};

module.exports.renderEditTestimonialForm = async (req, res) => {
    try {
        const { id } = req.params;
        const foundTestimonial = await Testimonial.findById(id);
        if (!foundTestimonial) {
            return res.status(404).render('error', { message: 'Testimonial not found.' });
        }
        res.render('inputs/updatingTestimonials', { data: foundTestimonial, action: 'edit', currentPage: 'update-testimonials' });
    } catch (err) {
        console.error('Error rendering edit testimonial form:', err);
        res.status(500).render('error', { message: 'Failed to load edit testimonial form.' });
    }
};

module.exports.updateTestimonial = async (req, res) => {
    try {
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
    } catch (err) {
        console.error('Error updating testimonial:', err);
        res.status(500).render('error', { message: 'Failed to update testimonial.' });
    }
};

module.exports.deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTestimonial = await Testimonial.findByIdAndDelete(id);

        if (!deletedTestimonial) {
            return res.status(404).render('error', { message: 'Testimonial not found.' });
        }

        if (deletedTestimonial.image && deletedTestimonial.image.filename) {
            await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([`testimonial_images/${deletedTestimonial.image.filename}`]);
        }

        res.redirect('/updating/testimonial/view');
    } catch (err) {
        console.error('Error deleting testimonial:', err);
        res.status(500).render('error', { message: 'Failed to delete testimonial.' });
    }
};

module.exports.viewTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({});
        res.render('inputs/updatingTestimonials', { data: testimonials, action: 'delete', currentPage: 'update-testimonials' });
    } catch (err) {
        console.error('Error viewing testimonials:', err);
        res.status(500).render('error', { message: 'Failed to retrieve testimonials.' });
    }
};

module.exports.uploadWithErrorHandler = uploadWithErrorHandler;