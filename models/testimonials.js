const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const testimonialSchema = new Schema({
    image: {
        url: String,
        filename: String
    },
    name: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    testimonial: { type: String, required: true, trim: true },
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
