"use client";

import * as React from "react";
import {
  GalleryVerticalEnd,
  PieChart,
  PlugZap,
  Contact,
  Kanban,
  Cone,
  Building2,
  MessageCircle,
  MoveDownRight,
  ShoppingBag,
  Settings,
  UserCheck,
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
    if (user?.userRole !== "MASTER") {
      fetchCompany();
    }
  }, [user]);

  const data = {
    user: {
      name: user?.userName || "",
      email: user?.userEmail || "",
    },
    team: {
      name: companyName,
      logo: GalleryVerticalEnd,
    },
    navMain: [
      {
        title: "Dashboard - Em Breve",
        url: "#",
        icon: PieChart,
        isActive: true,
      },
      {
        title: "Atendimento",
        url: "/home/atendimento",
        icon: MessageCircle,
        isActive: true,
      },
      {
        title: "Kanban",
        url: "/home/kanban",
        icon: Kanban,
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
        url: "/home/etapas-kanban",
        icon: Cone,
        isActive: true,
      },
      {
        title: "Vendas",
        url: "#",
        icon: ShoppingBag,
        items: [
          { title: "Histórico", url: "/home/vendas/historico" },
          { title: "Produtos", url: "/home/vendas/produtos" },
        ],
      },
      {
        title: "Perdas",
        url: "#",
        icon: MoveDownRight,
        items: [
          { title: "Histórico", url: "/home/perdas/historico" },
          { title: "Motivos", url: "/home/perdas/motivos" },
        ],
      },
    ],
    projects: [
      {
        name: "Empresa",
        url:
          user?.userRole === "ADMIN"
            ? `/home/minha-empresa`
            : user?.userRole === "MASTER" || user?.userRole === "ADVISOR"
              ? `/home/empresas`
              : "/home",
        icon: Building2,
        roles: ["ADMIN", "ADVISOR", "MASTER"],
      },
      {
        name: "Conexão",
        url: "/home/conectar",
        icon: PlugZap,
        roles: ["ADMIN"],
      },
      {
        name: "Configuração",
        url: "/home/configuracao",
        icon: Settings,
        roles: ["ADMIN", "ADVISOR"],
      },
      {
        name: "Assessores",
        url: "/home/assessores",
        icon: UserCheck,
        roles: ["MASTER"],
      },
      {
        name: "Selecionar Empresa",
        url: "#", // This won't actually navigate anywhere
        icon: UserCheck, // Or any other icon you prefer
        roles: ["ADVISOR"], // Only for advisors
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="w-200 h-20">
          <Image src="/logo.png" width={200} height={20} alt="Logo" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {(user?.userRole !== "MASTER" || !user?.companyId) && <NavMain items={data.navMain} />}
        {(user?.userRole === "ADMIN" || user?.userRole === "MASTER" || user?.userRole === "ADVISOR") && (
          <NavProjects projects={data.projects} userRole={user?.userRole} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
