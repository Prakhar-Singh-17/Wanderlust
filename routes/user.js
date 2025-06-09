import express from "express";
const router = express.Router({ mergeParams: true });
import CustomError from "../utils/CustomError.js";
import passport from "passport";
import User from "../models/user.js";
import { isLoggedIn, saveRedirectUrl } from "../middlewares.js";

router.get("/signup", (req, res) => {
  res.render("user/signup");
});

router.post("/signup", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    let user = new User({ username: username, email: email });
    let registeredUser = await User.register(user, password);
    req.flash("success", `Welcome to Wanderlust ${username}`);
    res.redirect("/listing");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/user/signup");
  }
});

router.get("/login", (req, res) => {
  res.render("user/login");
});


//Saving in res.locals since passport clears all the session variables after successful authentication of a user
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/user/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome Back to Wanderlust"); 
    res.redirect(res.locals.redirectUrl || "/listing");
  }
);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "You have been successfully logged out");
    res.redirect("/listing");
  });
});

export { router as user };
