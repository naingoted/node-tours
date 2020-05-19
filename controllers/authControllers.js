const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    if(process.env.NODE_ENV === "production") cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });
    createSendToken(newUser, 201, res);
})

exports.login = catchAsync(async (req, res, next) => {

    const { email, password } = req.body;   

    // 1) check if email and password exists
    if ( !email || !password) return next(new AppError('Please provide email and password!', 400))
    // 2) check if user exists and password is correct
    const user = await User.findOne({email : email}).select('+password');
    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }
    // 3) if everything is correct, send token to client
    createSendToken(user, 201, res);
})

exports.protect = catchAsync(async (req, res, next) => {
    // getting token and check if it's exist
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token){
        return next(
            new AppError('You are not logged in!',  401)
        )
    }
    // console.log("token",token);
    // verfication token
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(decode);
    // check if user still exists
    const currentUser = await User.findById(decode.id)
    if(!currentUser) {
        return next(
            new AppError('user no longer exists',401)
        )
    }
    // check if user already changed password
    const passwordChanged = await currentUser.changedPassword(decode.iat)
    if(passwordChanged) {
        return next (
            new AppError('password changed, please login again.',401)
        )
    }
    // grant access to protected routes.
    next()
})