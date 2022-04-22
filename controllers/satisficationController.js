const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const Satisf = require('../models/satisficationModel');
const User = require('../models/userModel');
const Post = require('../models/postModel');
const catchAsync = require('../utils/catchAsync');


exports.getAllSats = catchAsync(async (req, res, next) => {

  const features = new APIFeatures(Satisf.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const Satisfs = await features.query;
  const users  = await User.countDocuments ();
  const posts = await Post.countDocuments ();
  const satisiedusers = await Satisf.countDocuments();
  
  res.status(200).json({
    status: 'success',
    satisfied: satisiedusers,
    users: users,
    photos: posts,
    data: {
      Satisfs
    }
  });
});

exports.createSats = catchAsync(async (req, res, next) => {
  /************************** */

  if (!req.body.user) req.body.user = req.user.id;

  //console.log(req.body);

  const newSatisf = await Satisf.create({
    type: req.body.type,
    comment: req.body.comment,
    user: req.user.id
  });


  res.status(201).json({
    status: 'success',
    data: {
      satisf: newSatisf
    }
  });
});


