// components/UnauthorizedPage.js
"use client";

import { useRouter } from "next/navigation";
import { getUserRedirectPath, logoutUser } from "@/middleware";

export default function UnauthorizedPage({ user }) {
  const router = useRouter();

  const handleGoToDashboard = () => {
    if (user) {
      const redirectPath = getUserRedirectPath(user);
      router.push(redirectPath);
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
          {user && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Current Role:</strong>{" "}
                {user.roles?.join(", ") || "No role assigned"}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoToDashboard}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Dashboard
          </button>

          <button
            onClick={handleGoBack}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back
          </button>

          <button
            onClick={handleLogout}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
