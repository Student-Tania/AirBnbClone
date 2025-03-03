const express = require("express");
const router = express.Router();
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");
const userController=require("../controller/user.js")

router
  .route("/signup")
  .get(userController.renderSignUp)
  .post(wrapAsync(userController.signUp));

router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    savedRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );


// router.get("/signup",userController.renderSignUp)

// router.post("/signup",wrapAsync(userController.signUp));

// router.get("/login",userController.renderLoginForm);

// router.post("/login",savedRedirectUrl,passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),userController.login);

router.get("/logout",userController.logout);

module.exports=router;
