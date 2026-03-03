"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, ShieldAlert, Trash2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Define the User type based on Drizzle schema expectations
type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
};

// We need the adminClient wrapper to expose 'admin' methods 
// Since better-auth wraps plugins, we create an admin-capable client ad-hoc here or use a dedicated export if we exposed it
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const adminAuthClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    plugins: [adminClient()],
});

export default function UsersManagementPage() {
    const { data: sessionData, isPending: isSessionPending } = useSession();
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State for Dialogs
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>("viewer");

    // State for Add User
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
    const [newUserName, setNewUserName] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newUserRole, setNewUserRole] = useState("viewer");
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    useEffect(() => {
        // Strict Client-side RBAC protection
        if (!isSessionPending) {
            if (!sessionData?.user || sessionData.user.role !== "admin") {
                toast.error("Akses Ditolak. Anda bukan admin.");
                router.push("/dashboard");
                return;
            }
            fetchUsers();
        }
    }, [sessionData, isSessionPending, router]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            // Use the better-auth admin plugin to list users
            const { data, error } = await adminAuthClient.admin.listUsers({
                query: { limit: 50 }
            });

            if (error) throw error;
            if (data?.users) {
                setUsers(data.users as unknown as User[]);
            }
        } catch (error: any) {
            toast.error("Gagal mengambil data pengguna: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    const handleRoleClick = (user: User) => {
        setSelectedUser(user);
        setSelectedRole(user.role);
        setIsRoleDialogOpen(true);
    };

    const executeCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsCreatingUser(true);
        try {
            const { error } = await adminAuthClient.admin.createUser({
                name: newUserName,
                email: newUserEmail,
                password: newUserPassword,
                role: newUserRole as "admin" | "user",
            });

            if (error) throw error;

            toast.success(`Pengguna ${newUserName} berhasil ditambahkan.`);
            setIsAddUserDialogOpen(false);

            // Reset form
            setNewUserName("");
            setNewUserEmail("");
            setNewUserPassword("");
            setNewUserRole("viewer");

            fetchUsers();
        } catch (error: any) {
            toast.error("Gagal menambah pengguna: " + error.message);
        } finally {
            setIsCreatingUser(false);
        }
    };

    const executeDelete = async () => {
        if (!selectedUser) return;

        try {
            const { error } = await adminAuthClient.admin.removeUser({
                userId: selectedUser.id
            });

            if (error) throw error;

            toast.success(`Pengguna ${selectedUser.name} berhasil dihapus.`);
            fetchUsers(); // Refresh list
        } catch (error: any) {
            toast.error("Gagal menghapus: " + error.message);
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedUser(null);
        }
    };

    const executeRoleChange = async () => {
        if (!selectedUser) return;

        try {
            const { error } = await adminAuthClient.admin.setRole({
                userId: selectedUser.id,
                role: selectedRole as "admin" | "user", // The plugin TS expects 'user', but runtime accepts our 'viewer' override
            });

            if (error) throw error;

            toast.success(`Peran ${selectedUser.name} berhasil diubah menjadi ${selectedRole}.`);
            fetchUsers();
        } catch (error: any) {
            toast.error("Gagal mengubah peran: " + error.message);
        } finally {
            setIsRoleDialogOpen(false);
            setSelectedUser(null);
        }
    };

    if (isSessionPending || isLoading) {
        return (
            <div className="flex w-full min-h-[50vh] items-center justify-center">
                <p className="text-zinc-500 animate-pulse">Memuat Data Pengguna...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex justify-between items-center mb-2 mt-4 px-2">
                <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
                <Button onClick={() => setIsAddUserDialogOpen(true)}>Tambah Pengguna</Button>
            </div>

            <div className="border bg-white dark:bg-zinc-950 rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableHead className="w-[200px]">Nama</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Peran (Role)</TableHead>
                            <TableHead className="w-[100px] text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                                        {user.role}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Buka menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleRoleClick(user)}>
                                                <ShieldAlert className="mr-2 h-4 w-4" />
                                                <span>Ubah Peran (Role)</span>
                                            </DropdownMenuItem>
                                            {/* Prevent deleting oneself to avoid breaking session immediately */}
                                            {sessionData?.user.id !== user.id && (
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                    onClick={() => handleDeleteClick(user)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Hapus Pengguna</span>
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                                    Tidak ada pengguna ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add User Dialog */}
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                        <DialogDescription>
                            Isi formulir di bawah ini untuk mendaftarkan akun pengguna baru ke dalam sistem.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={executeCreateUser} className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                required
                                disabled={isCreatingUser}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                required
                                disabled={isCreatingUser}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={newUserPassword}
                                onChange={(e) => setNewUserPassword(e.target.value)}
                                required
                                disabled={isCreatingUser}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Peran (Role)</Label>
                            <Select
                                value={newUserRole}
                                onValueChange={setNewUserRole}
                                disabled={isCreatingUser}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Peran" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="viewer">Viewer (Standar)</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsAddUserDialogOpen(false)} disabled={isCreatingUser}>Batal</Button>
                            <Button type="submit" disabled={isCreatingUser}>
                                {isCreatingUser ? "Menyimpan..." : "Tambah Akun"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Role Change Dialog */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Ubah Peran Pengguna</DialogTitle>
                        <DialogDescription>
                            Ganti tingkat akses (role) untuk <strong>{selectedUser?.name}</strong>. Admin memiliki kontrol penuh atas sistem.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Select
                                value={selectedRole}
                                onValueChange={setSelectedRole}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Peran" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="viewer">Viewer (Standar)</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Batal</Button>
                        <Button onClick={executeRoleChange}>Simpan Perubahan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan secara permanen menghapus akun
                            <strong> {selectedUser?.name}</strong> beserta semua data dan sesi yang tersambung.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeDelete}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Hapus Akun
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
