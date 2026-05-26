const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },

  displayName: String,

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  language: String,

  company: {
    name: String,
    legalName: String,
    email: String,
    phone: String,
    website: String,
    gst: String,
    logo: String,

    address: {
      line1: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    }
  }

});

module.exports = mongoose.model("User", userSchema);