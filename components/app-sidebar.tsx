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
  UserCheck,
  Building,
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
import { ComponentProps, useEffect, useState } from "react";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => {
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
        roles: ["USER", "ADMIN", "ADVISOR"],
      },
      {
        title: "Atendimento",
        url: "/home/atendimento",
        icon: MessageCircle,
        isActive: true,
        roles: ["USER", "ADMIN", "ADVISOR"],
      },
      {
        title: "Kanban",
        url: "/home/kanban",
        icon: Kanban,
        isActive: true,
        roles: ["USER", "ADMIN", "ADVISOR"],
      },
      {
        title: "Contatos",
        url: "/home/contatos",
        icon: Contact,
        isActive: true,
        roles: ["USER", "ADMIN"],
      },
      {
        title: "Etapas do Funil",
        url: "/home/etapas-kanban",
        icon: Cone,
        isActive: true,
        roles: ["USER", "ADMIN", "ADVISOR"],
      },
      {
        title: "Vendas",
        url: "#",
        icon: ShoppingBag,
        items: [
          { title: "Histórico", url: "/home/vendas/historico", roles: ["USER", "ADMIN", "ADVISOR"] },
          { title: "Produtos", url: "/home/vendas/produtos", roles: ["USER", "ADMIN"] },
        ],
        roles: ["USER", "ADMIN", "ADVISOR"]
      },
      {
        title: "Perdas",
        url: "#",
        icon: MoveDownRight,
        items: [
          { title: "Histórico", url: "/home/perdas/historico", roles: ["USER", "ADMIN", "ADVISOR"] },
          { title: "Motivos", url: "/home/perdas/motivos", roles: ["USER", "ADMIN"] },
        ],
        roles: ["USER", "ADMIN", "ADVISOR"]
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
      // {
      //   name: "Configuração",
      //   url: "/home/configuracao",
      //   icon: Settings,
      //   roles: ["ADMIN", "ADVISOR"],
      // },
      {
        name: "Assessores",
        url: "/home/assessores",
        icon: UserCheck,
        roles: ["MASTER"],
      },
      {
        name: "Selecionar Empresa",
        url: "#",
        icon: Building,
        roles: ["ADVISOR"],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex flex-col items-center space-y-2">
        <div className="w-200 h-20">
          <Image src="/logo.png" width={200} height={20} alt="Logo" />
        </div>
        {/* <SidebarTrigger /> */}
      </SidebarHeader>
      <SidebarContent>
        {user?.userRole !== "MASTER" && <NavMain items={data.navMain} userRole={user?.userRole} />}
        {(user?.userRole === "ADMIN" || user?.userRole === "MASTER" || user?.userRole === "ADVISOR") && (
          <NavProjects projects={data.projects} userRole={user?.userRole} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} companyName={companyName} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
