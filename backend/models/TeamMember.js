const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team member name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true,
    maxlength: [100, 'Role cannot exceed 100 characters']
  },
  workDetail: {
    type: String,
    required: [true, 'Work detail is required'],
    trim: true
  },
  theme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theme',
    required: [true, 'Team member must be linked to a theme']
  },
  image: {
    type: String,
    default: null
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
teamMemberSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

teamMemberSchema.index({ theme: 1 });

module.exports = mongoose.model('TeamMember', teamMemberSchema);

