import { Link, useLocation } from "react-router-dom"
import { Home, Grid, Map as MapIcon, MessageCircle, Zap, Book, Settings, Shield, User } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

const items = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Parts Inventory", url: "/inventory", icon: Grid },
  { title: "Parts Map", url: "/map", icon: MapIcon },
  { title: "Inner Dialogue", url: "/dialogue", icon: MessageCircle },
  { title: "Update", url: "/update", icon: Zap },
  { title: "DataLinks", url: "/datalinks", icon: Book },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-16 items-center justify-center border-b px-4">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <Shield className="h-6 w-6" />
          <span className="group-data-[collapsible=icon]:hidden">Inner Atlas</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
