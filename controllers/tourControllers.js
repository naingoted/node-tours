const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('../util/apiFeatures') 

exports.aliasTopTours = (req,res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,duration,difficulity'
    next();
}

exports.getAllTours = async (req, res) => {
    try {

        if(req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours) throw new Error('this page doesn\'t exist');
        } 
        const features = new APIFeatures(req.query, Tour.find()).filter().sort().limitFields().paginate()
        const tours = await features.query;
        res.status(201).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        });
    } catch (error) {
        res.status(401).json({
            status: 'fail',
            message: error
        })
    }
}

exports.getTour = async (req, res) => {
    // const id = req.params.id * 1;
    // const tour = tours.find(el => el.id === id);
    try {
        const tour = await Tour.findById(req.params.id, (x) => console.log(x))

        res.status(201).json({
            status: 'success',
            data: {
                tour
            }
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        })
    }

}

exports.createTour = async (req, res) => {

    try {
        const newTour = await Tour.create(req.body)
        res.status(201).json({
            status: 'success',
            data: {
                newTour
            }
        });
    } catch (error) {
        res.status(401).json({
            status: 'fail',
            message: error
        }) 
    }

}

exports.updateTour = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        }) 
    }
}

exports.deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndDelete(req.params.id)
        // watch out for 204 , it return blank page
        res.status(204).json({
            status: 'success',
            data: null
        });  
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        }) 
    }

}

exports.getTourStats = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        }) 
    }
}
exports.getMonthlyPlans = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        }) 
    }
}