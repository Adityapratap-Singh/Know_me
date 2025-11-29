const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This defines the structure for our 'Client' data.
// Think of it as a blueprint for how each client's information will be stored in our database.
const clientSchema = new Schema({
    // The client's name, which is absolutely required.
    name: {
        type: String,
        required: true,
        trim: true
    },
    // The client's logo, stored with its web address (URL) and a unique file name.
    logo: {
        url: String,
        filename: String
    },
    // The client's website address, if they have one.
    website: {
        type: String,
        trim: true
    },
    // A brief description about the client or the work done for them.
    description: {
        type: String,
        trim: true
    }
});

// We're making this schema available to other parts of our application
// under the name 'Client'.
module.exports = mongoose.model('Client', clientSchema);