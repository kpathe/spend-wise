import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";

const getCookieOptions = (req, maxAge) => {
  const origin = req.get("origin") || req.headers.origin || "";
  const isSecure = origin.startsWith("https://");

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    maxAge,
    path: "/",
  };
};

const setAuthCookies = (req, res, accessToken, refreshToken, user) => {
  const accessOptions = getCookieOptions(req, 15 * 60 * 1000);
  const refreshOptions = getCookieOptions(req, 7 * 24 * 60 * 60 * 1000);

  return res
    .cookie("accessToken", accessToken, accessOptions)
    .cookie("refreshToken", refreshToken, refreshOptions)
    .cookie("userLoggedIn", "true", {
      httpOnly: false,
      secure: accessOptions.secure,
      sameSite: accessOptions.sameSite,
      maxAge: refreshOptions.maxAge,
      path: "/",
    })
    .cookie("spendwiseUserName", user.name, {
      httpOnly: false,
      secure: accessOptions.secure,
      sameSite: accessOptions.sameSite,
      maxAge: refreshOptions.maxAge,
      path: "/",
    });
};

const clearAuthCookies = (req, res) => {
  const cookieOptions = getCookieOptions(req, 0);

  return res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("userLoggedIn", cookieOptions)
    .clearCookie("spendwiseUserName", cookieOptions);
};

// signup controller
const handleUserSignup = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    email: email.trim().toLowerCase(),
  });

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

  const accessToken = jwt.sign(
    { userId: user._id, type: "access" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
  const refreshToken = jwt.sign(
    { userId: user._id, type: "refresh" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  setAuthCookies(req, res, accessToken, refreshToken, user);

  return res.status(200).json(
    new ApiResponse(
      200,
      { email: user.email, name: user.name, username: user.username },
      "User successfully logged in",
    ),
  );
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized");
  }

  let decoded;

  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, "Unauthorized");
  }

  if (decoded.type !== "refresh") {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  const accessToken = jwt.sign(
    { userId: user._id, type: "access" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
  const refreshToken = jwt.sign(
    { userId: user._id, type: "refresh" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  setAuthCookies(req, res, accessToken, refreshToken, user);

  return res.status(200).json(
    new ApiResponse(
      200,
      { email: user.email, name: user.name, username: user.username },
      "Token refreshed successfully",
    ),
  );
});

// logout controller
const handleUserLogout = asyncHandler(async (req, res) => {
  clearAuthCookies(req, res);

  return res.status(200).json(new ApiResponse(200, null, "User logged out"));
});

export { handleUserSignup, handleUserLogin, handleUserLogout, handleRefreshToken };
