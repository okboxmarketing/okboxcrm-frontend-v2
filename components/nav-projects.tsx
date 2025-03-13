"use client"

import { type LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavProjects({
  projects,
  userRole,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
    roles: string[]
  }[]
  userRole: string
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>
          {userRole === "MASTER" ? "Gestão" : userRole === "ADVISOR" ? "Assessor" : "Administração"}
        </SidebarGroupLabel>
      </SidebarGroup>
      <SidebarMenu>
        {projects.map((item) =>
          item.roles.includes(userRole) ? (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : null
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
