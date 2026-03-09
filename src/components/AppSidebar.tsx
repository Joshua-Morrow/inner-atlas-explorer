import { Link, useLocation } from "react-router-dom"
import { Home, Grid, Map as MapIcon, MessageCircle, Zap, Book, ClipboardCheck, Shield, Sparkles } from "lucide-react"
import { useStore } from "@/lib/store"
import { useElaborationStore } from "@/lib/elaborationStore"

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
  { title: "Assessment", url: "/assessment", icon: ClipboardCheck },
]

export function AppSidebar() {
  const location = useLocation()
  const parts = useStore((s) => s.parts)
  const { getPartElaborationProgress, isPartElaborated } = useElaborationStore()

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

        {/* Elaboration section */}
        {parts.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <Sparkles className="h-3.5 w-3.5 mr-1.5 inline" />
              Elaboration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {parts.map((part) => {
                  const progress = getPartElaborationProgress(part.id)
                  const elaborated = isPartElaborated(part.id)
                  const isActive = location.pathname === `/elaborate/${part.id}`
                  return (
                    <SidebarMenuItem key={part.id}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={`${part.name} — ${progress}%`}>
                        <Link to={`/elaborate/${part.id}`} className="flex items-center gap-2">
                          {/* Progress ring */}
                          <div className="relative w-5 h-5 flex-shrink-0">
                            <svg viewBox="0 0 20 20" className="w-5 h-5 -rotate-90">
                              <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/40" />
                              <circle
                                cx="10" cy="10" r="8" fill="none"
                                stroke={elaborated ? 'hsl(var(--primary))' : 'currentColor'}
                                strokeWidth="2"
                                strokeDasharray={`${(progress / 100) * 50.26} 50.26`}
                                className={elaborated ? '' : 'text-primary/60'}
                              />
                            </svg>
                            {elaborated && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="h-2.5 w-2.5 text-primary" />
                              </div>
                            )}
                          </div>
                          <span className="truncate group-data-[collapsible=icon]:hidden">{part.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
