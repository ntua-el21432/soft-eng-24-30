/* eslint-disable @typescript-eslint/no-explicit-any */
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
    <div className="flex flex-col items-center justify-start min-h-screen p-2 pb-2 sm:p-5 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-4xl">
        {/* ✅ Show login form only if NOT logged in */}
        {!isLoggedIn ? (
          <>
            <h1 className="text-4xl font-bold text-center mb-8">Login</h1>
            <form className="flex flex-col gap-4 items-center" onSubmit={handleLogin}>
              <input
          type="text"
          placeholder="Username"
          className="p-2 border border-gray-300 rounded text-black w-80"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
              />
              <input
          type="password"
          placeholder="Password"
          className="p-2 border border-gray-300 rounded text-black w-80"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
              />
              <button
          type="submit"
          className="rounded-lg border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              >
          Login
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center w-full">
            <h1 className="text-4xl font-bold text-center w-full mb-16 mt-8">
              Welcome to Toll Manager
            </h1>
            <div className="w-full flex flex-col items-start pl-10 gap-4">
              <button
          onClick={() => router.push("/login/netCharges")}
          className="rounded-lg border border-solid border-black/[.08] dark:border-white/[.145] 
               transition-colors flex items-center justify-start pl-2 
               bg-white text-black dark:bg-[#1a1a1a] dark:text-white 
               hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] 
               hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              >
          Calculate Net Charges with other Operators
              </button>

              <button
          onClick={() => router.push("/login/tollStationPasses")}
          className="rounded-lg border border-solid border-black/[.08] dark:border-white/[.145] 
               transition-colors flex items-center justify-start pl-2 
               bg-white text-black dark:bg-[#1a1a1a] dark:text-white 
               hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] 
               hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              >
          View Passes in a Toll Station
              </button>

              <button
          onClick={() => router.push("/login/passesCost")}
          className="rounded-lg border border-solid border-black/[.08] dark:border-white/[.145] 
               transition-colors flex items-center justify-start pl-2 
               bg-white text-black dark:bg-[#1a1a1a] dark:text-white 
               hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] 
               hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              >
          Calculate Passes Cost
              </button>

              <button
          onClick={() => router.push("/login/passAnalysis")}
          className="rounded-lg border border-solid border-black/[.08] dark:border-white/[.145] 
               transition-colors flex items-center justify-start pl-2 
               bg-white text-black dark:bg-[#1a1a1a] dark:text-white 
               hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] 
               hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              >
          View Pass Analysis
              </button>

              <button
          onClick={() => router.push("/login/chargesBy")}
          className="rounded-lg border border-solid border-black/[.08] dark:border-white/[.145] 
               transition-colors flex items-center justify-start pl-2 
               bg-white text-black dark:bg-[#1a1a1a] dark:text-white 
               hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] 
               hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              >
          Calculate Charges by other Operators
              </button>

            </div>
          </div>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
      </main>
    </div>
  );  
}
