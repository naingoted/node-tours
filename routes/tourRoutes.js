const express = require('express');
const tourController = require('./../controllers/tourControllers');
const authController = require('./../controllers/authControllers');
const router = express.Router();

// router.param('id', tourController.checkID);
router.route('/top-5-cheap')
.get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats')
.get(tourController.getTourStats);
// tours/monthly-plan/2021
router.route('/monthly-plan/:year')
.get(tourController.getMonthlyPlans);

router.route('/')
.get(authController.protect, tourController.getAllTours)
.post(tourController.createTour);


router.route('/:id')
.get(tourController.getTour)
.patch(tourController.updateTour)
.delete(tourController.deleteTour);

module.exports = router;