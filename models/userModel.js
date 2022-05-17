const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please tell us your name!']
  },

  email: {
    type: String,
    trim: true,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },

  photo: {
    type: String,
    default: 'default.jpg'
  },

  role: {
    required: false,
    type: String,
    enum: ['user', 'business-Account', 'admin'],
    default: 'user'
  },

  birthday: {
    required: false,
    type:Date,
    default: undefined
  },

  regdate:{
    type:Date,
    default:Date.now()
  },

  phone: {
    required: false,
    type:String,
    validate : [validator.isMobilePhone, 'please provide a valid phone'],
    default:undefined
  },

  gender:{
    required: false,
    type: String,
    enum: ['male', 'female', 'PNTS'],
    default:undefined
  },

  facebook:{
    required: false,
    type:String,
    default: undefined,
    validate : [validator.isURL,'please provide a valid url']  
  },

  address:{
    required: false,
    type:String,
    default: undefined
  },

  bio: {
    required: false,

    type:String,
    default: undefined
  },

  interest: {
    required: false,
    type: String,
    default: undefined
  },
  password: {
    type: String,
    required: [true, 'Please provide a valid password'],

    minlength: [
      8,
      'A user password must have more than or equal to 8 characters'
    ],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please  confirm your password'],
    validate: {
      // This only works on CREATE and Save!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date,

  passwordResetToken: String,
  passwordResetExpires: Date
});
// ====================
// Password encryption
// ====================
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  //   Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //   Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// Comparing the password with the one stored in the database by creating an instance method(basically a message that is available on all documents of a certain collection)
userSchema.methods.correctPassword = async function(
  // candidatePassword: the password that the user passes in the body, userPassword is the encrypted password stored in the db
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  //console.log('hello from inside the user schema');
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema); //name is User and create it out of the user schema

module.exports = User;
