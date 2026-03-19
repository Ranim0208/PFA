import { NavUser } from "../sidebar/nav-user";
import useCurrentUser from "../../hooks/useCurrentUser";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarHeader,
  SidebarRail,
  SidebarFooter,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronRight, UserCircleIcon } from "lucide-react";

const renderSidebarItems = (items) => {
  return items.map((item, index) => {
    const hasNestedItems = item.items && item.items.length > 0;
    const title = item.title || item.name;
    const url = item.url || "#";
    const Icon = item.icon;

    return (
      <SidebarGroup key={`${title}-${index}`}>
        {hasNestedItems ? (
          <Collapsible defaultOpen className="group/collapsible">
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center gap-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground px-3 py-2">
                {Icon && <Icon className="h-4 w-4" />}
                {title}
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderSidebarItems(item.items)}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <SidebarMenuButton asChild>
            <a
              href={url}
              className="flex items-center gap-2 px-3 py-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {Icon && <Icon className="h-4 w-4" />}
              {title}
            </a>
          </SidebarMenuButton>
        )}
      </SidebarGroup>
    );
  });
};

function AppSidebar({ data }) {
  // Exclure les clés spéciales qui ne sont pas des sections de navigation
  const { user, loading } = useCurrentUser();
  const { ...sections } = data;

  return (
    <Sidebar>
      <SidebarHeader>
        <img
          src="/images/tacir-logo.png"
          alt="Tacir Banner"
          className="h-30 w-40 flex self-center object-contain"
        />
      </SidebarHeader>

      <SidebarContent className="px-2 gap-1">
        {Object.entries(sections).map(([sectionKey, sectionItems]) => (
          <div key={sectionKey} className="mb-4">
            <h3 className="px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">
              {sectionKey.replace(/([A-Z])/g, " $1").trim()}
            </h3>
            {renderSidebarItems(sectionItems)}
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter>
        {!loading && user && (
          <NavUser
            user={{
              name: user?.name || "Utilisateur",
              email: user?.email || "",
              avatar: user?.avatar || <UserCircleIcon />,
            }}
          />
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
