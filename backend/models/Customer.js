const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['Lead', 'Customer', 'VIP', 'Inactive'],
    default: 'Lead'
  },
  avatar: {
    type: String,
    default: function() {
      return this.name ? this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NA';
    }
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
customerSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Generate avatar from name if not provided
customerSchema.pre('save', function() {
  if (!this.avatar && this.name) {
    this.avatar = this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
});

module.exports = mongoose.model('Customer', customerSchema);
