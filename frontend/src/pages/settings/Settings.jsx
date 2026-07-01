import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../api/user.api";
import { logoutUser } from "../../api/auth.api";
import { createCategory } from "../../api/category.api";
import { deleteCookie } from "../../utils/cookie";

function Settings() {
  const navigate = useNavigate();

  // Collapsible Password Form State
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Password Change Form States
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Category Form States
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    type: "debit",
  });
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState("");
  const [catSuccess, setCatSuccess] = useState("");

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg("New passwords do not match.");
      setLoading(false);
      return;
    }

    if (passwordForm.oldPassword === passwordForm.newPassword) {
      setErrorMsg("New password must be different from the old password.");
      setLoading(false);
      return;
    }

    try {
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccessMsg("Password updated successfully!");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Failed to update password. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setCatLoading(true);
    setCatError("");
    setCatSuccess("");

    if (!categoryForm.name.trim()) {
      setCatError("Category name cannot be empty.");
      setCatLoading(false);
      return;
    }

    try {
      await createCategory({
        name: categoryForm.name.trim(),
        type: categoryForm.type,
      });
      setCatSuccess(`Category "${categoryForm.name}" created successfully!`);
      setCategoryForm({ name: "", type: "debit" });
    } catch (error) {
      setCatError(
        error.response?.data?.message || "Failed to create category. It might already exist."
      );
    } finally {
      setCatLoading(false);
    }
  };

  // Sign out functionality
  const handleLogout = async () => {
    try {
      await logoutUser();
      deleteCookie("userLoggedIn");
      deleteCookie("spendwiseUserName");
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed", error);
      deleteCookie("userLoggedIn");
      deleteCookie("spendwiseUserName");
      navigate("/auth/login");
    }
  };

  return (
    <div className="flex-1 p-5 space-y-5">
      
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">
          Account Settings
        </h2>
        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
          Manage your transactions categories and credentials
        </p>
      </div>

      {/* 1. Add Custom Category Box (MOVED TO TOP) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-4 rounded-2xl shadow-xs">
        <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-4 flex items-center gap-1.5">
          <svg className="w-4.5 h-4.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Add Custom Category
        </h3>

        {catError && (
          <div className="mb-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {catError}
          </div>
        )}

        {catSuccess && (
          <div className="mb-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/30 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            {catSuccess}
          </div>
        )}

        <form onSubmit={handleCategorySubmit} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
              Category Name
            </label>
            <input
              type="text"
              name="name"
              value={categoryForm.name}
              onChange={handleCategoryChange}
              placeholder="e.g. Health, Subscriptions"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
              Category Type
            </label>
            <select
              name="type"
              value={categoryForm.type}
              onChange={handleCategoryChange}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs font-medium"
            >
              <option className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100" value="debit">Debit (Expense)</option>
              <option className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100" value="credit">Credit (Income)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={catLoading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {catLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Create Category"
            )}
          </button>
        </form>
      </div>

      {/* 2. Change Password Box (COLLAPSIBLE) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-4 rounded-2xl shadow-xs">
        <button
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="w-full flex items-center justify-between font-bold text-slate-700 dark:text-zinc-300 transition-colors text-sm cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-4.5 h-4.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Change Password
          </div>
          <svg
            className={`w-5 h-5 text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${
              showPasswordForm ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showPasswordForm && (
          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-zinc-800/60 animate-in slide-in-from-top-2 duration-200">
            {errorMsg && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/30 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Repeat new password"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 3. Logout Box */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full py-3.5 border border-rose-200/50 dark:border-rose-950/20 bg-rose-50/30 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 active:scale-98 transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out of Spendwise
        </button>
      </div>
    </div>
  );
}

export default Settings;
