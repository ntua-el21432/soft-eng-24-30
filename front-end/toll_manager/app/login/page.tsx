export default function Login() {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <h1 className="text-4xl font-bold">Login</h1>
          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Username"
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="password"
              placeholder="Password"
              className="p-2 border border-gray-300 rounded"
            />
            <button
              type="submit"
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              Login
            </button>
          </form>
        </main>
      </div>
    );
  }