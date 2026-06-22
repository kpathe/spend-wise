import { useEffect, useState } from "react";
import { createExpense, getExpenses } from "../../api/expense.api";

function DailyExpenses() {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "debit",
    category: "",
    date: "",
    note: "",
  });

  const [expenses, setExpenses] = useState([]);

  // fetch expenses

  const filter = {
    period: "day",
    targetDate: "2026-06-22",
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await getExpenses(filter);
        console.log(response.data);
        setExpenses(response.data);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
      }
    };

    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData);

    console.log("submit clicked");

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
    } catch (error) {
      console.log("request failed");
      console.error(error);
    }
  };
  return (
    <div>
      <h1>Daily Expenses Page</h1>

      <h2>Add Expense</h2>

      <form onSubmit={handleSubmit}>
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

      {expenses.map((item) => (
        <div key={item.id}>
          {item.name} {item.amount} {item.type} {item.category?.name || "n/a"}{" "}
          {item.transactionType}
        </div>
      ))}
    </div>
  );
}

export default DailyExpenses;
