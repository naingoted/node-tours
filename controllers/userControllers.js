const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures') 
const catchAsync = require('../utils/catchAsync') 
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}
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

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsync(async (req, res, next) => {
    if(req.body.passwordCurrent || req.body.password) {
        return next(
            new AppError('This route doesn\'t support password update', 401)
        )
    }
    // 2 filter out unwanted fields
    const filterBody = filterObj(req.body, 'name', 'email');

    const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new: true, runValidators: true
    })
    res.status(200).json({
        status: 'success',
        data: {
            user: updateUser
        }
    });  
})

exports.deleteMe = catchAsync(async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});
    res.status(204).json({
        status: 'success',
        data: null
    });  
})
exports.createUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not defined! Please use /signup instead'
    });
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);