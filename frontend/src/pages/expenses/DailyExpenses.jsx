import { useEffect, useState } from "react";
import { getExpenses, getExpenseSummary, deleteExpense } from "../../api/expense.api";
import AddExpenseModal from "../../components/AddExpenseModal";

// Category SVG Icon Mapper for beautiful list design
export const getCategoryIcon = (categoryName, type) => {
  const name = categoryName?.toLowerCase() || "";
  const isCredit = type === "credit";
  
  const baseClass = "w-5 h-5";
  
  if (name.includes("food")) {
    return (
      <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400">
        <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
        </svg>
      </div>
    );
  }
  if (name.includes("travel") || name.includes("fuel")) {
    return (
      <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
        <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </div>
    );
  }
  if (name.includes("shopping")) {
    return (
      <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400">
        <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
    );
  }
  if (name.includes("bill") || name.includes("rent")) {
    return (
      <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
        <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </div>
    );
  }
  if (name.includes("healthcare")) {
    return (
      <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
        <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
    );
  }
  if (name.includes("education")) {
    return (
      <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400">
        <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      </div>
    );
  }
  if (name.includes("entertainment") || name.includes("music")) {
    return (
      <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400">
        <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      </div>
    );
  }
  if (name.includes("investment") || name.includes("business")) {
    return (
      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
        <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
    );
  }
  if (name.includes("salary") || name.includes("freelance") || name.includes("dividend") || name.includes("interest")) {
    return (
      <div className="p-2 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400">
        <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }
  
  // Default fallback icon
  return isCredit ? (
    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
      <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
  ) : (
    <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
      <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l2-2 4 4m0-7l-3-3-3 3M3 12h18" />
      </svg>
    </div>
  );
};

function DailyExpenses() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState({ debitSum: 0, creditSum: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const [tdate, setTdate] = useState(todayStr);

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

  const filter = {
    period: "day",
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

  // Format date header nicely (e.g. 12 June 2026, Friday)
  const formatHeaderDate = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const options = { day: 'numeric', month: 'short', year: 'numeric', weekday: 'long' };
    return d.toLocaleDateString('en-US', options);
  };

  const credits = expenses.filter(item => item.transactionType === "credit");
  const debits = expenses.filter(item => item.transactionType === "debit");

  const renderExpenseList = (itemsList) => {
    return itemsList.map((item) => {
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
                <span className="font-semibold capitalize text-indigo-500 dark:text-indigo-400/90">
                  {item.category?.name || "Uncategorized"}
                </span>
                {item.note && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[120px]">{item.note}</span>
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

            {/* Hover action controls */}
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
    });
  };

  return (
    <div className="flex-1 flex flex-col p-4 relative overflow-hidden h-full">
      {/* Date Navigation Bar */}
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
            Date Period
          </div>
          <div className="text-sm font-bold text-slate-700 dark:text-zinc-300">
            {formatHeaderDate(tdate)}
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

      {/* Floating Summary Cards */}
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
            {/* Beautiful SVG empty state illustration */}
            <div className="w-32 h-32 text-slate-300 dark:text-zinc-800 mb-4 animate-pulse">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-700 dark:text-zinc-300">
              No transactions recorded
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-[240px]">
              Tap on the plus icon below to record your first expense or income.
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
                <div className="space-y-2.5">
                  {renderExpenseList(credits)}
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
                <div className="space-y-2.5">
                  {renderExpenseList(debits)}
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
          key={editingExpense ? editingExpense._id : "new-daily"}
          onNewExpenseAdded={loadExpenseData}
          onClose={() => setIsModalOpen(false)}
          date={tdate}
          editingExpense={editingExpense}
        />
      )}
    </div>
  );
}

export default DailyExpenses;
