import { useEffect, useState } from "react";
import { getExpenses, getExpenseSummary, deleteExpense } from "../../api/expense.api";
import AddExpenseModal from "../../components/AddExpenseModal";
import { getCategoryIcon } from "./DailyExpenses";

function YearlyExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expenseSummary, setExpenseSummary] = useState({ debitSum: 0, creditSum: 0, balance: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const yearStr = new Date().getFullYear().toString(); // e.g. "2026"
  const [tdate, setTdate] = useState(yearStr);

  const handlePrevious = () => {
    setTdate((prev) => (Number(prev) - 1).toString());
  };

  const handleNext = () => {
    setTdate((prev) => (Number(prev) + 1).toString());
  };

  const filter = {
    period: "year",
    targetDate: tdate,
  };

  const loadExpenseData = async () => {
    setLoading(true);
    try {
      const response = await getExpenses(filter);
      const sorted = (response.data || []).sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
      setExpenses(sorted);
      const summary = await getExpenseSummary(filter);
      setExpenseSummary(summary.data || { debitSum: 0, creditSum: 0, balance: 0 });
    } catch (error) {
      console.error("Failed loading data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenseData();
  }, [tdate]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
        loadExpenseData();
      } catch (error) {
        console.error("Failed to delete expense", error);
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  // Format single transaction date for yearly listing (e.g. 15 Jun 2026)
  const formatTxnDate = (fullDateStr) => {
    const d = new Date(fullDateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "2-digit" });
  };

  // Get default date for adding new expense (e.g., today's date if it falls in the selected year, otherwise Jan 1st of year)
  const getModalDefaultDate = () => {
    const today = new Date();
    const todayYearStr = today.getFullYear().toString();
    if (todayYearStr === tdate) {
      return today.toISOString().split("T")[0];
    }
    return `${tdate}-01-01`;
  };

  // Group expenses month-wise
  const groupExpensesByMonth = (expensesList) => {
    const groups = {};
    expensesList.forEach((item) => {
      if (!item.date) return;
      const date = new Date(item.date);
      if (isNaN(date.getTime())) return;
      const yearMonthKey = date.toISOString().slice(0, 7); // e.g. "2026-06"
      if (!groups[yearMonthKey]) {
        groups[yearMonthKey] = [];
      }
      groups[yearMonthKey].push(item);
    });
    
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((key) => {
        const [year, month] = key.split("-");
        const date = new Date(Number(year), Number(month) - 1, 1);
        const monthLabel = date.toLocaleDateString("en-US", { month: "long" });
        return {
          monthLabel,
          items: groups[key],
        };
      });
  };

  const credits = expenses.filter(item => item.transactionType === "credit");
  const debits = expenses.filter(item => item.transactionType === "debit");

  const groupedCredits = groupExpensesByMonth(credits);
  const groupedDebits = groupExpensesByMonth(debits);

  const renderGroupedList = (groupedList) => {
    return groupedList.map((group) => (
      <div key={group.monthLabel} className="space-y-2">
        <h4 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-1 mt-4">
          {group.monthLabel} ({group.items.length})
        </h4>
        
        <div className="space-y-2.5">
          {group.items.map((item) => {
            const isCredit = item.transactionType === "credit";
            return (
              <div
                key={item._id}
                className="group bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-3 rounded-2xl flex items-center justify-between hover:shadow-md hover:border-slate-200 dark:hover:border-zinc-700 transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getCategoryIcon(item.category?.name, item.transactionType)}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-700 dark:text-zinc-200 truncate">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400 dark:text-zinc-500">
                      <span className="font-semibold text-slate-500 dark:text-zinc-400">
                        {formatTxnDate(item.date)}
                      </span>
                      <span>•</span>
                      <span className="font-semibold capitalize text-indigo-500 dark:text-indigo-400/90">
                        {item.category?.name || "Uncategorized"}
                      </span>
                      {item.note && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[80px]">{item.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`text-sm font-black font-sans ${
                      isCredit ? "text-emerald-600 dark:text-emerald-500" : "text-purple-600 dark:text-purple-500"
                    }`}>
                      {isCredit ? "+" : "-"}₹{item.amount}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 border-l border-slate-100 dark:border-zinc-800 pl-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                      title="Edit transaction"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                      title="Delete transaction"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ));
  };

  return (
    <div className="flex-1 flex flex-col p-4 relative overflow-hidden h-full">
      {/* Year Navigation Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 px-3 py-2 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm mb-4">
        <button
          onClick={handlePrevious}
          className="p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 active:scale-90 transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <div className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">
            Year Period
          </div>
          <div className="text-sm font-bold text-slate-700 dark:text-zinc-300">
            {tdate}
          </div>
        </div>

        <button
          onClick={handleNext}
          className="p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 active:scale-90 transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 p-2.5 rounded-2xl text-center">
          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">
            Credit (+)
          </div>
          <div className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-0.5 truncate">
            ₹{expenseSummary.creditSum || 0}
          </div>
        </div>
        
        <div className="bg-purple-50/40 dark:bg-purple-950/10 border border-purple-100/50 dark:border-purple-900/20 p-2.5 rounded-2xl text-center">
          <div className="text-[10px] font-bold text-purple-600 dark:text-purple-500 uppercase tracking-wider">
            Debit (-)
          </div>
          <div className="text-sm font-black text-purple-700 dark:text-purple-400 mt-0.5 truncate">
            ₹{expenseSummary.debitSum || 0}
          </div>
        </div>

        <div className={`p-2.5 rounded-2xl text-center border ${
          (expenseSummary.balance || 0) >= 0 
            ? "bg-indigo-50/40 dark:bg-indigo-950/10 border-indigo-100/50 dark:border-indigo-900/20 text-indigo-700 dark:text-indigo-400" 
            : "bg-amber-50/40 dark:bg-amber-950/10 border-amber-100/50 dark:border-amber-900/20 text-amber-700 dark:text-amber-400"
        }`}>
          <div className="text-[10px] font-bold uppercase tracking-wider">
            Balance
          </div>
          <div className="text-sm font-black mt-0.5 truncate">
            ₹{expenseSummary.balance || 0}
          </div>
        </div>
      </div>

      {/* Expense List Section */}
      <div className="flex-1 overflow-y-auto pr-1 pb-20">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
            <span className="text-sm text-slate-400 font-medium">Fetching details...</span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6">
            <div className="w-32 h-32 text-slate-300 dark:text-zinc-800 mb-4 animate-pulse">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-700 dark:text-zinc-300">
              No transactions this year
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-[240px]">
              Tap on the plus icon below to record an expense for this year.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {credits.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">
                    Credits ({credits.length})
                  </h3>
                </div>
                <div className="space-y-4">
                  {renderGroupedList(groupedCredits)}
                </div>
              </div>
            )}

            {debits.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <h3 className="text-xs font-bold text-purple-600 dark:text-purple-500 uppercase tracking-wider">
                    Debits ({debits.length})
                  </h3>
                </div>
                <div className="space-y-4">
                  {renderGroupedList(groupedDebits)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={handleAddClick}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-300 dark:shadow-none hover:shadow-indigo-400/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all cursor-pointer z-30"
        title="Add transaction"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <AddExpenseModal
          key={editingExpense ? editingExpense._id : "new-yearly"}
          onNewExpenseAdded={loadExpenseData}
          onClose={() => setIsModalOpen(false)}
          date={getModalDefaultDate()}
          editingExpense={editingExpense}
        />
      )}
    </div>
  );
}

export default YearlyExpenses;
