import apiClient from "../services/axios";

export const createExpense = async (formData) => {
  const response = await apiClient.post("/expense", formData);
  return response.data;
};

export const getExpense = async (id)
