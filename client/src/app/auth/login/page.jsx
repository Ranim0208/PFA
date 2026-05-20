// components/auth/LoginForm.jsx
"use client";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginAction } from "@/features/login/login-action";

const formSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères.",
  }),
});

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const storeUserDataInLocalStorage = (user) => {
    try {
      console.log("📦 Storing user data:", user);

      // Clear previous data
      localStorage.removeItem("userRegionId");
      localStorage.removeItem("regionName");
      localStorage.removeItem("userComponent");
      console.log("user.roles:", user.roles);
      console.log("user.region:", user.region);
      // Store RegionalCoordinator data
      if (user.roles?.includes("RegionalCoordinator") && user.region) {
        console.log(
          "🌍 Detected RegionalCoordinator with region:",
          user.region,
        );

        if (user.region.id) {
          localStorage.setItem("userRegionId", user.region.id);
          console.log("✅ Stored userRegionId:", user.region.id);
        }

        if (user.region.name) {
          const regionName =
            user.region.name.fr || user.region.name.ar || user.region.name;
          localStorage.setItem("regionName", regionName);
          console.log("✅ Stored regionName:", regionName);
        }
      }

      // Store ComponentCoordinator data
      if (user.roles?.includes("ComponentCoordinator") && user.component) {
        const componentType = user.component.composant;
        if (componentType && ["crea", "inov"].includes(componentType)) {
          localStorage.setItem("userComponent", componentType);
          console.log("✅ Stored userComponent:", componentType);
        }
      }

      // Verify storage
      console.log("🔍 Verification - localStorage:", {
        userRegionId: localStorage.getItem("userRegionId"),
        regionName: localStorage.getItem("regionName"),
        userComponent: localStorage.getItem("userComponent"),
      });
    } catch (error) {
      console.error("❌ Error storing user data:", error);
    }
  };

  const handleLoginSuccess = (response) => {
    // Store user data in localStorage BEFORE redirecting
    console.log("response user data:", response.user);
    if (response.user) {
      storeUserDataInLocalStorage(response.user);
    }

    toast.success("Connexion réussie!");

    const redirectParam = searchParams.get("redirect");
    const finalRedirect =
      redirectParam && redirectParam !== "/auth/login"
        ? redirectParam
        : response.redirect || "/dashboard";

    console.log("🔄 Redirecting to:", finalRedirect);

    // Use hard redirect to ensure middleware runs
    setTimeout(() => {
      window.location.href = finalRedirect;
    }, 500);
  };

  const handleLoginError = (response) => {
    if (response.requiresActivation) {
      toast.info(response.message);
      router.push(`/auth/activate-account?id=${response.userId}`);
      return;
    }

    if (response.isArchived) {
      toast.error(response.message);
      return;
    }

    toast.error(response.error || "Échec de la connexion");
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      console.log("🔐 Attempting login with:", data.email);
      const response = await loginAction(data);

      console.log("📥 Login response:", response);

      if (response.success) {
        handleLoginSuccess(response);
      } else {
        handleLoginError(response);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 px-10 py-10">
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="my-2 text-3xl font-bold text-tacir-darkblue uppercase tracking-wide">
          Bienvenue dans le programme de TACIR
        </h2>
        <span className="font-medium tracking-wide text-tacir-darkgray">
          Se connecter à votre compte !
        </span>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-md space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input
                  {...field}
                  type="email"
                  placeholder="Saisir votre email"
                  disabled={isLoading}
                  autoComplete="email"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="password">Mot de passe</FormLabel>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder="Saisir votre mot de passe"
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-tacir-green hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? "Connexion..." : "Se Connecter"}
          </Button>
        </form>
      </Form>

      <div className="flex items-center gap-2">
        <p className="tracking-wide text-tacir-darkgray">
          Vous avez oublié votre mot de passe ?
        </p>
        <Link
          className="tracking-wider underline text-tacir-lightblue"
          href="/forgot-password"
        >
          Cliquez ici
        </Link>
      </div>
    </div>
  );
}
