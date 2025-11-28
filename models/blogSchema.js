const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    summary: {
        type: String,
        required: true
    },
    content: {
        type: String,  // Main blog content (manual posts)
        default: ""
    },
    linkedinUrl: {
        type: String,  // URL of linked LinkedIn post
        default: ""
    },
    thumbnail: {
        type: String,  // Image URL
        default: ""
    },
    tags: {
        type: [String], 
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Blog", BlogSchema);
