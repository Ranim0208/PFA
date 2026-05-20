"use client";
import React from "react";
import { BookOpen, FileText } from "lucide-react";
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

function ProjectHolderLayout({ children }) {
  const pathname = usePathname();

  const sidebarData = useMemo(
    () => ({
      Navigation: [
        {
          name: "Mes Formations",
          icon: BookOpen,
          url: "/project-holder/trainings",
          description: "Gérer mes formations",
        },
        {
          name: "Mes Outputs",
          icon: FileText,
          url: "/project-holder/outputs",
          description: "Gérer mes livrables",
        },
      ],
    }),
    []
  );

  const generateBreadcrumbs = () => {
    // Remove "project-holder" from the breadcrumb list
    const paths = pathname.split("/").filter(Boolean).slice(1);

    return paths.map((path, index) => {
      const href = `/project-holder/${paths.slice(0, index + 1).join("/")}`;
      const isLast = index === paths.length - 1;
      let label = path.replace(/-/g, " ");

      // Traductions
      if (label === "trainings") label = "Mes Formations";
      if (label === "outputs") label = "Mes Outputs";

      return { label, href, isLast };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="h-screen w-screen bg-gray-50">
      <SidebarProvider>
        <div className="w-full flex h-full">
          <AppSidebar data={sidebarData} className="bg-white" />
          <main className="flex-1 overflow-y-auto bg-white">
            {/* Top bar: SidebarTrigger + Breadcrumb */}
            <div className="flex items-center justify-start gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
              <SidebarTrigger
                className={cn("bg-white text-tacir-darkblue hover:bg-gray-100")}
              />

              {/* Breadcrumb with TACIR colors */}
              <Breadcrumb>
                <BreadcrumbList className="flex items-center space-x-2 text-sm">
                  {/* Hardcoded "Project Holder" as the root breadcrumb */}
                  <BreadcrumbItem>Porteur de Projet</BreadcrumbItem>

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

            {/* Page content */}
            <div className="p-4 sm:p-6 md:p-8">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default ProjectHolderLayout;
