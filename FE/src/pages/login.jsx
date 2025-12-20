import { useState } from "react";
// import { Link } from "react-router-dom"; // use if routing is set up
import { Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }
    alert("Logged in as: " + form.email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-gray-600" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full bg-blue-400 text-white py-2 rounded hover:bg-blue-700 font-semibold transition"
          >
            Login
          </button>
        </form>

        {/* If using react-router */}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            If you're new, create an account
          </p>
          <Link
            to="/signup"
            className="inline-block w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-semibold transition text-center"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
