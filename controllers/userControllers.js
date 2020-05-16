const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures') 
const catchAsync = require('../utils/catchAsync') 

exports.getAllUsers = catchAsync(async (req, res) => {
    const features = new APIFeatures(req.query, User.find()).filter().sort().limitFields().paginate()
    const users = await features.query;
    res.status(201).json({
        status: 'successs',
        results: users.length,
        data: {
            users
        }
    });
})

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });  
}

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });  
}

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });  
}

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });  
}