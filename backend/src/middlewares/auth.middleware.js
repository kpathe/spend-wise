import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace(/^Bearer\s+/, "");

  if (!token) throw new ApiError(401, "Unauthorized");

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, "Unauthorized");
  }

  if (decoded.type !== "access") {
    throw new ApiError(401, "Unauthorized");
  }

  req.user = decoded;

  next();
});

export { verifyJWT };
