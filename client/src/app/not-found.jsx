"use client";

import { useRouter } from "next/navigation";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleDashboard = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="relative mx-auto mb-6">
          <div className="h-20 w-20 bg-tacir-lightgray rounded-full flex items-center justify-center mx-auto border-4 border-tacir-blue animate-bounce">
            <Search className="h-10 w-10 text-tacir-blue" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-tacir-darkblue mb-2">
          Page Not Found
        </h1>
        <p className="text-tacir-darkgray mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleDashboard}
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
        </div>
      </div>
    </div>
  );
}
