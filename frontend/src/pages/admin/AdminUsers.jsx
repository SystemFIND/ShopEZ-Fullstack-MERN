import React from "react";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";

const ROLES = ["customer", "seller", "admin"];

export default function AdminUsers() {
    const { user: me } = useAuth();
    const [users, setUsers] = React.useState(null);

    React.useEffect(() => {
        load();
    }, []);

    function load() {
        api.get("/admin/users").then(({ data }) => setUsers(data));
    }

    async function changeRole(id, role) {
        try {
            await api.put(`/admin/users/${id}/role`, { role });
            toast.success("Role updated");
            load();
        } catch {
            toast.error("Failed to update role");
        }
    }

    async function handleDelete(u) {
        if (!window.confirm(`Delete user ${u.email}?`)) return;
        try {
            await api.delete(`/admin/users/${u.id}`);
            toast.success("User deleted");
            load();
        } catch {
            toast.error("Failed to delete user");
        }
    }

    return (
        <AdminLayout title="Users">
            {users === null ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-12 ez-skel" />)}</div>
            ) : (
                <div className="border border-neutral-200 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-neutral-200 bg-neutral-50">
                            <tr className="text-left">
                                <th className="px-4 py-3 ez-overline">Name</th>
                                <th className="px-4 py-3 ez-overline">Email</th>
                                <th className="px-4 py-3 ez-overline">Role</th>
                                <th className="px-4 py-3 ez-overline text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-b border-neutral-100 last:border-0" data-testid={`admin-user-row-${u.id}`}>
                                    <td className="px-4 py-3 font-medium">{u.name}</td>
                                    <td className="px-4 py-3 text-neutral-600">{u.email}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            data-testid={`admin-user-role-${u.id}`}
                                            value={u.role}
                                            onChange={(e) => changeRole(u.id, e.target.value)}
                                            disabled={u.id === me?.id}
                                            className="ez-input py-1 px-2 text-xs"
                                        >
                                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(u)}
                                            disabled={u.id === me?.id}
                                            data-testid={`admin-user-delete-${u.id}`}
                                            className="p-2 hover:bg-neutral-100 text-red-600 disabled:opacity-30"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} strokeWidth={1.5} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
}
