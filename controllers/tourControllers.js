const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('../util/apiFeatures') 

exports.aliasTopTours = async (req,res, next) => {
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