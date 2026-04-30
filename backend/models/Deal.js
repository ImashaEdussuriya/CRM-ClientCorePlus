const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  customer: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  value: {
    type: Number,
    required: [true, 'Deal value is required'],
    min: [0, 'Deal value cannot be negative']
  },
  stage: {
    type: String,
    enum: ['lead', 'proposal', 'negotiation', 'won', 'lost'],
    default: 'lead'
  },
  contact: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  expectedCloseDate: {
    type: Date
  },
  closedDate: {
    type: Date
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
dealSchema.pre('save', function() {
  this.updatedAt = Date.now();
  
  // Set closedDate when deal is won or lost
  if ((this.stage === 'won' || this.stage === 'lost') && !this.closedDate) {
    this.closedDate = Date.now();
  }
});

module.exports = mongoose.model('Deal', dealSchema);