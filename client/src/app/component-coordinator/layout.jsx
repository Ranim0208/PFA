"use client";
import React from "react";
import {
  FileText,
  ListOrdered,
  Puzzle,
  GraduationCap,
  TrainTrackIcon,
  FolderEdit,
} from "lucide-react";
import { SidebarProvider } from "../../components/ui/sidebar";
import AppSidebar from "../../components/sidebar/AppSidebar";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "../../components/ui/sidebar";
import { cn } from "@/lib/utils";
function ComponentCoordinatorLayout({ children }) {
  const pathname = usePathname();

  const sidebarData = useMemo(
    () => ({
      Candidatures: [
        {
          name: "Formulaire de Candidatures",
          icon: FileText,
          url: "/component-coordinator/candidatures",
          items: [],
        },
        {
          name: "Liste des Candidatures",
          icon: ListOrdered,
          url: "/component-coordinator/candidature-submission",
          items: [],
        },
      ],
      Ceathons: [
        {
          name: "Gestion des Créathons",
          icon: Puzzle,
          url: "/component-coordinator/creathons",
          items: [],
        },
      ],
      Formations: [
        {
          name: "Programmation des formations",
          icon: GraduationCap,
          url: `/component-coordinator/trainings`,
        },
        {
          name: "Suivie des formations",
          icon: FolderEdit,
          url: `/component-coordinator/trainings/tracking`,
        },
      ],
    }),
    []
  );

  const generateBreadcrumbs = () => {
    // Remove "component-coordinator" from the breadcrumb list
    const paths = pathname.split("/").filter(Boolean).slice(1);

    return paths.map((path, index) => {
      const href = `/component-coordinator/${paths
        .slice(0, index + 1)
        .join("/")}`;
      const isLast = index === paths.length - 1;
      let label = path.replace(/-/g, " ");

      // Translations
      if (label === "candidatures") label = "Formulaire de Candidatures";
      if (label === "candidature submission") label = "Liste des Candidatures";
      if (label === "creathons") label = "Gestion des Créathons";
      if (label === "trainings") label = "Programmation des formations";
      if (label === "tracking") label = "Suivie des formations";

      return { label, href, isLast };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="h-screen w-screen">
      <SidebarProvider>
        <div className="w-full flex">
          <AppSidebar data={sidebarData} className="bg-white" />
          <main className="overflow-y-auto w-full bg-white overflow-x-hidden">
            {/* Top bar: SidebarTrigger + Breadcrumb */}
            <div className="flex items-center justify-start gap-3 px-6 my-2">
              <SidebarTrigger className={cn("bg-white text-tacir-darkblue")} />
              {/* Breadcrumb with TACIR colors */}
              <Breadcrumb className="px-6">
                <BreadcrumbList className="flex items-center space-x-2 text-sm">
                  {/* Hardcoded "Component Coordinator" as the root breadcrumb */}
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="/component-coordinator"
                      className="py-1 rounded text-tacir-darkblue hover:bg-tacir-lightgray transition"
                    >
                      Coordinateur de Composante
                    </BreadcrumbLink>
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
            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default ComponentCoordinatorLayout;
