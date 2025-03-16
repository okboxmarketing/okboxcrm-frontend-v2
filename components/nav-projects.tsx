"use client"

import { useState } from "react"
import { type LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { AdvisorCompaniesDialog } from "@/components/advisor/advisor-companies-dialog"

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
  const [companiesDialogOpen, setCompaniesDialogOpen] = useState(false)

  const handleItemClick = (e: React.MouseEvent, item: { name: string }) => {
    if (userRole === "ADVISOR" && item.name === "Selecionar Empresa") {
      e.preventDefault()
      setCompaniesDialogOpen(true)
    }
  }

  return (
    <>
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
                  <a
                    href={item.url}
                    onClick={(e) => handleItemClick(e, item)}
                  >
                    <item.icon />
                    <span>{item.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null
          )}
        </SidebarMenu>
      </SidebarGroup>

      {/* Render the companies dialog */}
      <AdvisorCompaniesDialog
        open={companiesDialogOpen}
        onOpenChange={setCompaniesDialogOpen}
      />
    </>
  )
}
