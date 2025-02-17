"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  GalleryVerticalEnd,
  PieChart,
  Settings2,
  PlugZap,
  Contact,
  Settings,
  Building2,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/authContext";
import { findMyCompany } from "@/service/companyService";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const [companyName, setCompanyName] = React.useState<string>("");

  React.useEffect(() => {
    const fetchCompany = async () => {
      try {
        const company = await findMyCompany();
        setCompanyName(company.name);

      } catch (error) {
        console.error("Erro ao buscar empresa:", error);
      }
    };

    if (user) {
      fetchCompany();
    }
  }, [user]);

  if (!user) return null;

  const data = {
    user: {
      name: user.userName,
      email: user.userEmail,
    },
    team:
    {
      name: companyName,
      logo: GalleryVerticalEnd,
    },
    navMain: [
      {
        title: "Dashboard",
        url: "#",
        icon: PieChart,
        isActive: true,
      },
      {
        title: "Contatos",
        url: "/home/contatos",
        icon: Contact,
        isActive: true,
      },
      {
        title: "Kanban",
        url: "#",
        icon: Bot,
        items: [
          { title: "Genesis", url: "#" },
          { title: "Explorer", url: "#" },
          { title: "Quantum", url: "#" },
        ],
      },
      {
        title: "Vendas",
        url: "#",
        icon: BookOpen,
        items: [
          { title: "Introduction", url: "#" },
          { title: "Get Started", url: "#" },
          { title: "Tutorials", url: "#" },
          { title: "Changelog", url: "#" },
        ],
      },
      {
        title: "Perdas",
        url: "#",
        icon: Settings2,
        items: [
          { title: "General", url: "#" },
          { title: "Team", url: "#" },
          { title: "Billing", url: "#" },
          { title: "Limits", url: "#" },
        ],
      },
    ],
    projects: [
      {
        name: "Empresa",
        url:
          user.userRole === "ADMIN"
            ? `/home/minha-empresa`
            : user.userRole === "MASTER"
              ? `/home/empresas`
              : "/home",
        icon: Building2,
      },
      { name: "Conexão", url: "/home/conectar", icon: PlugZap },
      { name: "Configuração", url: "/home/configuracao", icon: Settings },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher team={data.team} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {(user.userRole === "ADMIN" || user.userRole === "MASTER") && (
          <NavProjects projects={data.projects} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
