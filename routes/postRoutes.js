const express = require('express');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');
const commentController = require('../controllers/commentController');

// Create a router for post routes
const router = express.Router();

router.route('/search/:name').get(postController.search);

router.get('/getMyPosts', authController.protect, postController.getMyPosts);

router
  .route('/')
  .get(postController.getAllPosts)
  .post(
    authController.protect,
    postController.uploadPostPhoto,
    postController.resizePostPhoto,
    postController.createPost
  );

router
  .route('/:id')
  .get(postController.getPost)
  .patch(authController.protect, postController.updatePost)
  .delete(authController.protect, postController.deletePost);

//Comments Routes
router
  .route('/:postId/comments')
  .post(authController.protect, commentController.createComment)
  .get(commentController.getAllComments);

router
  .route('/:postId/:commentId')
  .patch(authController.protect, commentController.updateComment)
  .delete(authController.protect, commentController.deleteComment);

//like and unlike a post
router.route('/:postId/like').put(authController.protect, postController.like);

module.exports = router;
