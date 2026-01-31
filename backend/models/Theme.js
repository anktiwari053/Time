const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Theme name is required'],
    trim: true,
    maxlength: [200, 'Theme name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Theme description is required'],
    trim: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember'
  }],
  themeHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember',
    default: null,
    validate: {
      validator: function(value) {
        // If themeHead is set, it must be in the members array
        return !value || this.members.includes(value);
      },
      message: 'Theme head must be one of the theme members'
    }
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
themeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
themeSchema.index({ createdBy: 1 });
themeSchema.index({ projects: 1 });
themeSchema.index({ members: 1 });

module.exports = mongoose.model('Theme', themeSchema);

module.exports = mongoose.model('Theme', themeSchema);

