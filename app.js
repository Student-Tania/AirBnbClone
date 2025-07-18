if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore=require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const dbUrl = process.env.MONGO_URL;

async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}
main();


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error",()=>{
  console.log("ERROR in MONGO SESSION STORE",error)
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// app.get("/", (req, res) => {
//   res.send("Hii I am root");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//       email:"student@gmail.com",
//       username:"delta-user",
//     });
//     let registeredUser=await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// });

// const validateListing=(req,res,next)=>{
//       let {error} = listingSchema.validate(req.body);
//       if (error) {
//         let errMsg = error.details.map((el)=>el.message).join(",");
//         throw new ExpressError(400,errMsg);
//       }
//       else{
//         next();
//       }
// }

// const validateReview=(req, res, next) => {
//   let { error } = reviewSchema.validate(req.body);
//   if (error) {
//     let errMsg = error.details.map((el) => el.message).join(",");
//     throw new ExpressError(400, errMsg);
//   } else {
//     next();
//   }
// };

//index Route
// app.get("/listings",async(req,res)=>{
//     const allListings=await Listing.find({});
//     res.render("listings/index.ejs",{allListings});
// });

//New Route
// app.get("/listings/new", (req, res) => {
//   res.render("listings/new.ejs");
// });

//show route
// app.get("/listings/:id", async (req, res) => {
//   let { id } = req.params;
//   const listing = await Listing.findById(id).populate("reviews");
//   res.render("listings/show.ejs", { listing });
// });

//Create Route
// app.post("/listings",validateListing,wrapAsync(async (req, res,next) => {

//         const newListing = new Listing(req.body.listing);
//         await newListing.save();
//         res.redirect("/listings");
// }));

//edit route
// app.get("/listings/:id/edit", async (req, res) => {
//   let { id } = req.params;
//   const listing = await Listing.findById(id);
//   res.render("listings/edit.ejs", { listing });
// });

//update Route
// app.put("/listings/:id",validateListing,async (req, res) => {
//   let { id } = req.params;
//   await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//   res.redirect(`/listings/${id}`);
// });

//Delete Route
// app.delete("/listings/:id", async (req, res) => {
//   let { id } = req.params;
//   let deletedListing = await Listing.findByIdAndDelete(id);
//   console.log(deletedListing);
//   res.redirect("/listings");
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

//Reviews
//Post Review Route
// app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
//   let listing=await Listing.findById(req.params.id);
//   let newReview=new Review(req.body.review);
//   listing.reviews.push(newReview);

//   await newReview.save();
//   await listing.save();

//   res.redirect(`/listings/${listing._id}`);
// }));

// Delete Review Route

// app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
//   let {id,reviewId} = req.params;

//   await Listing.findByIdAndUpdate(id,{ $pull: {reviews:reviewId}});
//   await Review.findByIdAndDelete(reviewId);
//   res.redirect(`/listings/${id}`);

// }));

// app.get("/testListing",async(req,res)=>{
//     let sampleListing = new Listing({
//         title:"My New Villa",
//         description: "By the beach",
//         price : 1200,
//         location :"Calamgute , Goa",
//         country:"India",
//     });

//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Successful testing");
// });

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found !"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  // res.render("error.ejs")
  res.status(statusCode).render("error.ejs", { message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
