import { useState, useEffect } from "react";
import { createExpense, editExpense } from "../api/expense.api.js";
import { getCategories } from "../api/category.api.js";

function AddExpenseModal({ onNewExpenseAdded, onClose, date, editingExpense }) {
  const isEditMode = !!editingExpense;

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "debit",
    category: "",
    date: date || new Date().toISOString().split("T")[0],
    note: "",
  });

  const [allCategories, setAllCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Initialize form if in edit mode
  useEffect(() => {
    if (editingExpense) {
      setFormData({
        name: editingExpense.name || "",
        amount: editingExpense.amount || "",
        type: editingExpense.transactionType || "debit",
        category: editingExpense.category?.name || "",
        date: editingExpense.date ? new Date(editingExpense.date).toISOString().split("T")[0] : date,
        note: editingExpense.note || "",
      });
    }
  }, [editingExpense, date]);

  // Load all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await getCategories();
        // Since categories are returned in response.data, let's verify
        // The backend returns Category.find({}). We get new ApiResponse(200, categories, "...")
        // In category.api.js: return response.data;
        // The response format from backend is { success: true, data: categories, message: "..." }
        // Let's safe-check what is inside response.data
        if (response && Array.isArray(response.data)) {
          setAllCategories(response.data);
        } else if (Array.isArray(response)) {
          setAllCategories(response);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: "", // Reset category when type changes
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    const payload = {
      name: formData.name.trim(),
      amount: Number(formData.amount),
      type: formData.type,
      category: formData.category,
      date: formData.date,
      note: formData.note.trim(),
    };

    if (!payload.name) {
      setErrorMsg("Please enter a name.");
      setSubmitting(false);
      return;
    }
    if (isNaN(payload.amount) || payload.amount <= 0) {
      setErrorMsg("Please enter a valid amount greater than 0.");
      setSubmitting(false);
      return;
    }

    try {
      if (isEditMode) {
        await editExpense(editingExpense._id, payload);
      } else {
        await createExpense(payload);
      }
      onNewExpenseAdded();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Something went wrong saving the expense.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter categories by type
  const filteredCategories = allCategories.filter(
    (cat) => cat.transactionType === formData.type
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      {/* Background click close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-100 dark:border-zinc-800 p-6 flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
        
        {/* Drag handle for mobile feel */}
        <div className="w-12 h-1 bg-slate-200 dark:bg-zinc-800 rounded-full mx-auto mb-5 sm:hidden" onClick={onClose} />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">
            {isEditMode ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l18 12" />
            </svg>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          {/* Credit / Debit Segmented Toggle Control */}
          <div className="flex p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-xl relative">
            <button
              type="button"
              onClick={() => handleTypeChange("debit")}
              className={`flex-1 py-2 text-center text-sm font-bold rounded-lg transition-all cursor-pointer ${
                formData.type === "debit"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-200 dark:shadow-none"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
              }`}
            >
              Debit
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("credit")}
              className={`flex-1 py-2 text-center text-sm font-bold rounded-lg transition-all cursor-pointer ${
                formData.type === "credit"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-none"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
              }`}
            >
              Credit
            </button>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
              Transaction Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Starbucks, Salary"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
            />
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium capitalize"
            >
              <option className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100" value="">Select Category</option>
              {loadingCategories ? (
                <option className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100" disabled>Loading categories...</option>
              ) : filteredCategories.length === 0 ? (
                <option className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100" disabled>No categories available</option>
              ) : (
                filteredCategories.map((cat) => (
                  <option className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100" key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
              Notes / Description (Optional)
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Add extra details..."
              rows="2"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3.5 mt-2 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-99 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              formData.type === "debit"
                ? "bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-200 dark:shadow-none"
                : "bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-200 dark:shadow-none"
            }`}
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                {isEditMode ? "Save Changes" : "Confirm Entry"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddExpenseModal;
