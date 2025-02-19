"use client";

import * as React from "react";
import {
  GalleryVerticalEnd,
  PieChart,
  PlugZap,
  Contact,
  Kanban,
  Settings,
  Cone,
  Building2,
  MessageCircle,
  MoveDownRight,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
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


  const data = {
    user: {
      name: user?.userName || "",
      email: user?.userEmail || "",
    },
    team:
    {
      name: companyName,
      logo: GalleryVerticalEnd,
    },
    navMain: [
      {
        title: "Atendimento",
        url: "/home/atendimento",
        icon: MessageCircle,
        isActive: true,
      },
      {
        title: "Kanban",
        url: "#",
        icon: Kanban,
        isActive: true,
      },
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
        title: "Etapas do Funil",
        url: "#",
        icon: Cone,
        isActive: true,
      },
      {
        title: "Vendas",
        url: "#",
        icon: ShoppingBag,
        items: [
          { title: "Histórico", url: "#" },
          { title: "Produtos", url: "#" },
        ],
      },
      {
        title: "Perdas",
        url: "#",
        icon: MoveDownRight,
        items: [
          { title: "Histórico", url: "#" },
          { title: "Motivos", url: "#" },
        ],
      },
    ],
    projects: [
      {
        name: "Empresa",
        url:
          user?.userRole === "ADMIN"
            ? `/home/minha-empresa`
            : user?.userRole === "MASTER"
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
        <div className="w-200 h-20">
          <Image
            src="/logo.png"
            width={200}
            height={20}
            alt="Logo"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {(user?.userRole === "ADMIN" || user?.userRole === "MASTER") && (
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
