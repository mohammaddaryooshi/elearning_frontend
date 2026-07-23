import { UsersTable } from "@/components/admin/users-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const users = [
    { id: "1", fullName: "مریم احمدی", phone: "09123456789", role: "student" as const },
    { id: "2", fullName: "علی شفیعی", phone: "09127654321", role: "student" as const },
    { id: "3", fullName: "مدیر سیستم", phone: "09120000000", role: "admin" as const },
];

export default function AdminUsersPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>مدیریت کاربران</CardTitle>
            </CardHeader>
            <CardContent>
                <UsersTable data={users} />
            </CardContent>
        </Card>
    );
}
