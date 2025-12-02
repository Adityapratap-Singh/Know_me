const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },

    phone: {
      type: String,
      required: false,
      validate: {
        validator: function (v) {
          if (!v) return true; // optional phone number

          const cleaned = v.replace(/\D/g, '');

          return /^\d{10}$/.test(cleaned);
        },
        message: props => `${props.value} is not a valid 10-digit phone number!`
      }
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: [5, "Message must be at least 5 characters"]
    },

    attachment: {
      url: String,
      filename: String
    }
  },
  { timestamps: true }
);

// ⭐ Auto-add +91 if no country code is provided
contactSchema.pre('save', function () {
  if (this.phone) {
    let cleaned = this.phone.replace(/\D/g, '');

    // If phone is not 10 digits, do not format
    if (cleaned.length !== 10) {
      return;
    }

    const defaultCode = "+91";

    // Add default +91
    cleaned = defaultCode + cleaned;

    this.phone = cleaned;
  }
});

module.exports = mongoose.model('Contact', contactSchema);
