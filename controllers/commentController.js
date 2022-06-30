const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Comment = require('../models/commentModel');
const Post = require('../models/postModel');

exports.createComment = catchAsync(async (req, res, next) => {
  /************************** */

  if (!req.body.user) req.body.user = req.user.id;
  //get user from its id, then get its name
  //get the post with this postId
  const post = await Post.findById(req.params.postId);
  //check if the post is  exist or not
  if (!post) return next(new AppError('There is no post with that id.', 404));
  //create a new comment
  const newComment = await Comment.create({
    content: req.body.content,
    author: req.user.id
  });
  //adds an comment to the front of the array,
  post.comments.unshift(newComment);
  post.save();
  //response
  res.status(201).json({
    status: 'success',
    data: {
      comment: newComment
    }
  });
});

exports.getAllComments = catchAsync(async (req, res, next) => {
  //get the post with this postId and only select the comments
  // check if the post is  exist or not
  if (await Post.findById(req.params.postId)) {
    const comments = await Post.findById(req.params.postId)
      .select('comments')
      .populate('comments');
    //response
    res.status(200).json({
      status: 'success',
      results: comments.comments.length,
      data: {
        comments
      }
    });
  } else {
    return next(new AppError('There is no post with that id.', 404));
  }
});

exports.updateComment = catchAsync(async (req, res, next) => {
  //find post with that id
  if (await Post.findById(req.params.postId)) {
    //check if comment id belongs to this post
    const postComments = await Post.findById(req.params.postId).select(
      '-_id -user comments'
    );
    if (postComments.comments.indexOf(req.params.commentId) !== -1) {
      //make sure the current user is the owner of the comment
      //1) get current user id
      const currentUserId = req.user.id;
      //2) get the id of the author of the comment
      const comment = await Comment.findById(req.params.commentId);
      const authorId = comment.author.id;
      if (authorId === currentUserId) {
        const updatedComment = await Comment.findByIdAndUpdate(
          req.params.commentId,
          req.body,
          {
            // The new updated document is the one that will be returned
            new: true,
            // Each time we update the document the validators that we specified in the schema will run again
            runValidators: true
          }
        );
        //response
        res.status(200).json({
          status: 'success',
          data: {
            updatedComment
          }
        });
      } else {
        return next(
          new AppError(
            'You cannot update this comment, it is not belong to you.',
            404
          )
        );
      }
    } else {
      return next(
        new AppError(
          'This comment does not belong to this post or it does not exist',
          404
        )
      );
    }
  } else {
    return next(new AppError('There is no post with that id.', 404));
  }
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  //find post with that id
  if (await Post.findById(req.params.postId)) {
    //check if comment id belongs to this post
    const postComments = await Post.findById(req.params.postId).select(
      '-_id -user comments'
    );
    if (postComments.comments.indexOf(req.params.commentId) !== -1) {
      //make sure the current user is the owner of the comment
      //1) get current user id
      const currentUserId = req.user.id;
      //2) get the id of the author of the comment
      const comment = await Comment.findById(req.params.commentId);
      const authorId = comment.author.id;
      if (authorId === currentUserId) {
        //delete comment from post model
        const post = await Post.findByIdAndUpdate(
          req.params.postId,
          {
            $pull: { comments: req.params.commentId }
          },
          { new: true }
        );
        //delete comment from comment model
        const comment = await Comment.findByIdAndDelete(req.params.commentId);
        if (!comment) {
          return next(new AppError('No comment found with that ID', 404));
        }

        //response
        res.status(204).json({
          status: 'success',
          data: null
        });
      } else {
        return next(
          new AppError(
            'You cannot delete this comment, it is not belong to you.',
            404
          )
        );
      }
    } else {
      return next(
        new AppError(
          'This comment does not belong to this post or it does not exist',
          404
        )
      );
    }
    // }
  } else {
    return next(new AppError('There is no post with that id.', 404));
  }
});
