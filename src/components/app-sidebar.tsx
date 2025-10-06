"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { NAV_SECTIONS, type NavSection } from "@/config/navigation"

const USER = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
}

function isSectionActive(section: NavSection, pathname: string) {
  if (pathname === section.href) {
    return true
  }

  return section.items?.some((item) => item.href === pathname) ?? false
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              isActive={pathname === "/"}
            >
              <Link href="/">
                <span className="text-base font-semibold">FiSec Control</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {NAV_SECTIONS.map((section) => {
            const sectionActive = isSectionActive(section, pathname)

            return (
              <SidebarMenuItem key={section.title}>
                <SidebarMenuButton asChild isActive={sectionActive}>
                  <Link href={section.href}>
                    {section.icon ? <section.icon className="size-4" /> : null}
                    <span>{section.title}</span>
                  </Link>
                </SidebarMenuButton>
                {section.items && section.items.length > 0 ? (
                  <SidebarMenuSub>
                    {section.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={pathname === item.href}>
                          <Link href={item.href}>
                            {item.icon ? <item.icon className="size-4" /> : null}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={USER} />
      </SidebarFooter>
    </Sidebar>
  )
}
