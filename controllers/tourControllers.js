const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync') 
const factory = require('./handlerFactory')
const AppError = require('./../utils/appError');


exports.aliasTopTours = (req,res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,duration,difficulity'
    next();
}

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

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

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi

exports.getToursRadius = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    if (!lat || !lng) {
        next(
          new AppError(
            'Please provide latitute and longitude in the format lat,lng.',
            400
          )
        );
      }
    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius]}}
    });
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    }) 
    
})

exports.getToursNearby = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);
  
    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  });