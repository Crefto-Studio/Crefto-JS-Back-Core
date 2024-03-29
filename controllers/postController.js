const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const Post = require('../models/postModel');
const catchAsync = require('../utils/catchAsync');
const {uploadFile} = require('../utils/s3')

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadPostPhoto = upload.single('postImg');

exports.resizePostPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `post-${req.user.id}-${Date.now()}.jpeg`;

  req.file.buffer = await sharp(req.file.buffer)
    .resize(1000, 1000)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer();

    await uploadFile(req.file,'posts')


  next();
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Post.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const posts = await features.query;

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: {
      posts
    }
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  /************************** */

  if (!req.body.user) req.body.user = req.user.id;

  const newPost = await Post.create({
    name: req.body.name,
    type: req.body.type,
    description: req.body.description,
    ratingsAverage: req.body.ratingsAverage,
    postImg: req.file.filename,
    user: req.user.id
  });

  res.status(201).json({
    status: 'success',
    data: {
      post: newPost
    }
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  // .populate('reviews');
  // .populate({ path: 'user', select: 'name' });

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    likesNumber: post.likes.length,
    data: {
      post
    },
    displayAmountInStock: post.amountInStock === 0 ? 'No Posts' : 'Okay'
  });
});

//getMyPosts
exports.getMyPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find({ user: req.user.id });

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: posts
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    // The new updated document is the one that will be returned
    new: true,
    // Each time we update the document the validators that we specified in the schema will run again
    runValidators: true
  });

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    likesNumber: post.likes.length,
    data: {
      post
    }
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.search = catchAsync(async (req, res, next) => {
  const post = req.params.name;
  const regex = new RegExp(post, 'i');
  const result = await Post.find({ name: regex });

  if (!post) {
    return next(new AppError('There is no post with that name.', 404));
  }

  res.status(200).json({
    status: 'success',
    //likesNumber: result.likes.length,
    data: {
      result
    }
  });
});

exports.like = catchAsync(async (req, res, next) => {
  //1) find post ID
  const post = await Post.findById(req.params.postId);
  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }
  //2) check if current user liked this post or not
  //3) if no -> like post
  if (!post.likes.includes(req.user.id)) {
    const likedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $push: { likes: req.user.id }
      },
      {
        // The new updated document is the one that will be returned
        new: true,
        // Each time we update the document the validators that we specified in the schema will run again
        runValidators: true
      }
    );
    res.status(200).json({
      status: 'success',
      likes: likedPost.likes.length,
      data: {
        post: likedPost
      }
    });
  }
  //4) if yes -> unlike post
  else {
    const UnLikedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $pull: { likes: req.user.id }
      },
      {
        // The new updated document is the one that will be returned
        new: true,
        // Each time we update the document the validators that we specified in the schema will run again
        runValidators: true
      }
    );
    res.status(200).json({
      status: 'success',
      likes: UnLikedPost.likes.length,
      data: {
        post: UnLikedPost
      }
    });
  }
});
