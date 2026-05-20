"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, LogOut, Home } from "lucide-react";
import { getUserRedirectPath, logoutUser } from "@/utils/auth";

export default function UnauthorizedPage() {
  const router = useRouter();

  // FIX: Define user here
  const user = null; // Replace with actual user from auth/session if available

  const handleGoToDashboard = () => {
    const redirectPath = user ? getUserRedirectPath(user) : "/dashboard";
    router.push(redirectPath);
  };

  const handleGoBack = () => router.back();
  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="relative mx-auto mb-6">
          <div className="absolute inset-0 bg-tacir-pink/10 rounded-full animate-ping"></div>
          <div className="relative h-20 w-20 bg-tacir-lightgray rounded-full flex items-center justify-center mx-auto border-4 border-tacir-pink">
            <AlertTriangle className="h-10 w-10 text-tacir-pink" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-tacir-darkblue mb-2">
          Access Restricted
        </h1>
        <p className="text-tacir-darkgray mb-6">
          You don't have permission to view this page.
        </p>

        {user && (
          <div className="bg-tacir-lightgray/50 p-4 rounded-lg mb-8 border-l-4 border-tacir-blue">
            <p className="text-tacir-darkblue text-sm">
              <span className="font-semibold">Current Role:</span>{" "}
              {user.roles?.join(", ") || "No role assigned"}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleGoToDashboard}
            className="w-full flex items-center justify-center py-3 px-4 bg-tacir-blue hover:bg-tacir-darkblue text-white rounded-lg transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </button>

          <button
            onClick={handleGoBack}
            className="w-full flex items-center justify-center py-3 px-4 bg-white border border-tacir-blue text-tacir-blue hover:bg-tacir-lightgray/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-3 px-4 bg-white border border-tacir-pink text-tacir-pink hover:bg-tacir-lightgray/50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
