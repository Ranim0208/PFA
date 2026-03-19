"use client";

import * as React from "react";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import tacirBanner from "../../../public/images/tacir-banner.jpg";
export function TeamSwitcher({ info }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div>
            <img src={tacirBanner} height={50} width={50} alt="tacir-logo" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{info.name}</span>
            <span className="truncate text-xs">{info.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
