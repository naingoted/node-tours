const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures') 
const catchAsync = require('../utils/catchAsync') 

exports.aliasTopTours = (req,res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,duration,difficulity'
    next();
}

exports.getAllTours = catchAsync(async (req, res) => {
    if(req.query.page) {
        const numTours = await Tour.countDocuments();
        if (skip >= numTours) throw new Error('this page doesn\'t exist');
    } 
    const features = new APIFeatures(req.query, Tour.find()).filter().sort().limitFields().paginate()
    const tours = await features.query;
    res.status(201).json({
        status: 'successs',
        results: tours.length,
        data: {
            tours
        }
    });
});

exports.getTour = catchAsync(async (req, res) => {

    const tour = await Tour.findById(req.params.id, (x) => console.log(x))

    res.status(201).json({
        status: 'success',
        data: {
            tour
        }
    });

})

exports.createTour = catchAsync(async (req, res) => {
    const newTour = await Tour.create(req.body)
    res.status(201).json({
        status: 'success',
        data: {
            newTour
        }
    });
})

exports.updateTour = catchAsync(async (req, res) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})

exports.deleteTour = catchAsync(async (req, res) => {
    const tour = await Tour.findByIdAndDelete(req.params.id)
    // watch out for 204 , it return blank page
    res.status(204).json({
        status: 'success',
        data: null
    });  
})

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