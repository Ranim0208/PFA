"use client";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { addMember } from "../../services/users/members";
import { getRegions } from "@/services/users/regions";
import { Loader2 } from "lucide-react";

const roleOptions = [
  { value: "admin", label: "Administrateur" },
  { value: "mentor", label: "Mentor" },
  { value: "projectHolder", label: "Porteur de projet" },
  { value: "IncubationCoordinator", label: "Coordinateur d'incubation" },
  { value: "ComponentCoordinator", label: "Coordinateur de composante" },
  { value: "RegionalCoordinator", label: "Coordinateur régional" },
];

const formSchema = z
  .object({
    firstName: z.string().min(1, "Le prénom est obligatoire"),
    lastName: z.string().min(1, "Le nom est obligatoire"),
    email: z.string().email("Adresse email invalide"),
    role: z.string().min(1, "Le rôle est obligatoire"),
    region: z.string().optional(),
    component: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "RegionalCoordinator" && !data.region) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La région est obligatoire pour les coordinateurs régionaux",
        path: ["region"],
      });
    }
  })
  .superRefine((data, ctx) => {
    if (data.role === "ComponentCoordinator" && !data.component) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Le composant est obligatoire pour les coordinateurs de composante",
        path: ["component"],
      });
    }
  });

export default function AddMemberForm({ onSuccess }) {
  const [regions, setRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      region: "",
      component: "",
    },
  });

  const role = form.watch("role");

  useEffect(() => {
    const fetchRegions = async () => {
      if (role === "RegionalCoordinator") {
        setLoadingRegions(true);
        try {
          const regionsData = await getRegions();
          setRegions(regionsData);
        } catch (error) {
          toast.error("Erreur lors du chargement des régions");
        } finally {
          setLoadingRegions(false);
        }
      }
    };
    fetchRegions();
  }, [role]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const memberData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        ...(data.role === "RegionalCoordinator" && { region: data.region }),
        ...(data.role === "ComponentCoordinator" && {
          component: data.component,
        }),
      };

      await addMember(memberData);
      toast.success("Membre créé avec succès !");
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(error.message || "Erreur lors de la création du membre");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-100px)] overflow-y-auto">
      {/* REMOVED the duplicate title from here */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 sm:space-y-6"
        >
          {/* Name Fields - Stack on mobile, side by side on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Prénom</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Entrez le prénom"
                      className="h-10 sm:h-11 text-sm sm:text-base"
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Nom</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Entrez le nom"
                      className="h-10 sm:h-11 text-sm sm:text-base"
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
          </div>

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Entrez l'email"
                    type="email"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                    disabled={submitting}
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />

          {/* Role Select */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Rôle</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={submitting}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                      <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px] sm:max-h-[300px]">
                    {roleOptions.map((roleOption) => (
                      <SelectItem
                        key={roleOption.value}
                        value={roleOption.value}
                        className="text-sm sm:text-base"
                      >
                        {roleOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />

          {/* Region Select - Conditional Rendering */}
          {role === "RegionalCoordinator" && (
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Région</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingRegions || submitting}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                        <SelectValue
                          placeholder={
                            loadingRegions
                              ? "Chargement des régions..."
                              : "Sélectionnez une région"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px] sm:max-h-[300px]">
                      {regions.map((region) => (
                        <SelectItem
                          key={region._id}
                          value={region._id}
                          className="text-sm sm:text-base"
                        >
                          {region.name.fr} / {region.name.ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
          )}

          {/* Component Select - Conditional Rendering */}
          {role === "ComponentCoordinator" && (
            <FormField
              control={form.control}
              name="component"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    Composante
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={submitting}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                        <SelectValue placeholder="Choisissez entre Crea ou Inov" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="crea" className="text-sm sm:text-base">
                        Crea
                      </SelectItem>
                      <SelectItem value="inov" className="text-sm sm:text-base">
                        Inov
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 sm:h-12 bg-tacir-green hover:bg-tacir-green/90 text-sm sm:text-base font-medium"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              "Créer le membre"
            )}
          </Button>

          {/* Mobile helper text */}
          <div className="sm:hidden text-xs text-tacir-darkgray text-center pt-2">
            Remplissez tous les champs requis
          </div>
        </form>
      </Form>
    </div>
  );
}
