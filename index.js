import 'dotenv/config';
import express from "express";
import ejs from "ejs";
import ejsMate from "ejs-mate";
import mongoose, { mongo } from "mongoose";
import methodOverride from "method-override";
import path from "path";
import { fileURLToPath } from "url";
import {listing } from "./routes/listing.js";
import { reviews } from "./routes/review.js";
import { user } from "./routes/user.js";
import session, { Cookie } from "express-session";
import MongoStore from 'connect-mongo'
import flash from "connect-flash";
import passport from "passport";
import LocalStrategy from "passport-local";
import User from "./models/user.js";

const app = express();
const port = 8080;
const Mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

const cloudDbUrl = process.env.ATLASDB_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

//MongoStore
const store = MongoStore.create({
  mongoUrl: cloudDbUrl,
  crypto: {
    secret: process.env.SECRET
  },
  touchAfter : 7*24*60*60*1000,
})

//Session
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  Cookie : {
    expires : Date.now() + 7*24*60*60*1000,
    maxAge : 7*24*60*60*1000,
    httpOnly: true,
  }
}
app.use(session(sessionOptions));



//Passport - Authentication and Authorization

app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy

passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Flash

app.use(flash());

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.activeUser = req.user;
  next();
});



app.use("/user",user);

//Listings

app.use(["/", "/listing"], listing);

//Reviews

app.use("/listing/review",reviews);


//Extras

app.use((err, req, res, next) => {
  let error = err.message;
  res.render("errors/error", { error });
});

// app.use((req, res, next) => {
//   console.log(req.method, req.hostname, req.url);
//   next();
// });


mongoose
  .connect(cloudDbUrl)
  .then((res) => {
    console.log("Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, "0.0.0.0", () => {
  console.log("Listening to port ", port);
});
