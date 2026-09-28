const mongoose = require('mongoose');

const accountSettingsSchema = new mongoose.Schema({
  tradingSegment: { type: String, default: 'equity' },
  orderType: { type: String, default: 'limit' },
  orderConfirmation: { type: Boolean, default: true },
  orderNotifications: { type: Boolean, default: true },
  priceAlerts: { type: Boolean, default: true },
  accountNotifications: { type: Boolean, default: true },
  theme: { type: String, default: 'light' },
  compactView: { type: Boolean, default: false },
  loginAlerts: { type: Boolean, default: true },
  twoFactor: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    default: '',
    trim: true
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  accountStatus: {
    type: String,
    enum: ['Active', 'Suspended', 'Pending'],
    default: 'Active'
  },
  accountSettings: {
    type: accountSettingsSchema,
    default: () => ({})
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
