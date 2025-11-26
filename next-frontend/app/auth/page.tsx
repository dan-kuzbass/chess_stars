"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChessKnight,
  faGraduationCap,
  faUsers,
  faChartLine,
  faTrophy,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userId", data.user.id);

        // Navigate based on role
        if (data.user.role === "trainer") {
          router.push("/trainer-dashboard");
        } else {
          router.push("/student-profile");
        }
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIG9wYWNpdHk9Ii4wNiI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIvPjwvZz48ZyBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iLjUiPjxwYXRoIGQ9Ik0yMCAyMGg0djRoLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-5"></div>

      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="flex flex-col lg:flex-row">
            {/* Left side - Brand section */}
            <div className="lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 lg:p-12 flex items-center">
              <div className="max-w-md mx-auto w-full">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-2xl mb-6">
                    <FontAwesomeIcon
                      icon={faChessKnight}
                      className="text-3xl"
                    />
                  </div>
                  <h1 className="text-4xl font-bold mb-3 tracking-tight">
                    Chess Stars
                  </h1>
                  <p className="text-xl opacity-90 font-light">
                    Master the art of chess with professional training
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm hover:bg-opacity-15 transition-all duration-300">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center w-10 h-10 bg-indigo-500 rounded-lg">
                        <FontAwesomeIcon
                          icon={faGraduationCap}
                          className="text-lg"
                        />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg">Expert Coaches</h3>
                      <p className="opacity-80 mt-1">
                        Learn from experienced chess professionals
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm hover:bg-opacity-15 transition-all duration-300">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center w-10 h-10 bg-purple-500 rounded-lg">
                        <FontAwesomeIcon icon={faUsers} className="text-lg" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg">
                        Interactive Sessions
                      </h3>
                      <p className="opacity-80 mt-1">
                        Real-time training with video communication
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm hover:bg-opacity-15 transition-all duration-300">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center w-10 h-10 bg-pink-500 rounded-lg">
                        <FontAwesomeIcon
                          icon={faChartLine}
                          className="text-lg"
                        />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg">
                        Progress Tracking
                      </h3>
                      <p className="opacity-80 mt-1">
                        Monitor your improvement over time
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm hover:bg-opacity-15 transition-all duration-300">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center w-10 h-10 bg-cyan-500 rounded-lg">
                        <FontAwesomeIcon icon={faTrophy} className="text-lg" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg">
                        Competitive Growth
                      </h3>
                      <p className="opacity-80 mt-1">
                        Challenge yourself and improve skills
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Form section */}
            <div className="lg:w-1/2 p-8 lg:p-12 relative z-10">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-gray-600">
                    Sign in to continue your chess journey
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="mr-3 text-red-500"
                      />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Username or Email
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-400"
                      placeholder="Enter your username or email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-400"
                      placeholder="Enter your password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Role
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          role === "student"
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="student"
                          checked={role === "student"}
                          onChange={(e) => setRole(e.target.value)}
                          disabled={isLoading}
                          className="sr-only"
                          aria-label="Student role"
                        />
                        <div className="text-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              ></path>
                            </svg>
                          </div>
                          <span className="font-medium text-gray-700">
                            Student
                          </span>
                        </div>
                      </label>

                      <label
                        className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          role === "trainer"
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value="trainer"
                          checked={role === "trainer"}
                          onChange={(e) => setRole(e.target.value)}
                          disabled={isLoading}
                          className="sr-only"
                          aria-label="Trainer role"
                        />
                        <div className="text-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg
                              className="w-5 h-5 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              ></path>
                            </svg>
                          </div>
                          <span className="font-medium text-gray-700">
                            Trainer
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">
                    Don't have an account?{" "}
                    <a
                      href="#"
                      className="font-semibold text-indigo-600 hover:text-indigo-500"
                    >
                      Contact administrator
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Chess Stars. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
