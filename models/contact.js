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

          // Remove spaces, dashes, brackets
          const cleaned = v.replace(/[\s\-()]/g, '');

          // Accepts:
          // +91XXXXXXXXXX
          // 91XXXXXXXXXX
          // XXXXXXXXXX (auto prepends +91)
          return /^(\+?\d{8,15})$/.test(cleaned);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: [5, "Message must be at least 5 characters"]
    }
  },
  { timestamps: true }
);

// ⭐ Auto-add +91 if no country code is provided
contactSchema.pre('save', function (next) {
  if (this.phone) {
    let cleaned = this.phone.replace(/[\s\-()]/g, '');

    const defaultCode = "+91";

    // If phone doesn't start with +
    if (!cleaned.startsWith('+')) {
      // If starts with 91, add +
      if (cleaned.startsWith("91")) {
        cleaned = "+" + cleaned;
      } else {
        // Otherwise: add default +91
        cleaned = defaultCode + cleaned;
      }
    }

    this.phone = cleaned;
  }

  next();
});

module.exports = mongoose.model('Contact', contactSchema);
