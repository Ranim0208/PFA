"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="relative mx-auto mb-6">
              <div className="absolute inset-0 bg-red-500/10 rounded-full"></div>
              <div className="relative animate-pulse h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto border-4 border-red-500">
                <AlertTriangle className="h-10 w-10 text-red-500" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Application Error
            </h1>
            <p className="text-gray-600 mb-6">
              A critical error occurred in the application.
            </p>

            <div className="bg-red-50 p-4 rounded-lg mb-8 border-l-4 border-red-400">
              <p className="text-red-800 text-sm">
                <span className="font-semibold">Error:</span>{" "}
                {error?.message || "Unknown critical error"}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full flex items-center justify-center py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </button>

              <a
                href="/"
                className="w-full py-3 px-4 bg-white border border-red-600 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Homepage
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
