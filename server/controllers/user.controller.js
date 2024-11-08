import bcryptjs from "bcryptjs";
import { ErrorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";

export const test = (req, res) => {
  res.json({
    message: "Hello world!",
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(ErrorHandler(401, "You can change only your credentials"));
  }

  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    // Use findOneAndUpdate to handle errors better
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id }, // Find by user id
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true } // Return updated document
    );

    // Check if updatedUser exists before de-structuring
    if (!updatedUser) {
      return next(ErrorHandler(404, "User not found or update failed"));
    }

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    // Handle database or other errors
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(ErrorHandler(404, "You can delete only your account"));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token");
    res.status(200).json("User has been deleted");
  } catch (error) {
    return next(error);
  }
};

export const getUserListing = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(ErrorHandler(401, "You can only view your own listing"));
  }
  try {
    const listing = await Listing.find({ userRef: req.params.id });
    res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(ErrorHandler(404, "User not found"));
    }
    const { password: pass, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
