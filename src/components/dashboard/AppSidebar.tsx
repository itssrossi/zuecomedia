
import {
  BarChart3,
  Package,
  Store,
  MessageSquare,
  TrendingUp,
  FileText,
  CheckSquare,
  DollarSign,
  HelpCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const mainMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Products", url: "/products", icon: Package },
  { title: "Store", url: "/store", icon: Store },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Statistics", url: "/statistics", icon: TrendingUp },
  { title: "Invoices", url: "/invoices", icon: FileText },
  { title: "To Do List", url: "/todo", icon: CheckSquare },
  { title: "Finances", url: "/finances", icon: DollarSign },
];

const supportMenuItems = [
  { title: "Help & Center", url: "/help", icon: HelpCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { signOut } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar 
      className="bg-slate-900 border-0" 
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-slate-700 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">DESKBOARD</span>
              <span className="text-xs text-gray-400">Sales Management Dashboard</span>
            </div>
          )}
        </div>
        {state === "expanded" && (
          <Button variant="ghost" size="sm" className="mt-2 text-gray-400 hover:text-white hover:bg-slate-800">
            <span className="text-xs">← Minimize</span>
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs font-medium mb-2">
            MAIN MENU
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={`
                      w-full h-10 px-3 rounded-lg text-gray-300 hover:bg-slate-800 hover:text-white transition-colors
                      ${isActive(item.url) ? 'bg-slate-800 text-white font-medium' : ''}
                    `}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-gray-400 text-xs font-medium mb-2">
            HELP & SUPPORT
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {supportMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={`
                      w-full h-10 px-3 rounded-lg text-gray-300 hover:bg-slate-800 hover:text-white transition-colors
                      ${isActive(item.url) ? 'bg-slate-800 text-white font-medium' : ''}
                    `}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-slate-700">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className="w-full h-10 px-3 rounded-lg text-gray-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="truncate">Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
