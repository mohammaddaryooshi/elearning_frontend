"use client";

import { useMemo, useState } from "react";
import { Plus, Search, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UsersTable, type AdminUserRow } from "@/features/admin/users/components/UsersTable";

const initialUsers: AdminUserRow[] = [
    { id: "1", fullName: "مریم احمدی", phone: "09123456789", email: "maryam@example.com", role: "student", created_at: "1405/04/29" },
    { id: "2", fullName: "علی شفیعی", phone: "09127654321", email: "ali@example.com", role: "student", created_at: "1405/04/29" },
    { id: "3", fullName: "مدیر سیستم", phone: "09120000000", email: "admin@example.com", role: "admin", created_at: "1405/04/29" },
    { id: "4", fullName: "رضا محمدی", phone: "09121112233", email: "reza@example.com", role: "teacher", created_at: "1405/04/29" },
    { id: "5", fullName: "سارا کریمی", phone: "09134445566", email: "sara@example.com", role: "student", created_at: "1405/04/29" },
    { id: "6", fullName: "سارا کریمی", phone: "09134445566", email: "sara@example.com", role: "student", created_at: "1405/04/29" },
    { id: "7", fullName: "سارا کریمی", phone: "09134445566", email: "sara@example.com", role: "student", created_at: "1405/04/29" },
    { id: "8", fullName: "سارا کریمی", phone: "09134445566", email: "sara@example.com", role: "student", created_at: "1405/04/29" },
    { id: "9", fullName: "سارا کریمی", phone: "09134445566", email: "sara@example.com", role: "student", created_at: "1405/04/29" },
    { id: "10", fullName: "سارا کریمی", phone: "09134445566", email: "sara@example.com", role: "student", created_at: "1405/04/29" },
    { id: "11", fullName: "سارا کریمی", phone: "09134445566", email: "sara@example.com", role: "student", created_at: "1405/04/29" },
    { id: "12", fullName: "سارا کریمی", phone: "09134445566", email: "sara@example.com", role: "student", created_at: "1405/04/29" },
    { id: "13", fullName: "سارا کریمی", phone: "09134445566", email: "sara@example.com", role: "student", created_at: "1405/04/29" },
    { id: "14", fullName: "سارا کریمی", phone: "09134445566", email: "sara@example.com", role: "student", created_at: "1405/04/29" },
];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUserRow[]>(initialUsers);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);

    const filteredUsers = useMemo(() => {
        const query = search.trim();
        if (!query) return users;
        return users.filter(
            (user) =>
                user.fullName.includes(query) ||
                user.phone.includes(query) ||
                (user.email ?? "").includes(query)
        );
    }, [search, users]);

    const handleAddUser = (formData: FormData) => {
        const fullName = String(formData.get("fullName") ?? "").trim();
        const phone = String(formData.get("phone") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim();

        if (!fullName || !phone) return;

        setUsers((prev) => [
            {
                id: crypto.randomUUID(),
                fullName,
                phone,
                email: email || undefined,
                created_at: undefined,
                role: "student",
            },
            ...prev,
        ]);
        setDialogOpen(false);
    };

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        setUsers((prev) => prev.filter((user) => user.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">مدیریت کاربران</h2>
                <p className="text-sm text-muted-foreground">مشاهده، جستجو و مدیریت کاربران ثبت شده در سایت.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>لیست کاربران</CardTitle>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative">
                            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="جستجو بر اساس نام، شماره یا ایمیل..."
                                className="w-full pr-9 sm:w-64"
                            />
                        </div>

                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    افزودن کاربر
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        handleAddUser(new FormData(event.currentTarget));
                                    }}
                                >
                                    <DialogHeader>
                                        <DialogTitle>افزودن کاربر جدید</DialogTitle>
                                        <DialogDescription>
                                            اطلاعات کاربر جدید را وارد کنید.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="mt-4 space-y-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="fullName">نام و نام خانوادگی</Label>
                                            <Input id="fullName" name="fullName" required placeholder="مثال: علی رضایی" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="phone">شماره تماس</Label>
                                            <Input id="phone" name="phone" required placeholder="09xxxxxxxxx" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="email">ایمیل (اختیاری)</Label>
                                            <Input id="email" name="email" type="email" placeholder="example@mail.com" />
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button type="submit">ذخیره کاربر</Button>
                                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                            انصراف
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <UsersTable
                        data={filteredUsers}
                        onDelete={setDeleteTarget}
                        hasPagination={true}
                    />
                </CardContent>
            </Card>

            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserX className="h-5 w-5 text-destructive" />
                            حذف کاربر
                        </DialogTitle>
                        <DialogDescription>
                            آیا از حذف کاربر «{deleteTarget?.fullName}» اطمینان دارید؟ این عملیات قابل بازگشت نیست.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="default" className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleConfirmDelete}>
                            حذف کاربر
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            انصراف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
