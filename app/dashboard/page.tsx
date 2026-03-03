"use client";

import { useSession } from "@/lib/auth/client";

export default function DashboardPage() {
    const { data, isPending } = useSession();

    if (isPending) {
        return (
            <div className="flex w-full min-h-[50vh] items-center justify-center">
                <p className="text-zinc-500 animate-pulse">Memuat Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="w-full bg-white dark:bg-zinc-950 p-6 rounded-xl border shadow-sm">
                <div className="flex flex-col gap-2">
                    <p className="text-lg text-zinc-500">
                        Selamat datang kembali,
                    </p>
                    <h2 className="text-2xl font-semibold">
                        {data?.user?.name || "Pengguna"}
                    </h2>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
                            <h3 className="text-sm font-medium text-zinc-500 mb-1">Email Saat Ini</h3>
                            <p className="font-mono">{data?.user?.email}</p>
                        </div>
                        <div className="p-4 border rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
                            <h3 className="text-sm font-medium text-zinc-500 mb-1">ID Pengguna</h3>
                            <p className="font-mono text-xs">{data?.user?.id}</p>
                        </div>
                        <div className="p-4 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
                            <h3 className="text-sm font-medium text-zinc-500 mb-1">Peran Aplikasi</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${data?.user?.role === 'admin' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                                    {data?.user?.role || "viewer"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
