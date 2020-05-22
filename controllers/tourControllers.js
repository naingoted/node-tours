const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures') 
const catchAsync = require('../utils/catchAsync') 
const factory = require('./handlerFactory')

exports.aliasTopTours = (req,res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,duration,difficulity'
    next();
}

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour);

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res) => {
    console.log("getting tour stats")
    const stats = await Tour.aggregate([
        { $match: { ratingsAverage: { $gte: 4.5 }}},
        { $group: { 
            _id: '$difficulty' ,
            numTours: {$sum : 1},
            avgRatings: { $avg: '$ratingsAverage'},
            numRatings: { $sum: '$ratingsQuantity'},
            avgPrice: { $avg: '$price'},
            minPrice: { $min: '$price'},
            maxPrice: { $max: '$price'}
        }},
        {
            $sort: {
                avgPrice: -1
            }
        }
    ])
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });  
})
exports.getMonthlyPlans = catchAsync(async (req, res) => {
    const year = req.params.year * 1;
    console.log("monthly plan: year", year );
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {$match: {startDates:{
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
        }}},
        {
            $group: {
                _id: {$month : '$startDates'},
                numTourStarts : { $sum: 1},
                tours: {$push: { name: '$name', secretTour: "$secretTour" }},
                    
            }
        },
        {
            $addFields: { month: '$_id'}
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ])
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });  
})