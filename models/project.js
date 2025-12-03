const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectsSchema = new Schema({
    category: {
        type: String,
        required: true,
        trim: true,
        enum: ['Web design', 'Applications', 'Web development', 'Web Development']
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    link: {
        type: String,
        trim: true
    },
    image: {
        url: String,
        filename: String
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    technologies: {
        type: [String],
        required: true,
        validate: {
            validator: function(value) {
                return value.length > 0;
            },
            message: 'At least one technology is required.'
        }
    },
    strengths: { type: [String], default: [] },
    context: { type: String, trim: true },
    role: { type: String, trim: true },
    approach: { type: String, trim: true },
    outcome: { type: String, trim: true },
    isVisible: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Project', projectsSchema);
