const express = require('express');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

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

module.exports = router;
