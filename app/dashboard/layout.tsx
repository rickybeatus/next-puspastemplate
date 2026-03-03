"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex w-full h-screen overflow-hidden bg-zinc-50/50 dark:bg-zinc-950">
                <AppSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white dark:bg-zinc-900 px-4 shadow-sm z-10">
                        <SidebarTrigger className="-ml-1" />
                        <div className="w-full flex justify-end">
                            {/* Additional header actions can go here */}
                        </div>
                    </header>
                    <main className="flex-1 overflow-auto bg-transparent">
                        <div className="container mx-auto p-4 md:p-6 max-w-7xl animate-in fade-in duration-300">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
