const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can\'t be empty']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour.']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user.']
        }
    },
    {
        toJSON: { virtuals: true},
        toObject: {virtuals: true}
    }
);

// index schema, one user can rate one tour one time only
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// prepopulate
reviewSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'tour',
//     select: 'name'
//   }).populate({
//     path: 'user',
//     select: 'name photo'
//   });
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
})

// avg ratings
// reviewSchema.statics.calcAverageRatings = async function(tourId) {
    
// }

// calculate avg rating for tour before save

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    // console.log(this.r);
    next();
  });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;