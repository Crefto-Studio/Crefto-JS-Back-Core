const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'An post must have a name'],
    unique: false
    // trim: true
  },

  type: {
    // auto draw ,gaugan , photo inhancer
    type: String,
    required: [true, 'An post must have a type']
  },

  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0']
  },

  description: {
    type: String,
    //   trim: true,
    required: [false, 'An post must have a description']
  },

  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'post must belong to user']
  },

  postImg: {
    type: String,
    required: [true, 'An post must have a photo']
  },
  slug: String,
  comments: [{ type: mongoose.Schema.ObjectId, ref: 'Comment' }],
  likes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }]
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
postSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

postSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name'
  });
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
