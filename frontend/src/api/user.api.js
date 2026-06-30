import apiClient from "../services/axios";

export const changePassword = async (passwordData) => {
  const response = await apiClient.patch("/users/me/password", passwordData);
  return response.data;
};
