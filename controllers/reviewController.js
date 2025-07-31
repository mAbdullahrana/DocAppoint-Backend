const Review = require("../models/reviewModel");
const catchAsync = require("../util/catchAsync");
const AppError = require("../util/appError");

exports.createReview = catchAsync(async (req, res, next) => {
  console.log("req.body", req.body);
  const {patient , appointment} = req.body

  const isAllReviews = await Review.find({patient , appointment})

  if(isAllReviews.length > 0){
    return next(new AppError("You have already reviewed this appointment", 400));
  }
  const review = await Review.create(req.body);

  if (!review) {
    return next(new AppError("Review not created", 400));
  }
  res.status(201).json({
    status: "success",
    review,
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const {appointmentID} = req.params
  const review = await Review.find({appointment: appointmentID}).populate("patient").populate("doctor")
  if(!review){
    return next(new AppError("Review not found", 404));
  } 
  res.status(200).json({
    status: "success",
    review,
  });

});
