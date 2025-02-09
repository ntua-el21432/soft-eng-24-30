"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // For redirecting after login

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ Track login status
  const router = useRouter(); // To redirect after login

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form refresh

    try {
      const response = await fetch("http://localhost:9115/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // ✅ Save the token in localStorage or cookies
      localStorage.setItem("authToken", data.token);

      // ✅ Set login state to true
      setIsLoggedIn(true);

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Login</h1>

        {/* ✅ Show login form only if NOT logged in */}
        {!isLoggedIn ? (
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              className="p-2 border border-gray-300 rounded text-black"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="p-2 border border-gray-300 rounded text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              Login
            </button>
          </form>
        ) : (
          // ✅ Show "Enter as Operator" button ONLY after successful login
          <button
            onClick={() => router.push("/login/operator_dashboard")}
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Enter as Operator
          </button>
        )}

        {error && <p className="text-red-500">{error}</p>}
      </main>
    </div>
  );
}