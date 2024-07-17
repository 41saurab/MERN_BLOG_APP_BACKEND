import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { sendToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

export const register = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Please provide your profile.", 400));
  }

  const { avatar } = req.files;
  const allowedFormates = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedFormates.includes(avatar.mimetype)) {
    return next(new ErrorHandler("Please provide a valid format(JPEG/PNG/WEBP)", 400));
  }

  const { name, email, phone, password, role, education } = req.body;

  if (!name || !email || !phone || !password || !role || !education || !avatar) {
    return next(new ErrorHandler("Please provide all details", 400));
  }

  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("Email already exists", 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(avatar.tempFilePath);
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    return next(new ErrorHandler("Unable to upload avatar:", cloudinaryResponse.error || "Unknown cloudinary error"));
  }
  user = await User.create({
    name,
    email,
    phone,
    password,
    role,
    education,
    avatar: {
      public_id: cloudinaryResponse.public_id,
      secure_url: cloudinaryResponse.secure_url,
    },
  });

  sendToken(user, 200, "User registered successfully", res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide all details", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  if (user.role !== role) {
    return next(new ErrorHandler(`User with role:${role} not found`, 400));
  }

  sendToken(user, 200, "User logged in successfully", res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", { expires: new Date(Date.now()) })
    .json({
      success: true,
      message: "User logged out successfully",
    });
});

export const getMyProfile = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const getAllAuthors = catchAsyncErrors(async (req, res, next) => {
  const authors = await User.find({ role: "Author" });
  res.status(200).json({
    success: true,
    authors,
  });
});
