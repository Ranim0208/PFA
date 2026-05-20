"use client";
import { User } from "lucide-react";
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

function AdminLayout({ children }) {
  const pathname = usePathname();

  const sidebarData = {
    MemberesTacir: [
      {
        name: "Gestion des Membres",
        icon: User,
        url: "/admin/members",
        items: [],
      },
    ],
  };

  const generateBreadcrumbs = () => {
    // Remove "admin" from the breadcrumb list
    const paths = pathname.split("/").filter(Boolean).slice(1);

    return paths.map((path, index) => {
      const href = `/admin/${paths.slice(0, index + 1).join("/")}`;
      const isLast = index === paths.length - 1;
      let label = path.replace(/-/g, " ");

      // Traductions
      if (label === "members") label = "Gestion des Membres";
      if (label === "profile") label = "Mon profil";
      // Ajoutez d'autres traductions au besoin

      return { label, href, isLast };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="min-h-screen w-screen overflow-x-hidden">
      <SidebarProvider>
        <div className="w-full flex">
          <AppSidebar data={sidebarData} className="bg-white" />
          <main className="overflow-y-auto w-full bg-white overflow-x-hidden">
            {/* Top bar: SidebarTrigger + Breadcrumb */}
            <div className="flex items-center justify-start gap-3 px-6 my-2">
              <SidebarTrigger
                className={cn("bg-transparent text-tacir-darkblue")}
              />

              <Breadcrumb>
                <BreadcrumbList className="flex items-center space-x-2 text-sm">
                  {/* Root "Admin" as static, not clickable */}
                  <BreadcrumbItem>
                    <BreadcrumbPage className="py-1 text-tacir-darkblue font-semibold">
                      Admin
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

            <div className="max-w-screen overflow-x-hidden"> {children}</div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default AdminLayout;
