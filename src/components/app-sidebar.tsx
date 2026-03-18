import { Link } from '@tanstack/react-router'

import * as React from 'react'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { routeMapping } from '@/lib/route-mapping'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/dashboard">
                <img
                  src="/UCU-logo.png"
                  alt="UCU Logo"
                  className="size-8 shrink-0"
                />
                <span className="text-base font-semibold">UCU Timetabling</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={routeMapping.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={routeMapping.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
