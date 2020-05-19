const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        require: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    password: {
        type: String,
        require: [true, 'please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        require: [true, 'please confirm you password'],
        validate: {
            validator: function(el) {
                return el == this.password
            },
            message: 'please enter the same password'
        }
    },
    passwordChangedAt: Date
})

// before save .pre
userSchema.pre('save', async function(next){
    // check if the password is modified in the updated
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next()
})

userSchema.methods.correctPassword = async function(
    candidatePassword, userPassword
){
    return await bcrypt.compare(candidatePassword, userPassword);
}
userSchema.methods.changedPassword = async function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(
            this.passwordChangedAt.getTime() / 1000, 10
        )
        return JWTTimestamp < changedTimeStamp
    }
    return false;
}
const User = mongoose.model('User', userSchema);


module.exports = User;