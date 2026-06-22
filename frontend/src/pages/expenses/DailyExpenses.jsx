import { useState } from "react";
import { createExpense } from "../../api/expense.api";

function DailyExpenses() {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "",
    category: "",
    date: "",
    note: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData);

    try {
      const data = await createExpense(formData);
      console.log("Backend response", data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Something went wrong";

      alert(errorMessage);
    }
  };
  return (
    <div>
      <h1>Daily Expenses Page</h1>

      <h2>Add Expense</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="">Name : </label>
        <input onChange={handleChange} type="text" name="name" id="name" />

        <label htmlFor="amount">Amount : </label>
        <input
          onChange={handleChange}
          type="number"
          name="amount"
          id="amount"
        />

        <label htmlFor="type">Type : </label>
        <input onChange={handleChange} type="radio" name="type" id="type" />

        <label htmlFor="category">Category : </label>
        <select onChange={handleChange} name="category" id="category">
          <option value=""></option>
        </select>

        <label htmlFor="date">Date : </label>
        <input onChange={handleChange} type="date" name="date" id="date" />

        <label htmlFor="note">Note : </label>
        <input onChange={handleChange} type="text" name="note" id="note" />

        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default DailyExpenses;
