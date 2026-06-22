import apiClient from "../services/axios";

export const createExpense = async (formData) => {
  const response = await apiClient.post("/expenses", formData);
  return response.data;
};

export const getExpense = async (expenseId) => {
  const response = await apiClient.get("/expenses", expenseId);
  return response.data;
};

export const editExpense = async (expenseId, updatedData) => {
  const response = await apiClient.patch(`/expenses/${expenseId}`, updatedData);

  return response.data;
};

export const deleteExpense = async (expenseId) => {
  const response = await apiClient.delete(`/expenses/${expenseId}`);

  return response.data;
};

export const getExpenses = async (filterObject) => {
  const response = await apiClient.get("/expenses", {
    params: filterObject,
  });

  return response.data;
};

export const getExpenseSummary = async (filterObject) => {
  const response = await apiClient.get("/expenses/summary", {
    params: filterObject,
  });

  return response.data;
};
