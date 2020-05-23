const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    if(!doc) {
        return next(new AppError('No document found with that ID'))
    }
    res.status(204).json({
        status: 'success',
        data: null
    })
}) 

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if(!doc) {
        return next(new AppError('No document found with that ID'))
    }
    res.status(200).json({
        status: 'success',
        data: {
            data : doc
        }
    })
})

exports.createOne = Model => catchAsync(async (req, res) => {
    const newDoc = await Model.create(req.body)
    res.status(201).json({
        status: 'success',
        data: {
            data: newDoc
        }
    });
})

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }
    res.status(201).json({
        status: 'success',
        data: {
            data : doc
        }
    });

})

exports.getAll = Model => catchAsync(async (req, res) => {
    if(req.query.page) {
        const numDocs = await Model.countDocuments();
        if (skip >= numDocs) throw new Error('this page doesn\'t exist');
    } 
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(req.query, Model.find(filter)).filter().sort().limitFields().paginate()
    const docs = await features.query;
    // const docs = await features.query.explain();
    res.status(201).json({
        status: 'successs',
        results: docs.length,
        data: {
            data : docs
        }
    });
});