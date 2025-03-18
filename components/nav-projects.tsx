"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AdvisorCompaniesDialog } from "@/components/advisor/advisor-companies-dialog";

export function NavProjects({
  projects,
  userRole,
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
    roles: string[];
  }[];
  userRole: string;
}) {
  const [companiesDialogOpen, setCompaniesDialogOpen] = useState(false);
  const pathname = usePathname();

  const handleItemClick = (e: React.MouseEvent, item: { name: string }) => {
    if (userRole === "ADVISOR" && item.name === "Selecionar Empresa") {
      e.preventDefault();
      setCompaniesDialogOpen(true);
    }
  };

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>
          {userRole === "MASTER"
            ? "Gestão"
            : userRole === "ADVISOR"
              ? "Assessor"
              : "Administração"}
        </SidebarGroupLabel>
        <SidebarMenu>
          {projects.map((item) => {
            const isActive = pathname === item.url;

            return item.roles.includes(userRole) ? (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <a
                    href={item.url}
                    onClick={(e) => handleItemClick(e, item)}
                    className={`flex items-center w-full px-4 py-2 ${isActive ? "bg-gray-200 dark:bg-gray-700 font-bold" : ""
                      }`}
                  >
                    <item.icon />
                    <span>{item.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null;
          })}
        </SidebarMenu>
      </SidebarGroup>

      <AdvisorCompaniesDialog
        open={companiesDialogOpen}
        onOpenChange={setCompaniesDialogOpen}
      />
    </>
  );
}
