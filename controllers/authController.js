const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const Hogan = require('hogan.js');
const fs = require('fs');



const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 86400000
    ),
    httpOnly: true
  };

  res.cookie('AuthTokenCookie', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

//////////////////////////////////////////////////////////  signup ////////////////////////////////////////////
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });

  // Create the token, the argument given to the signToken function is the payload so the data we want to store inside the token
  createSendToken(newUser, 201, req, res);

  /// send welcome mail to new user

  let paramters ={
    user_firstname :req.body.name
  }

  try {
    var emailtemp = fs.readFileSync('./views/welcome.hjs', 'utf8');
    var emailcomp = Hogan.compile(emailtemp)

    await sendEmail({
       email: req.body.email,
       subject: 'Welcome | Crefto Studio',
       html: emailcomp.render(paramters)
     });
  
  } catch (err) {
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }


});
//////////////////////////////////////////////////////////  login ////////////////////////////////////////////
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3) If everything ok, send token to client
  // createSendToken(user, 200, res);

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});
//////////////////////////////////////////////////////////  logout ////////////////////////////////////////////
exports.logout = (req, res) => {
  // req.logout();
  res.cookie('AuthTokenCookie', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};
////////////////////////////////////////////  Give ACCESS to a PROTECTED ROUTE ////////////////////////////////
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log(token);

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists

  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        'THe user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTE(the one that sends the data that is protected)
  // put the entire user data on the request
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']   currentUser role = 'user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
//////////////////////////////////////////////////////////  forgotPassword ////////////////////////////////////////////
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) Sengmaild it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

    
  let paramters ={
    confirm_link:resetURL,
    user_firstname :user.name
  }

  try {
    var emailtemp = fs.readFileSync('./views/emailreset.hjs', 'utf8');
    var emailcomp = Hogan.compile(emailtemp)

    await sendEmail({
       email: user.email,
       subject: 'Account Recovery - Reset Password | Crefto Studio',
       html: emailcomp.render(paramters)
     });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExspires = undefined;
    await user.save({ validateBeforeSave: false });
    //console.log(err);
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});
//////////////////////////////////////////////////////////  resetPassword ////////////////////////////////////////////
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  // console.log("im here")
  // console.log(req.body)
  // console.log(req.params.token)
  

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  // console.log(user);
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    // return next(new AppError('Token is invalid or has expired', 400));
    res.status(200).render('ews',{ stat:false})
    return 0 ;
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.PasswordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  const token = signToken(user._id);

  res.status(200).render('ews',{ stat:true});
});
/////////////////////////////////////////// update password /////////////////////////////////////////////////////////
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});
