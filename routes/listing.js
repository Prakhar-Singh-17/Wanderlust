import express from "express";
const router = express.Router({ mergeParams: true });
import Listing from "../models/listing.js";
import Review from "../models/review.js";
import CustomError from "../utils/CustomError.js";
import { isLoggedIn, isOwner, saveRedirectUrl } from "../middlewares.js";
import { validateListing } from "../middlewares.js";
import multer from "multer";
import { storage } from "../cloudConfig.js";
const upload = multer({ storage });

router.get("/", (req, res) => {
  Listing.find()
    .then((response) => {
      res.render("listing/listings", { listings: response });
    })
    .catch((err) => {
      res.send("Could not fetch data");
      console.log(err);
    });
});

router.get("/new", isLoggedIn, (req, res) => {
  res.render("listing/new");
});

router.get("/:id", async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  res.render("listing/view", { listing });
});

router.get("/edit/:id", isOwner, isLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("failure", "Listing not found");
      return res.redirect("/listing");
    }

    if (listing.image?.url) {
      listing.image.url = listing.image.url.replace(
        "/upload",
        "/upload/c_fill,w_200,h_150,q_auto,f_auto"
      );
    }

    res.render("listing/edit", { listing });
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("image"),
  validateListing,
  async (req, res, next) => {
    try {
      let { id } = req.params;
      let listing = await Listing.findByIdAndUpdate(id, req.body, {
        runValidators: true,
        new: true,
      });
      if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
      }
      req.flash("success", "Listing updated successfully");
      res.redirect(`/listing/${id}`);
    } catch (err) {
      next(new CustomError(400, err.message));
    }
  }
);

router.post(
  "/new",
  isLoggedIn,
  upload.single("image"),
  validateListing,
  async (req, res, next) => {
    try {
      let newListing = req.body;
      let url = req.file.path;
      let filename = req.file.filename;
      console.log(newListing);
      //Spread operator used to spread the details from the form to fit the Listing model
      let listing = new Listing({ ...newListing });
      listing.owner = req.user._id;
      listing.image = { url, filename };
      await listing.save();
      req.flash("success", "New Listing created");
      res.redirect("/listing");
    } catch (err) {
      next(new CustomError(400, err.message));
    }
  }
);

// router.post("/new",upload.single('image'),async(req,res)=>{
//   try{
//   res.send(req.file);
//   console.log(req.body);
//   }
//   catch(Err){
//     console.log(Err);
//   }

// });

router.delete("/:id", isLoggedIn, isOwner, async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndDelete(id);
  await Review.deleteMany({ _id: { $in: listing.reviews } });
  res.redirect("/listing");
});

export { router as listing };
