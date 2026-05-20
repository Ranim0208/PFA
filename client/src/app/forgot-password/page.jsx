"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { requestPasswordReset } from "@/services/auth/reset-password";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setMessage("");

    try {
      const response = await requestPasswordReset(email);
      setMessage(response || "Lien de réinitialisation envoyé à votre email !");
      toast.success(response || "Lien de réinitialisation envoyé !");
    } catch (error) {
      setMessage(
        error.message || "Une erreur s'est produite. Veuillez réessayer."
      );
      toast.error(
        error.message || "Une erreur s'est produite. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-tacir-lightgray p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-tacir-yellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="text-tacir-yellow w-14 h-14" />
          </div>
          <h1 className="text-3xl font-bold text-tacir-darkblue mb-2">
            Réinitialisation du mot de passe
          </h1>
          <p className="text-tacir-darkgray/10">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-tacir-darkgray mb-1"
            >
              Adresse Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full px-4 py-3 pr-10 rounded-lg border border-tacir-lightgray focus:ring-2 focus:ring-tacir-yellow focus:border-transparent transition-all duration-200"
                placeholder="votre@email.com"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Mail className="text-tacir-darkgray w-6 h-6" />
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg text-sm ${
                message.includes("envoyé")
                  ? "bg-tacir-green/10 text-tacir-green border border-tacir-green/20"
                  : "bg-tacir-pink/10 text-tacir-pink border border-tacir-pink/20"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email}
            className={`w-full flex justify-center items-center py-3 px-6 rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-300 ${
              isLoading || !email
                ? "bg-tacir-darkgray/60 cursor-not-allowed"
                : "bg-tacir-orange hover:bg-tacir-yellow"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-4 w-4 text-white" />
                Envoi en cours...
              </span>
            ) : (
              <span className="flex items-center">
                Envoyer le lien <ArrowRight className="ml-2" />
              </span>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-tacir-darkgray">
          <p>
            Vous vous souvenez de votre mot de passe ?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-tacir-pink hover:text-tacir-darkblue hover:underline transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
