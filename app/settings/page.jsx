"use client";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/redux/slices/authSlice";
import { resetUserContent } from "@/redux/slices/userContentSlice";
import { resetAnswerState } from "@/redux/slices/answerSlice";
import { resetQuestionState } from "@/redux/slices/questionSlice";
import { resetVoteState } from "@/redux/slices/voteSlice";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, token } = useAppSelector((s) => s.auth);

  const handleLogout = () => {
    // Clear all user-related state
    dispatch(logout());
    dispatch(resetUserContent());
    dispatch(resetAnswerState());
    dispatch(resetQuestionState());
    dispatch(resetVoteState());
    
    // Redirect to home page
    router.push("/");
  };

  // If user is not authenticated, redirect to login
  if (!token) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
            <p className="text-gray-600 mt-1">Manage your account preferences and settings</p>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Account Information
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">{user?.name || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">{user?.email || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Account Actions</h2>
          </div>
          <div className="px-6 py-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Sign out of your QueryNest account. You'll need to sign in again to access your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
