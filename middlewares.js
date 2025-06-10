import { listingSchemaValidation } from "./models/schemaValidation.js";
import { reviewSchemaValidation } from "./models/schemaValidation.js";
import Listing from "./models/listing.js";
import Review from "./models/review.js";
import CustomError from "./utils/CustomError.js";

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "Please login to perform this action");
    return res.redirect("/user/login");
  }
}

//Saving in res.locals since passport clears all the session variables after successful authentication of a user

function saveRedirectUrl(req, res, next) {
  res.locals.redirectUrl = req.session.redirectUrl;
  next();
}

async function isOwner(req, res, next) {
   let { id } = req.params;
  let listingData = await Listing.findById(id);
  if (!listingData.owner.equals(res.locals.activeUser._id)) {
    req.flash("error", "You are not the owner!!");
    return res.redirect(`/listing/${id}`);
  }
  next();
}

async function isReviewAuthor(req, res, next) {
   let {listingId, reviewId } = req.params;
  let reviewData = await Review.findById(reviewId);
  if (!reviewData.author.equals(res.locals.activeUser._id)) {
    req.flash("error", "You are not the Author of this review!!");
    return res.redirect(`/listing/${listingId}`);
  }
  next();
}


function validateListing(req, res, next) {
  const { error } = listingSchemaValidation.validate(req.body);
  if (error) {
    return next(new CustomError(400, error.details[0].message));
  }
  next();
}

function validateReview(req, res, next) {
  const { error } = reviewSchemaValidation.validate(req.body);
  if (error) {
    return next(new CustomError(400, error.details[0].message));
  }
  next();
}

export { isLoggedIn,isOwner,isReviewAuthor, saveRedirectUrl, validateListing, validateReview };
