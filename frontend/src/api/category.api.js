import apiClient from "../services/axios";

export const getCategories = async () => {
  const response = await apiClient.get("/categories");
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await apiClient.post("/categories", categoryData);
  return response.data;
};
