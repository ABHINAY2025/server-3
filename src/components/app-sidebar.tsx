"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

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
  name: "subbu",
  email: "subbu@fisecglobal.net",
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
      <SidebarHeader className="py-8">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!bg-transparent hover:!bg-transparent"
              isActive={false}
            >
              <Link href="/">
                <Image
                  src="/qdl-logo1.png"
                  alt="Quantum Data Leap"
                  width={160}
                  height={45}
                  priority
                />
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
