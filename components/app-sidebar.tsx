"use client";

import { Home, Users, Settings, LogOut, Map } from "lucide-react";
import { useSession, signOut } from "@/lib/auth/client";
import { usePathname, useRouter } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
    const { data } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const { setOpenMobile } = useSidebar();

    const isAdmin = data?.user?.role === "admin";

    const navItems = [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: Home,
            show: true,
        },
        {
            title: "User Management",
            url: "/dashboard/users",
            icon: Users,
            show: isAdmin,
        }
    ];

    const handleNavigation = (url: string) => {
        router.push(url);
        setOpenMobile(false);
    };

    const handleSignOut = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/");
                },
            },
        });
    };

    return (
        <Sidebar variant="inset">
            <SidebarHeader className="p-4">
                <h2 className="text-xl font-bold tracking-tight px-2 text-zinc-900 dark:text-zinc-50">Litbang App</h2>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => {
                                if (!item.show) return null;

                                const isActive = pathname === item.url;

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleNavigation(item.url);
                                            }}
                                            tooltip={item.title}
                                        >
                                            <a href={item.url} className="cursor-pointer">
                                                <item.icon className="w-4 h-4" />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t">
                <SidebarMenu>
                    <SidebarMenuItem className="mb-2 px-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{data?.user?.name || "Loading..."}</span>
                            <span className="text-xs text-zinc-500 capitalize">{data?.user?.role || "viewer"}</span>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleSignOut}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
