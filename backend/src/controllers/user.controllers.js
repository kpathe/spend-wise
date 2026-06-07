import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

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

export { handleUserSignup };
