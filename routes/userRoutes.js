const express = require('express');
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false})

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const satisficationController = require('../controllers/satisficationController');

// Create a router for user routes
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.get('/resetPassword/:token', (req, res) => {
  res.status(200).render('reset',{ token:req.params.token});
});


router.post('/resetPassword/:token',urlencodedParser,authController.resetPassword);


router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser
);
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.patch(
  '/updateMe',
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);


  
router
.route('/sats')
.get(satisficationController.getAllSats)
.post(authController.protect,satisficationController.createSats);


router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);


module.exports = router;
