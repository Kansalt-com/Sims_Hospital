import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/client";
import { userApi } from "../../api/services";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Loader } from "../../components/ui/Loader";
import { Select } from "../../components/ui/Select";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../types";
import { formatDateTime } from "../../utils/format";

type ManagedUser = User & {
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    username: "",
    role: "RECEPTION",
    password: "",
  });

  const adminCount = useMemo(() => users.filter((user) => user.role === "ADMIN").length, [users]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await userApi.list();
      setUsers(res.data.data as ManagedUser[]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await userApi.create(form);
      setUsers((prev) => [res.data.data as ManagedUser, ...prev]);
      toast.success("User created");
      setForm({ name: "", username: "", role: "RECEPTION", password: "" });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user: ManagedUser) => {
    try {
      const res = await userApi.update(user.id, { active: !user.active });
      setUsers((prev) => prev.map((row) => (row.id === user.id ? { ...row, ...(res.data.data as Partial<ManagedUser>) } : row)));
      toast.success(`User ${user.active ? "disabled" : "enabled"}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const resetPassword = async (user: ManagedUser) => {
    const password = prompt(`Set new password for ${user.username}`);
    if (!password) return;

    try {
      await userApi.resetPassword(user.id, password);
      toast.success("Password reset done. User must change it at next login.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const deleteUser = async (user: ManagedUser) => {
    if (user.role === "ADMIN" && adminCount <= 1) {
      toast.error("The last admin cannot be deleted.");
      return;
    }

    if (!window.confirm(`Delete user ${user.username}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(user.id);
    try {
      await userApi.remove(user.id);
      setUsers((prev) => prev.filter((row) => row.id !== user.id));
      toast.success("User deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">User Management</h1>
        <p className="text-sm text-slate-500">Create and control staff accounts and access.</p>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Create New User</h2>
        <form onSubmit={createUser} className="grid gap-3 md:grid-cols-4">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Username"
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            required
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
          >
            <option value="RECEPTION">Reception/Billing</option>
            <option value="DOCTOR">Doctor</option>
            <option value="ADMIN">Admin</option>
          </Select>
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
          <div className="md:col-span-4">
            <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create User"}</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Users</h2>
        {loading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2">Name</th>
                  <th className="py-2">Username</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Active</th>
                  <th className="py-2">Created</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const deleting = deletingId === user.id;
                  const deletingLastAdmin = user.role === "ADMIN" && adminCount <= 1;

                  return (
                    <tr key={user.id} className="border-b border-slate-100">
                      <td className="py-3">
                        <p className="font-medium text-slate-900">{user.name}</p>
                        {currentUser?.id === user.id ? <p className="text-xs text-slate-500">Current session</p> : null}
                      </td>
                      <td className="py-3">{user.username}</td>
                      <td className="py-3">{user.role}</td>
                      <td className="py-3">{user.active ? "Yes" : "No"}</td>
                      <td className="py-3">{formatDateTime(user.createdAt)}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="secondary" className="h-9 px-3 py-1 text-xs" onClick={() => toggleActive(user)}>
                            {user.active ? "Disable" : "Enable"}
                          </Button>
                          <Button variant="ghost" className="h-9 px-3 py-1 text-xs" onClick={() => resetPassword(user)}>
                            Reset Password
                          </Button>
                          <Button
                            variant="danger"
                            className="h-9 px-3 py-1 text-xs"
                            disabled={deleting || deletingLastAdmin}
                            onClick={() => deleteUser(user)}
                          >
                            {deleting ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
