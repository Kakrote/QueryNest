"use client";

import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

const SignupPage = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await axios.post("/api/auth/register", data);
      setSuccessMessage("Registration successful! Redirecting to login...");
      setErrorMessage("");

      setTimeout(() => {
        router.push("/auth/login");
      }, 1000);
    } catch (error) {
      if (error.response && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Server error. Please try again later.");
      }
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Create an Account ✨</h2>

        {errorMessage && (
          <div className="text-red-600 text-center text-sm mb-4">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="text-green-600 text-center text-sm mb-4">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-1">Username</label>
            <input
              id="name"
              type="text"
              {...register("name", { required: "Name is required" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g. john_doe"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">Email</label>
            <input
              id="email"
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">Password</label>
            <input
              id="password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 5, message: "Minimum 5 characters" },
              })}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Confirm Password</label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Confirm Password is required",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white font-semibold rounded-md transition-all duration-200 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;