const mongoose = require('mongoose');
const slugify = require('slugify');

const satiSchema = new mongoose.Schema({

  type: {
    type: String,
    enum: ['like', 'dislike'],
    required: [true, 'An comment must have a type']
  },

  comment: {
    type: String,
    required: [true, 'An comment must have a description']
  },

  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'post comment belong to user']
  }
});



satiSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name'
  });
  next();
});

const Satisf = mongoose.model('Satisf', satiSchema);

module.exports = Satisf;
