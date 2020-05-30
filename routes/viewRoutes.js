const express = require('express');
const viewsController = require('../controllers/viewsControllers');
const authController = require('../controllers/authControllers');
const bookingController = require('../controllers/bookingControllers');
const router = express.Router();


router.use(viewsController.alerts);

router.get('/', authController.isLoggedIn,viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/forgot', authController.isLoggedIn, viewsController.getPasswordForgotForm);
router.get('/resetPassword/:token', authController.isLoggedIn, viewsController.getPasswordResetForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get(
    '/my-tours',
    authController.protect,
    viewsController.getMyTours
  );
// only for form post action data
router.post(
    '/submit-user-data',
    authController.protect,
    viewsController.updateUserData
);

module.exports = router;