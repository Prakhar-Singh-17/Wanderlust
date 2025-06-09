import express from "express";
const router = express.Router({mergeParams : true});
import Listing from "../models/listing.js";
import Review from "../models/review.js";
import CustomError from "../utils/CustomError.js";
import { isLoggedIn, isReviewAuthor } from "../middlewares.js";
import { validateReview } from "../middlewares.js";

router.post("/:id" ,isLoggedIn,validateReview , async(req,res,next)=>{
  try{
  let {id} = req.params;
  console.log(id);
  let listing = await Listing.findById(id);
  let reviewData = req.body;
  let newReview = new Review({...reviewData});
  newReview.author = req.user._id;
  await newReview.save();
  listing.reviews.push(newReview);
  await listing.save();
  res.redirect(`/listing/${id}`);
  }
  catch(err){
     next(new CustomError(400, "Review POst"+err.message));
  }
});

router.delete("/:listingId/:reviewId",isLoggedIn,isReviewAuthor,async (req,res)=>{
  let reviewId = req.params.reviewId;
  let listingId = req.params.listingId
  await Listing.findByIdAndUpdate(listingId , {$pull : {reviews : reviewId}});
  Review.findByIdAndDelete(reviewId)
  .then((res)=>{
    console.log(res);
  })
  .catch((err)=>{
    console.log(err);
  })
  res.redirect(`/listing/${listingId}`);
});


export { router as reviews};

