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
    }
  },
  { timestamps: true }
);

commentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'name photo'
  });
  next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
