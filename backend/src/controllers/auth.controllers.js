import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";

// signup controller
const handleUserSignup = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    console.log(name, username, email, password);
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    email: email.trim().toLowerCase(),
  });
  console.log(existingUser);
  if (existingUser) {
    throw new ApiError(400, "User already exists.");
  }

  const user = await User.create({
    name: name,
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    password: password,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        name: user.name,
        username: user.username,
        email: user.email,
      },
      "User created successfully",
    ),
  );
});

// login controller
const handleUserLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatch = await user.isPasswordCorrect(password);

  if (!passwordMatch) throw new ApiError(401, "Invalid email or password");

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(
        200,
        { email: user.email },
        "User successfully logged in",
      ),
    );
});

// logout controller
const handleUserLogout = asyncHandler(async (req, res) => {
  return res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .status(200)
    .json(new ApiResponse(200, null, "User logged  out"));
});

export { handleUserSignup, handleUserLogin, handleUserLogout };
