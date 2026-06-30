import { useEffect, useState } from "react";
import { getExpenses } from "../../api/expense.api";

// Vibrant, professional color palette for categories
const CHART_COLORS = [
  "#4F46E5", // Indigo
  "#10B981", // Emerald
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#3B82F6", // Blue
  "#8B5CF6", // Violet
  "#EF4444", // Red
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#64748B", // Slate
];

function Charts() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month"); // "month" or "year"
  
  // Date states
  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  const currentYearStr = new Date().getFullYear().toString(); // YYYY
  const [monthDate, setMonthDate] = useState(currentMonthStr);
  const [yearDate, setYearDate] = useState(currentYearStr);

  // Active chart toggle: "debit" or "credit" category breakdown
  const [txnType, setTxnType] = useState("debit");

  // Navigation handlers
  const handlePrevious = () => {
    if (period === "month") {
      const date = new Date(`${monthDate}-01`);
      date.setMonth(date.getMonth() - 1);
      setMonthDate(date.toISOString().slice(0, 7));
    } else {
      setYearDate((prev) => (Number(prev) - 1).toString());
    }
  };

  const handleNext = () => {
    if (period === "month") {
      const date = new Date(`${monthDate}-01`);
      date.setMonth(date.getMonth() + 1);
      setMonthDate(date.toISOString().slice(0, 7));
    } else {
      setYearDate((prev) => (Number(prev) + 1).toString());
    }
  };

  const targetDate = period === "month" ? monthDate : yearDate;

  // Load all expenses for aggregation
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await getExpenses({
          period,
          targetDate,
          limit: 1000, // Load all to aggregate accurately
        });
        setExpenses(response.data || []);
      } catch (error) {
        console.error("Failed to load chart data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [period, monthDate, yearDate]);

  // Aggregate Category Breakdown
  const filteredTxns = expenses.filter((t) => t.transactionType === txnType);
  const totalTxnAmount = filteredTxns.reduce((sum, item) => sum + item.amount, 0);

  const categoryMap = {};
  filteredTxns.forEach((item) => {
    const catName = item.category?.name || "uncategorized";
    categoryMap[catName] = (categoryMap[catName] || 0) + item.amount;
  });

  const categoriesData = Object.keys(categoryMap)
    .map((name, index) => {
      const amount = categoryMap[name];
      const percentage = totalTxnAmount > 0 ? Math.round((amount / totalTxnAmount) * 100) : 0;
      return {
        name,
        amount,
        percentage,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    })
    .sort((a, b) => b.amount - a.amount); // Show largest categories first

  // SVG Donut Calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercentage = 0;

  // Aggregate Trends Over Time
  // For MONTH scope: Group by weeks (Week 1: Days 1-7, Week 2: Days 8-14, Week 3: Days 15-21, Week 4+: Days 22-end)
  // For YEAR scope: Group by months (Jan = 0 to Dec = 11)
  let trendData = [];
  if (period === "month") {
    const weeklyData = [
      { label: "W1 (1-7)", debit: 0, credit: 0 },
      { label: "W2 (8-14)", debit: 0, credit: 0 },
      { label: "W3 (15-21)", debit: 0, credit: 0 },
      { label: "W4 (22+)", debit: 0, credit: 0 },
    ];
    expenses.forEach((t) => {
      const dateVal = new Date(t.date);
      const day = dateVal.getDate();
      let idx = 3; // Week 4+
      if (day <= 7) idx = 0;
      else if (day <= 14) idx = 1;
      else if (day <= 21) idx = 2;

      if (t.transactionType === "debit") {
        weeklyData[idx].debit += t.amount;
      } else {
        weeklyData[idx].credit += t.amount;
      }
    });
    trendData = weeklyData;
  } else {
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(Number(yearDate), i, 1);
      const label = d.toLocaleDateString("en-US", { month: "short" });
      return { label, debit: 0, credit: 0 };
    });
    expenses.forEach((t) => {
      const dateVal = new Date(t.date);
      const monthIdx = dateVal.getMonth(); // 0 to 11
      if (t.transactionType === "debit") {
        monthlyData[monthIdx].debit += t.amount;
      } else {
        monthlyData[monthIdx].credit += t.amount;
      }
    });
    trendData = monthlyData;
  }

  // Find max value in trends to scale SVG height
  const maxTrendVal = Math.max(
    ...trendData.map((d) => Math.max(d.debit, d.credit)),
    100 // Prevent division by zero
  );

  // Format scope label (e.g. "June 2026" or "2026")
  const formatPeriodLabel = () => {
    if (period === "month") {
      const [year, month] = monthDate.split("-");
      const d = new Date(year, month - 1, 1);
      return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    return yearDate;
  };

  return (
    <div className="flex-1 p-4 space-y-5 pb-16">
      
      {/* Upper Navigation & Scope Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">
              Visual Analytics
            </h2>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              Overview of category distributions and trends
            </p>
          </div>

          {/* Period Scope Toggle */}
          <div className="flex p-0.5 bg-slate-100 dark:bg-zinc-800 rounded-lg">
            <button
              onClick={() => setPeriod("month")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                period === "month"
                  ? "bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 shadow-xs"
                  : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setPeriod("year")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                period === "year"
                  ? "bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 shadow-xs"
                  : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
              }`}
            >
              Year
            </button>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xs">
          <button
            onClick={handlePrevious}
            className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">
            {formatPeriodLabel()}
          </span>
          <button
            onClick={handleNext}
            className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-400 font-semibold">Aggregating analytics...</span>
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-8 rounded-3xl text-center py-16">
          <div className="w-20 h-20 text-slate-200 dark:text-zinc-800 mx-auto mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-600 dark:text-zinc-400">No chart data available</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Please record transactions in this range first.</p>
        </div>
      ) : (
        <div className="space-y-5 animate-in fade-in duration-300">
          
          {/* Card 1: Donut Chart (Category Breakdown) */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-5 rounded-3xl shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                Category Distribution
              </h3>

              {/* Debit/Credit Switcher */}
              <div className="flex p-0.5 bg-slate-100 dark:bg-zinc-800 rounded-lg">
                <button
                  onClick={() => setTxnType("debit")}
                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    txnType === "debit"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
                  }`}
                >
                  Expenses
                </button>
                <button
                  onClick={() => setTxnType("credit")}
                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    txnType === "credit"
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            {categoriesData.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 dark:text-zinc-500">
                No {txnType === "debit" ? "expenses" : "income"} recorded in this period.
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                
                {/* SVG Donut Chart */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {categoriesData.map((cat, i) => {
                      const strokeLength = (cat.percentage / 100) * circumference;
                      const offset = (accumulatedPercentage / 100) * circumference;
                      accumulatedPercentage += cat.percentage;
                      
                      return (
                        <circle
                          key={i}
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          stroke={cat.color}
                          strokeWidth="11"
                          strokeDasharray={`${strokeLength} ${circumference}`}
                          strokeDashoffset={-offset}
                          className="transition-all duration-500 hover:stroke-[13px]"
                        />
                      );
                    })}
                  </svg>
                  
                  {/* Center Text inside Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      Total {txnType === "debit" ? "Debit" : "Credit"}
                    </span>
                    <span className="text-lg font-black text-slate-800 dark:text-zinc-100 mt-0.5">
                      ₹{totalTxnAmount}
                    </span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="w-full space-y-2.5 border-t border-slate-50 dark:border-zinc-800/80 pt-4">
                  {categoriesData.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-bold text-slate-600 dark:text-zinc-300 capitalize">
                          {cat.name}
                        </span>
                        <span className="text-slate-400 dark:text-zinc-500">
                          ({cat.percentage}%)
                        </span>
                      </div>
                      <span className="font-black text-slate-800 dark:text-zinc-200">
                        ₹{cat.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Trends Over Time Bar Chart */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-5 rounded-3xl shadow-xs">
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2.5">
              Spending & Income Trends
            </h3>
            
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 mb-5">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block" />
                Debit (Expense)
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
                Credit (Income)
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="relative w-full h-48 border-b border-slate-100 dark:border-zinc-800">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                
                {/* Horizontal reference helper lines (25%, 50%, 75%) */}
                <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(156, 163, 175, 0.08)" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(156, 163, 175, 0.08)" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(156, 163, 175, 0.08)" strokeWidth="0.5" strokeDasharray="2" />

                {trendData.map((data, index) => {
                  const numBars = trendData.length;
                  const sectionWidth = 100 / numBars;
                  const barMargin = sectionWidth * 0.25;
                  const singleBarWidth = (sectionWidth - barMargin * 2) / 2;

                  const debitHeight = (data.debit / maxTrendVal) * 90; // Limit height to 90% for top margin
                  const creditHeight = (data.credit / maxTrendVal) * 90;

                  const xStart = index * sectionWidth + barMargin;

                  return (
                    <g key={index}>
                      {/* Debit Bar (Rose/Red) */}
                      {debitHeight > 0 && (
                        <rect
                          x={xStart}
                          y={100 - debitHeight}
                          width={singleBarWidth}
                          height={debitHeight}
                          fill="#f87171"
                          rx="0.8"
                          className="transition-all hover:fill-rose-500 duration-300"
                        />
                      )}
                      
                      {/* Credit Bar (Emerald/Green) */}
                      {creditHeight > 0 && (
                        <rect
                          x={xStart + singleBarWidth + (sectionWidth * 0.05)}
                          y={100 - creditHeight}
                          width={singleBarWidth}
                          height={creditHeight}
                          fill="#34d399"
                          rx="0.8"
                          className="transition-all hover:fill-emerald-500 duration-300"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-Axis labels below bar chart */}
            <div className="flex justify-between mt-2.5 px-1">
              {trendData.map((data, index) => (
                <div
                  key={index}
                  className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 text-center shrink-0"
                  style={{ width: `${100 / trendData.length}%` }}
                >
                  {data.label}
                </div>
              ))}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

export default Charts;
