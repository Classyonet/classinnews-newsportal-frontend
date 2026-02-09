"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3004";
const API_URL = API_BASE + "/api";

function SuccessOverlay({ name }: { name: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Welcome Back!</h3>
          <p className="text-gray-600">
            Hello, <span className="font-semibold text-red-600">{name}</span>!
          </p>
          <p className="text-sm text-gray-400 mt-3">Redirecting...</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successName, setSuccessName] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");
    if (errorParam) {
      setError(errorParam.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
    }
    fetch(API_URL + "/auth/oauth-providers")
      .then((res) => res.json())
      .then((data) => {
        if (data.providers?.google) setGoogleEnabled(true);
      })
      .catch(() => {});
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = API_URL + "/auth/google";
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResendSuccess(false);
    try {
      const response = await fetch(API_URL + "/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setResendSuccess(true);
      } else {
        setError(data.message || "Failed to resend verification email");
      }
    } catch {
      setError("Failed to resend verification email. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    setError("");
    setErrorCode("");
    setResendSuccess(false);

    try {
      const res = await fetch(API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code) setErrorCode(data.code);
        throw new Error(data.error || data.message || "Login failed");
      }

      const token = data.token || data.data?.token || "";
      const user = data.user || data.data?.user || {};
      localStorage.setItem("reader_token", token);
      localStorage.setItem("reader_user", JSON.stringify(user));

      setSuccessName(user.username || "Reader");
      setShowSuccess(true);
      setTimeout(() => { window.location.href = "/"; }, 2000);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showSuccess && <SuccessOverlay name={successName} />}
      <div className="min-h-screen flex">
        {/* Left - Branding Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 via-red-700 to-red-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col justify-center px-16 text-white">
            <h1 className="text-5xl font-extrabold mb-4 leading-tight">ClassinNews</h1>
            <p className="text-xl text-red-100 mb-8 leading-relaxed">Your trusted source for quality news and insightful journalism.</p>
            <div className="space-y-4">
              {["Personalized news feed", "Save & bookmark articles", "Engage with the community"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-red-100">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <Link href="/" className="text-sm text-gray-500 hover:text-red-600 transition-colors">&larr; Back to Home</Link>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                <p className="text-gray-500 mt-1">Sign in to your account</p>
              </div>

              {/* Google Sign In */}
              <button type="button" onClick={handleGoogleLogin} disabled={!googleEnabled}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed mb-6">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-4 text-sm text-gray-400">or sign in with email</span></div>
              </div>

              {error && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                  {errorCode === "EMAIL_NOT_VERIFIED" && (
                    <div className="mt-2">
                      {resendSuccess ? (
                        <p className="text-sm text-green-600">Verification email sent! Check your inbox.</p>
                      ) : (
                        <button type="button" onClick={handleResendVerification} disabled={resending}
                          className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                          {resending ? "Sending..." : "Resend Verification Email"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-gray-50 placeholder-gray-400"
                    placeholder="you@example.com" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <Link href="/forgot-password" className="text-sm text-red-600 hover:text-red-700 font-medium">Forgot?</Link>
                  </div>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-gray-50 placeholder-gray-400"
                    placeholder="Enter your password" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md">
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                {"Don't have an account? "}
                <Link href="/register" className="text-red-600 hover:text-red-700 font-semibold">Create one</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
