"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, RefreshCw, Home, Wifi, Server } from "lucide-react";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const [errorDetails, setErrorDetails] = useState({
    code: "500",
    message: "An unexpected error occurred",
    title: "Something Went Wrong",
    description: "We encountered an unexpected error processing your request.",
    icon: AlertTriangle,
    color: "tacir-orange",
  });

  useEffect(() => {
    const code = searchParams.get("code") || "500";
    const message =
      searchParams.get("message") || "An unexpected error occurred";

    let details = {
      code,
      message,
      title: "Something Went Wrong",
      description:
        "We encountered an unexpected error processing your request.",
      icon: AlertTriangle,
      color: "tacir-orange",
    };

    switch (code) {
      case "500":
        details = {
          ...details,
          title: "Internal Server Error",
          description: "Our servers are experiencing technical difficulties.",
          icon: Server,
          color: "red-500",
        };
        break;
      case "503":
        details = {
          ...details,
          title: "Service Unavailable",
          description: "The authentication service is temporarily unavailable.",
          icon: Wifi,
          color: "yellow-500",
        };
        break;
      case "504":
        details = {
          ...details,
          title: "Gateway Timeout",
          description: "The request timed out. Please try again.",
          icon: Wifi,
          color: "blue-500",
        };
        break;
    }

    setErrorDetails(details);
  }, [searchParams]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const IconComponent = errorDetails.icon;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon with pulse ring */}
        <div className="relative mx-auto mb-6">
          <div
            className={`absolute inset-0 bg-${errorDetails.color}/10 rounded-full`}
          ></div>
          <div
            className={`relative animate-pulse h-20 w-20 bg-tacir-lightgray rounded-full flex items-center justify-center mx-auto border-4 border-${errorDetails.color}`}
          >
            <IconComponent className={`h-10 w-10 text-${errorDetails.color}`} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-tacir-darkblue mb-2">
          {errorDetails.title}
        </h1>
        <p className="text-tacir-darkgray mb-6">{errorDetails.description}</p>

        <div className="bg-tacir-lightgray/50 p-4 rounded-lg mb-8 border-l-4 border-tacir-yellow">
          <p className="text-tacir-darkblue text-sm">
            <span className="font-semibold">Error Code:</span>{" "}
            {errorDetails.code}
          </p>
          <p className="text-tacir-darkblue text-sm mt-1">
            <span className="font-semibold">Details:</span>{" "}
            {errorDetails.message}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center py-3 px-4 bg-tacir-blue hover:bg-tacir-darkblue text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>

          <button
            onClick={handleGoHome}
            className="w-full py-3 px-4 bg-white border border-tacir-blue text-tacir-blue hover:bg-tacir-lightgray/50 rounded-lg transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
