"use client";
import { Frame, PieChart, User, FilePlus } from "lucide-react";
import { SidebarProvider } from "../../components/ui/sidebar";
import AppSidebar from "../../components/sidebar/AppSidebar";
function AdminLayout({ children }) {
  const sidebarData = {
    tacirMembers: [
      {
        name: "Gérer les membres Tacir",
        icon: User,
        url: "/admin/members",
        items: [],
      },
    ],
    Creathons: [
      {
        title: "Gérer Creathon",
        icon: FilePlus,
        url: "/admin/creathons",
      },
    ],
  };

  return (
    <div className="h-screen w-screen">
      <SidebarProvider>
        <div className="w-full flex">
          <AppSidebar data={sidebarData} />
          <div className="w-full">{children}</div>
        </div>
      </SidebarProvider>
    </div>
  );
}
export default AdminLayout;
