import { useEffect, useState } from "react";
import { getExpenses, getExpenseSummary } from "../../api/expense.api";
import AddExpenseModal from "../../components/AddExpenseModal";

function DailyExpenses() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();

  const todayStr = today.toISOString().split("T")[0];

  const handlePrevious = () => {
    const date = new Date(tdate);
    date.setDate(date.getDate() - 1);
    setTdate(date.toISOString().split("T")[0]);
  };

  const handleNext = () => {
    const date = new Date(tdate);
    date.setDate(date.getDate() + 1);
    setTdate(date.toISOString().split("T")[0]);
  };

  const [tdate, setTdate] = useState(todayStr);

  const filter = {
    period: "day",
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

  console.log(expenseSummary);

  return (
    <div>
      <h1>Daily Expenses Page</h1>

      <h2>Add Expense</h2>

      <div>{tdate}</div>

      <button onClick={handlePrevious}>Previous</button>

      <button style={{ margin: "14px" }} onClick={() => setIsModalOpen(true)}>
        Add Expense
      </button>

      <button onClick={handleNext}>Next</button>

      {isModalOpen && (
        <AddExpenseModal
          key={tdate}
          onNewExpenseAdded={loadExpenseData}
          onClose={() => setIsModalOpen(false)}
          date={tdate}
        />
      )}

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
    </div>
  );
}

export default DailyExpenses;
