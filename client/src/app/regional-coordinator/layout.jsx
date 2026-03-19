"use client";
import React from "react";
import { User, PlusCircleIcon } from "lucide-react";
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

function RegionalCoordinatorLayout({ children }) {
  const pathname = usePathname();

  const sidebarData = useMemo(
    () => ({
      tacirMembers: [
        {
          name: "Liste Candidature préselectioné",
          icon: User,
          url: "/regional-coordinator/candidatures",
          items: [],
        },
      ],
      Creathon: [
        {
          name: "Liste des Créathons",
          icon: PlusCircleIcon,
          url: "/regional-coordinator/creathons",
          items: [],
        },
      ],
    }),
    []
  );

  const generateBreadcrumbs = () => {
    // Remove "regional-coordinator" from the breadcrumb list
    const paths = pathname.split("/").filter(Boolean).slice(1);

    return paths.map((path, index) => {
      const href = `/regional-coordinator/${paths
        .slice(0, index + 1)
        .join("/")}`;
      const isLast = index === paths.length - 1;
      let label = path.replace(/-/g, " ");

      // Translations
      if (label === "candidatures") label = "Liste Candidature préselectioné";
      if (label === "creathons") label = "Gestion des creathons";

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
                  {/* Hardcoded "Regional Coordinator" as the root breadcrumb */}
                  <BreadcrumbItem>Coordinateur Régional</BreadcrumbItem>

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

export default RegionalCoordinatorLayout;
