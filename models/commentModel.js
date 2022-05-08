const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'A comment must have a content']
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A comment must have an author']
    },
    authorName: {
      type: String,
      required: [true, 'A comment must have an author name']
    },
    authorPhoto: {
      type: String,
      required: [true, 'A comment must have an author photo']
    }
  },
  { timestamps: true }
);
//TODO: add populate here
commentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'name'
  });
  next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
