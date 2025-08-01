"use client"
import {
    PieChart,
    MessageCircle,
    Kanban,
    Contact,
    Cone,
    ShoppingBag,
    MoveDownRight,
    Building2,
    // Settings,
    ChevronsUpDown,
    LogOut,
    ChevronRight,
    PlugZap,
    UserCheck,
    Building,
    // Ticket,
    Settings,
    HelpCircle,
    Ticket,
    Webhook,
    FileVideo,
    MessageSquare,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import useAuthStore from "@/store/authStore"
import { useEffect, useState } from "react"
import { AdvisorCompaniesDialog } from "../advisor/advisor-companies-dialog"
import { UserAvatar } from "../ui/user-avatar"

interface NavItem {
    title: string;
    url: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    items?: { title: string; url: string; }[];
}

const navItems: NavItem[] = [
    { title: "Kanban", url: "/home/kanban", icon: Kanban },
    { title: "Atendimento", url: "/home/atendimento", icon: MessageCircle },
    { title: "Tickets", url: "/home/tickets", icon: Ticket },
    { title: "Ajuda", url: "/home/ajuda", icon: HelpCircle },
    { title: "Mensagens Rápidas", url: "/home/mensagens-rapidas", icon: MessageSquare },
]

const adminItems: NavItem[] = [
    { title: "Dashboard", url: "/home", icon: PieChart },
    { title: "Etapas do Funil", url: "/home/etapas-kanban", icon: Cone },
    { title: "Criativos", url: "/home/criativos", icon: FileVideo },
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
    { title: "Conexão", url: "/home/conectar", icon: PlugZap },
]

const adminOnlyItems: NavItem[] = [
    { title: "Contatos", url: "/home/contatos", icon: Contact },
    { title: "Empresa", url: "/home/minha-empresa", icon: Building2 },
    { title: "Configurações", url: "/home/configuracao", icon: Settings },
]

const masterItems = [
    { name: "Empresas", url: "/home/empresas", icon: Building },
    { name: "Assessores", url: "/home/assessores", icon: UserCheck },
]

const advisorItems = [
    { name: "Minhas Empresas", url: "/home/empresas", icon: Building2 },
    { name: "Integração", url: "/home/integracao", icon: Webhook },
]

export function AppSidebar() {
    const pathname = usePathname()
    const [companiesDialogOpen, setCompaniesDialogOpen] = useState(false)
    const { user, initializeAuth, logout } = useAuthStore()

    const handleChangeCompany = (e: React.MouseEvent) => {
        e.preventDefault();
        setCompaniesDialogOpen(true);
    };


    useEffect(() => {
        initializeAuth()
    }, [initializeAuth])

    const handleLogout = async () => {
        try {
            logout()

            await new Promise(resolve => setTimeout(resolve, 50))

            window.location.href = "/"
        } catch (error) {
            console.error('Erro durante logout:', error)
            window.location.href = "/"
        }
    }

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="flex flex-col items-center space-y-2">
                <div className="w-full h-20 relative flex items-center justify-center">
                    <Image
                        src="/logo.png"
                        width={180}
                        height={60}
                        alt="Logo"
                        style={{ width: "auto", height: "auto" }}
                    />
                </div>
            </SidebarHeader>


            <SidebarContent>
                {user?.userRole === "USER" || user?.userRole === "ADMIN" || (user?.userRole === "ADVISOR" && user?.companyId) ? (
                    <SidebarGroup>
                        <SidebarGroupLabel>CRM</SidebarGroupLabel>
                        <SidebarMenu>
                            {navItems.map((item) => {
                                const isActive = pathname === item.url || item.items?.some((subItem) => pathname === subItem.url)

                                return item.items && item.items.length > 0 ? (
                                    <Collapsible key={item.title} asChild defaultOpen={isActive} className="group/collapsible">
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton tooltip={item.title} className={isActive ? "bg-sidebar-accent" : ""}>
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items.map((subItem) => {
                                                        const isSubActive = pathname === subItem.url
                                                        return (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton asChild isActive={isSubActive}>
                                                                    <Link href={subItem.url}>{subItem.title}</Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        )
                                                    })}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                ) : (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link href={item.url}>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                ) : null}
                {user?.userRole === "ADMIN" || (user?.userRole === "ADVISOR" && user?.companyId) ? (
                    <SidebarGroup>
                        <SidebarGroupLabel>Administrador</SidebarGroupLabel>
                        <SidebarMenu>
                            {adminItems.map((item) => {
                                const isActive = pathname === item.url || item.items?.some((subItem) => pathname === subItem.url)

                                return item.items && item.items.length > 0 ? (
                                    <Collapsible key={item.title} asChild defaultOpen={isActive} className="group/collapsible">
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton tooltip={item.title} className={isActive ? "bg-sidebar-accent" : ""}>
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items.map((subItem) => {
                                                        const isSubActive = pathname === subItem.url
                                                        return (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton asChild isActive={isSubActive}>
                                                                    <Link href={subItem.url}>{subItem.title}</Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        )
                                                    })}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                ) : (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                ) : null}
                {user?.userRole === "ADMIN" ? (
                    <SidebarGroup>
                        <SidebarGroupLabel>Área da Empresa</SidebarGroupLabel>
                        <SidebarMenu>
                            {adminOnlyItems.map((item) => {
                                const isActive = pathname === item.url
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                ) : null}
                {user?.userRole === "ADVISOR" ? (
                    <SidebarGroup>
                        <SidebarGroupLabel>Assessor</SidebarGroupLabel>
                        <SidebarMenu>
                            {advisorItems.map((item) => {
                                const isActive = pathname === item.url
                                return (
                                    <SidebarMenuItem key={item.name}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.name}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                ) : null}
                {user?.userRole === "MASTER" ? (
                    <SidebarGroup>
                        <SidebarGroupLabel>Okbox</SidebarGroupLabel>
                        <SidebarMenu>
                            {masterItems.map((item) => {
                                const isActive = pathname === item.url
                                return (
                                    <SidebarMenuItem key={item.name}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.name}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                ) : null}
                {user?.userRole === "MASTER" && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Ajuda</SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/home/ajuda"}>
                                    <Link href="/home/ajuda">
                                        <HelpCircle />
                                        <span>Ajuda</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                )}

            </SidebarContent>
            <h1 className="px-4 text-xs">Versão {process.env.NEXT_PUBLIC_VERSION}</h1>
            <SidebarFooter>
                <SidebarMenu>
                    {user?.userRole === "ADVISOR" ? (
                        <SidebarMenuItem className="p-2">
                            <SidebarMenuButton onClick={(e) => handleChangeCompany(e)} className="w-full  bg-black text-white textcenter justify-center hover:bg-black/80 hover:text-white">
                                <Building2 className="mr-2" />
                                Trocar Empresa
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ) : null}
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <UserAvatar
                                        name={user?.userName || "Usuário"}
                                        pictureUrl={user?.companyImage}
                                        className="h-8 w-8 rounded-lg items-center bg-black text-white justify-center"
                                    />
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user?.userName || "Usuário"}</span>
                                        <span className="truncate text-xs">{user?.companyName || "Empresa"}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="right"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <UserAvatar
                                            name={user?.userName || "Usuário"}
                                            pictureUrl={user?.companyImage}
                                            className="h-8 w-8 rounded-lg items-center bg-black text-white justify-center"
                                        />
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{user?.userName || "Usuário"}</span>
                                            <span className="truncate text-xs">{user?.userEmail || "email@exemplo.com"}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sair
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
            <AdvisorCompaniesDialog
                open={companiesDialogOpen}
                onOpenChange={setCompaniesDialogOpen}
            />
        </Sidebar>
    )
}
