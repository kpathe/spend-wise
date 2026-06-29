import { useState } from "react";
import { createExpense } from "../api/expense.api.js";

function AddExpenseModal({ onNewExpenseAdded, onClose, date }) {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "debit",
    category: "",
    date: date,
    note: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await createExpense(formData);
      setFormData({
        name: "",
        amount: "",
        type: "debit",
        category: "",
        date: "",
        note: "",
      });

      console.log("Backend response", data);
      onNewExpenseAdded();

      onClose();
    } catch (error) {
      console.log("request failed");
      console.error(error);
    }
  };

  return (
    <>
      <button type="button" onClick={onClose}>
        Close
      </button>
      <form onSubmit={handleFormSubmit}>
        <label htmlFor="">Name : </label>
        <input
          value={formData.name}
          onChange={handleChange}
          type="text"
          name="name"
          id="name"
        />

        <label htmlFor="amount">Amount : </label>
        <input
          value={formData.amount}
          onChange={handleChange}
          type="number"
          name="amount"
          id="amount"
        />

        <input
          onChange={handleChange}
          type="radio"
          id="debit"
          name="type"
          value="debit"
        />
        <label htmlFor="debit">Debit</label>

        <input
          onChange={handleChange}
          type="radio"
          id="credit"
          name="type"
          value="credit"
        />
        <label htmlFor="credit">Credit</label>

        <p>Selected Type: {formData.type}</p>

        <label htmlFor="category">Category : </label>
        <select onChange={handleChange} name="category" id="category">
          <option value="">Select Category</option>
          <option value="food">Food</option>
          <option value="music">Music</option>
        </select>
        <p>Category : {formData.category || "not selected"}</p>

        <label htmlFor="date">Date : </label>
        <input
          value={formData.date}
          onChange={handleChange}
          type="date"
          name="date"
          id="date"
        />

        <label htmlFor="note">Note : </label>
        <input
          value={formData.note}
          onChange={handleChange}
          type="text"
          name="note"
          id="note"
        />

        <button type="submit">Add</button>
      </form>
    </>
  );
}

export default AddExpenseModal;
