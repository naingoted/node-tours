const express = require('express');
const reviewController = require('./../controllers/reviewsControllers');
const authController = require('./../controllers/authControllers');

// merge /:tour/reviews or /reviews 
const router = express.Router({ mergeParams: true });

router.use(authController.protect);


router
.route('/')
.get(reviewController.getAllReviews)
.post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
)

router
.route('/:id')
.patch(authController.restrictTo('user','admin'), reviewController.updateReview)
.delete(authController.restrictTo('user','admin'), reviewController.deleteReview)


module.exports = router;