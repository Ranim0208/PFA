"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  resetPassword,
  validateResetToken,
} from "@/services/auth/reset-password";
import { Lock, Loader2, Eye, EyeOff, Check, X } from "lucide-react";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const userId = searchParams.get("id");

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-tacir-lightblue",
    "bg-tacir-green",
  ];

  useEffect(() => {
    const checkToken = async () => {
      if (!token || !userId) {
        setIsValidToken(false);
        toast.error("Jeton ou ID utilisateur manquant");
        return;
      }

      const isValid = await validateResetToken({ token, userId });
      setIsValidToken(isValid);
      if (!isValid) toast.error("Jeton invalide ou expiré");
    };

    checkToken();
  }, [token, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordStrength < 4) {
      toast.error("Veuillez choisir un mot de passe plus fort");
      return;
    }

    setIsLoading(true);

    try {
      const message = await resetPassword({
        token,
        userId,
        newPassword: password,
      });
      toast.success(message || "Mot de passe mis à jour avec succès");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (error) {
      toast.error(
        error.message || "Échec de la réinitialisation du mot de passe"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen bg-tacir-lightgray px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <Loader2 className="animate-spin text-tacir-blue mx-auto mb-4 h-8 w-8" />
          <p className="text-tacir-darkgray">Validation du jeton...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen bg-tacir-lightgray px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-tacir-darkblue mb-4">
            Jeton invalide
          </h2>
          <p className="text-tacir-darkgray mb-6">
            Le lien de réinitialisation est invalide ou expiré. Veuillez en
            demander un nouveau.
          </p>
          <button
            onClick={() => router.push("/forgot-password")}
            className="w-full px-6 py-3 bg-tacir-pink text-white rounded-lg hover:bg-tacir-darkblue transition-all duration-300"
          >
            Demander un nouveau lien
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-tacir-lightgray px-4 py-8">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-tacir-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-tacir-blue text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-tacir-darkblue mb-2">
            Réinitialisez votre mot de passe
          </h1>
          <p className="text-tacir-darkgray">
            Créez un nouveau mot de passe sécurisé pour votre compte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-tacir-darkgray mb-1"
            >
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="8"
                className="block w-full px-4 py-3 pr-10 rounded-lg border border-tacir-lightgray focus:ring-2 focus:ring-tacir-blue focus:border-transparent transition-all duration-200"
                placeholder="Entrez un mot de passe sécurisé"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-tacir-darkgray hover:text-tacir-blue"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password strength meter */}
            <div className="mt-2">
              <div className="flex gap-1 h-1 mb-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-full w-full rounded-full ${
                      i < passwordStrength
                        ? strengthColors[passwordStrength - 1]
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs text-tacir-darkgray space-y-1">
                <div className="flex items-center gap-2">
                  {password.length >= 8 ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <X className="w-3 h-3 text-red-500" />
                  )}
                  <span>Au moins 8 caractères</span>
                </div>
                <div className="flex items-center gap-2">
                  {/[A-Z]/.test(password) ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <X className="w-3 h-3 text-red-500" />
                  )}
                  <span>Une lettre majuscule</span>
                </div>
                <div className="flex items-center gap-2">
                  {/[0-9]/.test(password) ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <X className="w-3 h-3 text-red-500" />
                  )}
                  <span>Un chiffre</span>
                </div>
                <div className="flex items-center gap-2">
                  {/[^A-Za-z0-9]/.test(password) ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <X className="w-3 h-3 text-red-500" />
                  )}
                  <span>Un caractère spécial</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-tacir-darkgray mb-1"
            >
              Confirmez le mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="8"
                className="block w-full px-4 py-3 pr-10 rounded-lg border border-tacir-lightgray focus:ring-2 focus:ring-tacir-blue focus:border-transparent transition-all duration-200"
                placeholder="Confirmez votre mot de passe"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-tacir-darkgray hover:text-tacir-blue"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || passwordStrength < 4}
            className={`w-full flex justify-center items-center py-3 px-6 rounded-lg shadow-sm text-sm font-medium text-white ${
              isLoading
                ? "bg-tacir-darkgray cursor-not-allowed"
                : "bg-tacir-green hover:bg-tacir-darkblue"
            } transition-all duration-300`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-4 w-4 text-white" />
                Réinitialisation...
              </span>
            ) : (
              "Réinitialiser le mot de passe"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
