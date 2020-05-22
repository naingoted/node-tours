const mongoose = require('mongoose');
const crypto = require('crypto');
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
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
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
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

// before save .pre
userSchema.pre('save', async function(next){
    // check if the password is modified in the updated
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next()
})
userSchema.pre('save', async function(next){
    if(!this.isModified('password') || this.isNew) return next();
    
    this.passwordChangedAt = Date.now() - 1000;
    next()
})
// only show user with active roles
userSchema.pre(/^find/, async function(next){
    this.find({  active: {$ne: false}})
    next();
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

userSchema.methods.generatePassResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log({ resetToken }, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10*60*1000; // 10 minutes
    return resetToken;
}

const User = mongoose.model('User', userSchema);


module.exports = User;