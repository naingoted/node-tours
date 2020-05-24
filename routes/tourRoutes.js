const express = require('express');
const tourController = require('./../controllers/tourControllers');
const authController = require('./../controllers/authControllers');
const reviewRouter = require('./reviewRoutes')
const router = express.Router();

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews

router.use('/:tourId/reviews', reviewRouter);

// router.param('id', tourController.checkID);
router.route('/top-5-cheap')
.get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats')
.get(tourController.getTourStats);
// tours/monthly-plan/2021
router.route('/monthly-plan/:year')
.get(tourController.getMonthlyPlans);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursRadius);
router.route('/distances/:latlng/unit/:unit').get(tourController.getToursNearby);
router.route('/')
.get(authController.protect, tourController.getAllTours)
.post(tourController.createTour);


router.route('/:id')
.get(tourController.getTour)
.patch(tourController.updateTour)
.delete(authController.protect, authController.restrictTo('admin', 'lead-guide'),tourController.deleteTour);

module.exports = router;