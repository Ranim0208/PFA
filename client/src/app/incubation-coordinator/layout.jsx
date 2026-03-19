"use client";

import { FilePlus, ListCollapse, PlusIcon, BookOpen } from "lucide-react";
import { SidebarProvider } from "../../components/ui/sidebar";
import AppSidebar from "../../components/sidebar/AppSidebar";
import { SidebarTrigger } from "../../components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

function GenralCoordinatorLayout({ children }) {
  const pathname = usePathname();

  const sidebarData = {
    Candidatures: [
      {
        title: "Gérer Candidature",
        icon: FilePlus,
        url: "/incubation-coordinator/candidatures",
        items: [
          {
            title: "Liste des formulaires de Candidature",
            icon: ListCollapse,
            url: "/incubation-coordinator/candidatures",
          },
          {
            title: "Ajouter Candidature",
            icon: PlusIcon,
            url: "/incubation-coordinator/candidatures/ajouter-candidature",
          },
        ],
      },
    ],
    Créathons: [
      {
        title: "Gérer Créathon",
        icon: FilePlus,
        url: "/incubation-coordinator/creathons",
        items: [
          {
            title: "Liste des Créathons",
            icon: ListCollapse,
            url: "/incubation-coordinator/creathons/liste-creathons",
          },
        ],
      },
    ],
    Formations: [
      {
        title: "Gérer Formations",
        icon: BookOpen,
        url: "/incubation-coordinator/trainings",
        items: [
          {
            title: "Gestion des formations",
            icon: ListCollapse,
            url: "/incubation-coordinator/trainings",
          },
        ],
      },
    ],
  };

  const generateBreadcrumbs = () => {
    // Remove "general-coordinator" from breadcrumb list
    const paths = pathname.split("/").filter(Boolean).slice(1);

    return paths.map((path, index) => {
      const href = `/incubation-coordinator/${paths
        .slice(0, index + 1)
        .join("/")}`;
      const isLast = index === paths.length - 1;
      let label = path.replace(/-/g, " ");

      // Traductions
      if (label === "candidatures") label = "Gestion des Candidatures";
      if (label === "creathons") label = "Gérer Créathon";
      if (label === "trainings") label = "Formations";
      if (label === "ajouter candidature")
        label = "Création de formulaire d'Appel de candidatures";
      if (label === "liste formulaire candidature")
        label = "Liste des formulaires";
      if (label === "liste creathons") label = "Liste des Créathons";

      return { label, href, isLast };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="h-screen w-screen overflow-x-hidden">
      <SidebarProvider>
        <div className="w-full flex">
          <AppSidebar data={sidebarData} className="bg-white" />
          <main className="overflow-y-auto w-full bg-white overflow-x-hidden">
            {/* Top bar: SidebarTrigger + Breadcrumb */}
            <div className="flex items-center shadow-md  justify-start gap-3 px-6 my-2 ">
              <SidebarTrigger
                className={cn("bg-transparent text-tacir-darkblue")}
              />

              <Breadcrumb>
                <BreadcrumbList className="flex items-center space-x-2 text-sm">
                  {/* Root "General Coordinator" as static, not clickable */}
                  <BreadcrumbItem>
                    <BreadcrumbPage className="py-1 text-tacir-darkblue font-semibold">
                      Coordinateur d'incubation
                    </BreadcrumbPage>
                  </BreadcrumbItem>

                  {/* Loop through remaining pages */}
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {crumb.isLast ? (
                          <BreadcrumbPage className="py-1 text-tacir-pink font-semibold">
                            {crumb.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            href={crumb.href}
                            className="py-1 rounded text-tacir-darkblue hover:bg-tacir-lightgray transition"
                          >
                            {crumb.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="max-w-screen overflow-x-hidden">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default GenralCoordinatorLayout;
