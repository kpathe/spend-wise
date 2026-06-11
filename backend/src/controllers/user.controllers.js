import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

// change password
const handleChangePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    throw new ApiError(400, "All fields are required");

  if (oldPassword === newPassword)
    throw new ApiError(400, "Old Password and New Password are same");

  const user = await User.findById(req.user.userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const passwordMatch = await user.isPasswordCorrect(oldPassword);

  if (!passwordMatch) throw new ApiError(402, "Old password invalid");

  user.password = newPassword;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password updated successfully"));
});

export { handleChangePassword };
