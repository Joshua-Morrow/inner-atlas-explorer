import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Button } from "./ui/button"
import { Plus } from "lucide-react"
import { Outlet } from "react-router-dom"

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b bg-card px-4 md:px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">Welcome back, Traveler</span>
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Part</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6 animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}