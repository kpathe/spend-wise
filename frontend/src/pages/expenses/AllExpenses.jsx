import { useState, useEffect } from "react";
import { getExpenses, getExpenseSummary, deleteExpense } from "../../api/expense.api";
import { getCategories } from "../../api/category.api";
import AddExpenseModal from "../../components/AddExpenseModal";
import { getCategoryIcon } from "./DailyExpenses";

function AllExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState({ debitSum: 0, creditSum: 0, balance: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 15;

  // Modal states for edit/add
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Filter criteria states
  const [search, setSearch] = useState("");
  const [type, setType] = useState(""); // "" (All), "credit", "debit"
  const [categoryId, setCategoryId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sort, setSort] = useState("date_desc");

  // Applied filter criteria state (to avoid fetching on every keypress)
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    type: "",
    categoryId: "",
    from: "",
    to: "",
    minAmount: "",
    maxAmount: "",
    sort: "date_desc",
  });

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        if (response && Array.isArray(response.data)) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch expenses and summaries when appliedFilters or page changes
  const fetchExpensesData = async (resetList = false) => {
    setLoading(true);
    const currentPage = resetList ? 1 : page;
    
    // Build query params
    const filterObject = {
      page: currentPage,
      limit: limit,
      sort: appliedFilters.sort,
    };

    if (appliedFilters.search) filterObject.search = appliedFilters.search;
    if (appliedFilters.type) filterObject.type = appliedFilters.type;
    if (appliedFilters.categoryId) filterObject.categoryId = appliedFilters.categoryId;
    if (appliedFilters.from) filterObject.from = appliedFilters.from;
    if (appliedFilters.to) filterObject.to = appliedFilters.to;
    if (appliedFilters.minAmount) filterObject.minAmount = appliedFilters.minAmount;
    if (appliedFilters.maxAmount) filterObject.maxAmount = appliedFilters.maxAmount;

    try {
      const response = await getExpenses(filterObject);
      const fetchedExpenses = response.data || [];
      
      if (resetList) {
        setExpenses(fetchedExpenses);
        setPage(1);
      } else {
        setExpenses((prev) => [...prev, ...fetchedExpenses]);
      }
      
      // If fetched items are less than the limit, we hit the end
      if (fetchedExpenses.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      // Fetch summary statistics
      // Note: backend handleGetExpenseSummary doesn't paginate, it takes the same filters
      const summaryFilter = { ...filterObject };
      delete summaryFilter.page;
      delete summaryFilter.limit;
      const summaryResp = await getExpenseSummary(summaryFilter);
      setExpenseSummary(summaryResp.data || { debitSum: 0, creditSum: 0, balance: 0 });

    } catch (error) {
      console.error("Error loading expenses", error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever applied filters change (reset list)
  useEffect(() => {
    fetchExpensesData(true);
  }, [appliedFilters]);

  // Re-fetch when page increases (append list)
  useEffect(() => {
    if (page > 1) {
      fetchExpensesData(false);
    }
  }, [page]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    setAppliedFilters({
      search,
      type,
      categoryId,
      from,
      to,
      minAmount,
      maxAmount,
      sort,
    });
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setSearch("");
    setType("");
    setCategoryId("");
    setFrom("");
    setTo("");
    setMinAmount("");
    setMaxAmount("");
    setSort("date_desc");
    setPage(1);
    setAppliedFilters({
      search: "",
      type: "",
      categoryId: "",
      from: "",
      to: "",
      minAmount: "",
      maxAmount: "",
      sort: "date_desc",
    });
    setShowFilters(false);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
        // Refresh from scratch
        fetchExpensesData(true);
      } catch (error) {
        console.error("Failed to delete expense", error);
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const formatTxnDate = (fullDateStr) => {
    const d = new Date(fullDateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="flex-1 flex flex-col p-4 relative min-h-full pb-20">
      
      {/* Search Header and Filters Button */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex-1 bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl flex items-center px-3.5 py-2.5 shadow-xs focus-within:ring-2 focus-within:ring-indigo-500/25 transition-all">
          <svg className="w-5 h-5 text-slate-400 dark:text-zinc-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
            className="flex-1 bg-transparent text-slate-800 dark:text-zinc-100 text-sm placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setAppliedFilters(prev => ({ ...prev, search: "" })); }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-2xl border active:scale-95 transition-all cursor-pointer ${
            showFilters || Object.values(appliedFilters).some(v => v !== "" && v !== "date_desc")
              ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
              : "bg-white dark:bg-zinc-900 border-slate-150 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
          }`}
          title="Toggle filters drawer"
        >
          <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      {/* Advanced Filter Drawer / Accordion */}
      {showFilters && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-4 rounded-2xl shadow-md mb-5 animate-in slide-in-from-top duration-200">
          <form onSubmit={handleApplyFilters} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Type Select */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Transactions</option>
                  <option value="debit">Debit (Expense)</option>
                  <option value="credit">Credit (Income)</option>
                </select>
              </div>

              {/* Category Select */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 capitalize"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Range Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Amount Range Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Min Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Max Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Sort Order Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="amount_desc">Highest Amount First</option>
                <option value="amount_asc">Lowest Amount First</option>
              </select>
            </div>

            {/* Form actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer active:scale-98 transition-all"
              >
                Reset
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer active:scale-98 transition-all shadow-sm"
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Summary Statistics */}
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

      {/* Expenses Results List */}
      <div className="flex-1 flex flex-col">
        {expenses.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6">
            <div className="w-28 h-28 text-slate-300 dark:text-zinc-800 mb-4 animate-pulse">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-700 dark:text-zinc-300">
              No matching records
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-[240px]">
              Try adjusting your search query or filter settings.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="space-y-2.5">
              {expenses.map((item) => {
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

            {/* Loading Spinner */}
            {loading && (
              <div className="flex justify-center py-4 gap-2 items-center">
                <div className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-xs text-slate-400 font-semibold">Loading data...</span>
              </div>
            )}

            {/* Load More Button */}
            {hasMore && !loading && (
              <button
                onClick={handleLoadMore}
                className="w-full py-3 bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-99 transition-all cursor-pointer text-center"
              >
                Load More Transactions
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <AddExpenseModal
          key={editingExpense ? editingExpense._id : "edit-all"}
          onNewExpenseAdded={() => fetchExpensesData(true)}
          onClose={() => setIsModalOpen(false)}
          date={new Date().toISOString().split("T")[0]}
          editingExpense={editingExpense}
        />
      )}
    </div>
  );
}

export default AllExpenses;