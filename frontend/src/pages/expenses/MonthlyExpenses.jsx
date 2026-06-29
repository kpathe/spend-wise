import { useEffect, useState } from "react";
import { getExpenses, getExpenseSummary } from "../../api/expense.api";

function MonthlyExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expenseSummary, setExpenseSummary] = useState([]);
  const month = new Date().toISOString().slice(0, 7);
  const [tdate, setTdate] = useState(month);

  const handlePrevious = () => {
    const date = new Date(`${tdate}-01`);
    date.setMonth(date.getMonth() - 1);
    setTdate(date.toISOString().slice(0, 7));
  };

  const handleNext = () => {
    const date = new Date(`${tdate}-01`);
    date.setMonth(date.getMonth() + 1);
    setTdate(date.toISOString().slice(0, 7));
  };

  const filter = {
    period: "month",
    targetDate: tdate,
  };

  const loadExpenseData = async () => {
    setLoading(true);
    try {
      const response = await getExpenses(filter);
      setExpenses(response.data);
      const summary = await getExpenseSummary(filter);
      setExpenseSummary(summary.data);
    } catch (error) {
      console.error("Failed loading data", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadExpenseData();
  }, [tdate]);

  return (
    <div>
      <h1>Monthly Expenses Page</h1>

      <div>{tdate}</div>

      <button onClick={handlePrevious}>Previous</button>

      <button onClick={handleNext}>Next</button>

      {loading ? (
        <div>Loading...</div>
      ) : expenses.length === 0 ? (
        <div>No expenses. Click Add to add one.</div>
      ) : (
        <>
          {expenses.map((item) => (
            <div key={item._id}>
              {item.name} {item.amount} {item.type}{" "}
              {item.category?.name || "n/a"} {item.transactionType}
            </div>
          ))}

          <div>
            <p>Debit: {expenseSummary.debitSum}</p>
            <p>Credit: {expenseSummary.creditSum}</p>
            <p>Savings: {expenseSummary.balance}</p>
          </div>
        </>
      )}

      {
        <div>
          <p>Debit : {expenseSummary.debitSum}</p>
          <p>Credit : {expenseSummary.creditSum}</p>
          <p>Savings : {expenseSummary.balance}</p>
        </div>
      }
    </div>
  );
}

export default MonthlyExpenses;
