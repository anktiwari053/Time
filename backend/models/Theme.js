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
  primaryColor: {
    type: String,
    default: '#000000'
  },
  secondaryColor: {
    type: String,
    default: '#FFFFFF'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Theme must be linked to a project']
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
themeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
themeSchema.index({ project: 1 });

module.exports = mongoose.model('Theme', themeSchema);

