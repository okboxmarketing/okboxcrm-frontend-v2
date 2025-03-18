"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation"; // Importa o hook para pegar a URL atual
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
  userRole,
}: {
  userRole: string;
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    roles?: string[];
    items?: {
      title: string;
      url: string;
      roles?: string[];
    }[];
  }[];
}) {
  const pathname = usePathname(); // Obtém a URL atual

  const filteredItems = items.filter((item) => !item.roles || item.roles.includes(userRole));

  return (
    <SidebarGroup>
      <SidebarGroupLabel>CRM</SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item) => {
          const isActive = pathname === item.url || item.items?.some((subItem) => pathname === subItem.url);
          return item.items && item.items.length > 0 ? (
            <Collapsible key={item.title} asChild defaultOpen={isActive} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} className={isActive ? "bg-gray-200 dark:bg-gray-700" : ""}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items
                      .filter((subItem) => !subItem.roles || subItem.roles.includes(userRole))
                      .map((subItem) => {
                        const isSubActive = pathname === subItem.url;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <a
                                href={subItem.url}
                                className={`block w-full px-4 py-2 ${isSubActive ? "bg-gray-300 dark:bg-gray-800 font-bold" : ""
                                  }`}
                              >
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a
                  href={item.url}
                  className={`flex items-center w-full py-2 ${isActive ? "bg-gray-200 dark:bg-gray-700" : ""
                    }`}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
