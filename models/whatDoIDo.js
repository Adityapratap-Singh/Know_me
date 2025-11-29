const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const whatDoIDoSchema = new Schema({
    icon: {
        url: String,
        filename: String
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
});

module.exports = mongoose.model('WhatDoIDo', whatDoIDoSchema);
