"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Branch,
  ForecastPoint,
  clearToken,
  createBranch,
  generateForecast,
  getForecastAccuracy,
  getToken,
  listBranches,
  uploadCsv,
} from "@/lib/api";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchLocation, setNewBranchLocation] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [accuracy, setAccuracy] = useState<{ mae_pct: number | null; rmse_pct: number | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    refreshBranches();
  }, [router]);

  async function refreshBranches() {
    try {
      const data = await listBranches();
      setBranches(data);
      if (data.length > 0 && selectedBranch === null) setSelectedBranch(data[0].id);
    } catch {
      setErrorMsg("Branch লোড করতে সমস্যা হয়েছে।");
    }
  }

  async function handleCreateBranch(e: React.FormEvent) {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      const branch = await createBranch(newBranchName, newBranchLocation);
      setNewBranchName("");
      setNewBranchLocation("");
      await refreshBranches();
      setSelectedBranch(branch.id);
    } catch {
      setErrorMsg("Branch তৈরি করতে সমস্যা হয়েছে।");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile || !selectedBranch) return;
    setBusy(true);
    setErrorMsg(null);
    setUploadResult(null);
    try {
      const result = await uploadCsv(selectedBranch, uploadFile, {
        date_column: "Date",
        item_column: "Item",
        quantity_column: "Qty",
        amount_column: "Total",
      });
      setUploadResult(
        `✅ ${result.rows_imported} rows import হয়েছে, ${result.rows_rejected} reject হয়েছে।`
      );
    } catch (err) {
      setErrorMsg(`আপলোড ব্যর্থ: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleForecast() {
    if (!selectedBranch) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      const points = await generateForecast(selectedBranch, 14);
      setForecast(points);
      try {
        const acc = await getForecastAccuracy(selectedBranch);
        setAccuracy(acc);
      } catch {
        setAccuracy(null);
      }
    } catch (err) {
      setErrorMsg(`ফোরকাস্ট তৈরিতে সমস্যা: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          🍽️ Restaurant Analytics Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
        >
          লগআউট
        </button>
      </header>

      {errorMsg && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Branches */}
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">শাখা (Branches)</h2>
          <ul className="mb-4 space-y-1">
            {branches.map((b) => (
              <li key={b.id}>
                <button
                  onClick={() => setSelectedBranch(b.id)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                    selectedBranch === b.id
                      ? "bg-indigo-100 font-semibold text-indigo-700"
                      : "hover:bg-slate-100"
                  }`}
                >
                  {b.name} <span className="text-slate-400">— {b.location}</span>
                </button>
              </li>
            ))}
            {branches.length === 0 && (
              <li className="text-sm text-slate-400">এখনও কোনো শাখা নেই</li>
            )}
          </ul>
          <form onSubmit={handleCreateBranch} className="space-y-2">
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
              placeholder="শাখার নাম"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
            />
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
              placeholder="লোকেশন"
              value={newBranchLocation}
              onChange={(e) => setNewBranchLocation(e.target.value)}
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              + নতুন শাখা যোগ করুন
            </button>
          </form>
        </section>

        {/* Upload */}
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">
            CSV ডেটা আপলোড করুন
          </h2>
          <p className="mb-3 text-xs text-slate-500">
            কলাম: Date, Item, Qty, Total
          </p>
          <form onSubmit={handleUpload} className="space-y-3">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
            />
            <button
              type="submit"
              disabled={busy || !uploadFile || !selectedBranch}
              className="w-full rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              আপলোড করুন
            </button>
          </form>
          {uploadResult && (
            <p className="mt-3 text-sm text-emerald-700">{uploadResult}</p>
          )}
        </section>

        {/* Forecast */}
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">
            রেভিনিউ ফোরকাস্ট (Prophet AI)
          </h2>
          <button
            onClick={handleForecast}
            disabled={busy || !selectedBranch}
            className="mb-3 w-full rounded-md bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            ১৪ দিনের ফোরকাস্ট তৈরি করুন
          </button>
          {accuracy && (
            <p className="mb-2 text-xs text-slate-500">
              MAE%: {accuracy.mae_pct?.toFixed(2) ?? "N/A"} · RMSE%:{" "}
              {accuracy.rmse_pct?.toFixed(2) ?? "N/A"}
            </p>
          )}
        </section>
      </div>

      {/* Chart */}
      {forecast.length > 0 && (
        <section className="mt-6 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            ১৪ দিনের রেভিনিউ ফোরকাস্ট চার্ট
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="predicted_revenue" stroke="#4f46e5" name="পূর্বাভাস রেভিনিউ" strokeWidth={2} />
              <Line type="monotone" dataKey="lower_bound" stroke="#94a3b8" name="নিম্ন সীমা" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="upper_bound" stroke="#94a3b8" name="উচ্চ সীমা" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  );
}
