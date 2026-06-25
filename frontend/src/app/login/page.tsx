"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, register, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demopass123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { access_token } = await login(email, password);
      setToken(access_token);
      router.push("/dashboard");
    } catch {
      setError("লগইন ব্যর্থ হয়েছে। ইমেইল/পাসওয়ার্ড চেক করুন বা প্রথমে রেজিস্টার করুন।");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setError(null);
    setLoading(true);
    try {
      await register(email, password);
      const { access_token } = await login(email, password);
      setToken(access_token);
      router.push("/dashboard");
    } catch {
      setError("রেজিস্ট্রেশন ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md"
      >
        <h1 className="mb-1 text-2xl font-bold text-slate-800">
          Restaurant Analytics
        </h1>
        <p className="mb-6 text-sm text-slate-500">AI-Powered Dashboard লগইন</p>

        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />

        <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
        <input
          className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mb-2 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "লোড হচ্ছে..." : "লগইন করুন"}
        </button>
        <button
          type="button"
          onClick={handleRegister}
          disabled={loading}
          className="w-full rounded-md border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
        >
          নতুন অ্যাকাউন্ট রেজিস্টার করুন
        </button>
      </form>
    </div>
  );
}
