import { useState, useEffect } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

interface ManagedUser {
    id: string
    name: string
    email: string
    role: 'admin' | 'user'
    status: 'active' | 'disabled'
    createdAt: string
}

// ── Mock Data ────────────────────────────────────────────────
const mockUsers: ManagedUser[] = [
    { id: 'u0', name: 'Admin', email: 'admin@example.com', role: 'admin', status: 'active', createdAt: '2025-01-01' },
    { id: 'u1', name: 'User 1', email: 'user1@example.com', role: 'user', status: 'active', createdAt: '2025-06-15' },
    { id: 'u2', name: 'User 2', email: 'user2@example.com', role: 'user', status: 'active', createdAt: '2025-08-20' },
    { id: 'u3', name: 'User 3', email: 'user3@example.com', role: 'user', status: 'disabled', createdAt: '2025-11-03' },
]

const roleBadge = {
    admin: 'info' as const,
    user: 'default' as const,
}

const statusBadge = {
    active: 'success' as const,
    disabled: 'warning' as const,
}

export function UserManagement() {
    const [users, setUsers] = useState<ManagedUser[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newName, setNewName] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [newRole, setNewRole] = useState<'admin' | 'user'>('user')
    const [saving, setSaving] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/admin/users')
                if (res.ok) {
                    const data = await res.json()
                    if (data && data.length > 0) {
                        setUsers(data)
                        return
                    }
                }
                throw new Error('No data')
            } catch (e) {
                console.warn('API users fetch failed, using mock data:', e)
                setUsers(mockUsers)
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    // Add user
    const handleAdd = async () => {
        if (!newName.trim() || !newEmail.trim()) return
        setSaving(true)

        const newUser: ManagedUser = {
            id: 'u' + Date.now(),
            name: newName.trim(),
            email: newEmail.trim(),
            role: newRole,
            status: 'active',
            createdAt: new Date().toISOString().slice(0, 10),
        }

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            })
            if (res.ok) {
                const created = await res.json()
                setUsers((prev) => [...prev, created])
            } else {
                throw new Error('Create failed')
            }
        } catch (e) {
            console.warn('API create user failed, adding locally:', e)
            setUsers((prev) => [...prev, newUser])
        } finally {
            setSaving(false)
            setShowAddModal(false)
            setNewName('')
            setNewEmail('')
            setNewRole('user')
        }
    }

    // Update user role
    const handleUpdateRole = async (id: string, newRole: 'admin' | 'user') => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            })
            if (!res.ok) throw new Error('Update role failed')
        } catch (e) {
            console.warn('API update role failed, updating locally:', e)
        }
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)))
    }

    // Toggle user status
    const handleToggleStatus = async (id: string) => {
        const target = users.find((u) => u.id === id)
        if (!target) return
        const newStatus = target.status === 'active' ? 'disabled' : 'active'

        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })
            if (!res.ok) throw new Error('Update status failed')
        } catch (e) {
            console.warn('API update status failed, updating locally:', e)
        }
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u)))
    }

    // Delete user
    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Delete failed')
        } catch (e) {
            console.warn('API delete user failed, removing locally:', e)
        }
        setUsers((prev) => prev.filter((u) => u.id !== id))
        setDeleteConfirmId(null)
    }

    return (
        <div className="space-y-6 max-w-5xl">
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">帳號控管</h1>
                    <p className="mt-1 text-sm text-slate-500">管理系統中所有使用者帳號</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <svg className="w-4 h-4 mr-1.5 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    新增帳號
                </Button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">使用者</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Email</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">角色</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">狀態</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">建立日期</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                                {u.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-slate-900">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                                    <td className="px-6 py-4">
                                        {u.id === 'u0' ? (
                                            <Badge variant={roleBadge[u.role]}>管理員</Badge>
                                        ) : (
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleUpdateRole(u.id, e.target.value as 'admin' | 'user')}
                                                className="text-sm rounded-lg border border-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                            >
                                                <option value="user">使用者</option>
                                                <option value="admin">管理員</option>
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.id === 'u0' ? (
                                            <Badge variant={statusBadge[u.status]}>啟用</Badge>
                                        ) : (
                                            <button
                                                onClick={() => handleToggleStatus(u.id)}
                                                className="cursor-pointer"
                                            >
                                                <Badge variant={statusBadge[u.status]}>
                                                    {u.status === 'active' ? '啟用' : '停用'}
                                                </Badge>
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{u.createdAt}</td>
                                    <td className="px-6 py-4">
                                        {u.role !== 'admin' && (
                                            deleteConfirmId === u.id ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                                                    >
                                                        確認刪除
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(null)}
                                                        className="text-xs px-2 py-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer"
                                                    >
                                                        取消
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirmId(u.id)}
                                                    className="text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer"
                                                >
                                                    刪除
                                                </button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile */}
                <div className="md:hidden divide-y divide-slate-100">
                    {users.map((u) => (
                        <div key={u.id} className="px-4 py-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                        {u.name.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-slate-900">{u.name}</span>
                                </div>
                                {u.id === 'u0' ? (
                                    <Badge variant={roleBadge[u.role]}>管理員</Badge>
                                ) : (
                                    <select
                                        value={u.role}
                                        onChange={(e) => handleUpdateRole(u.id, e.target.value as 'admin' | 'user')}
                                        className="text-sm rounded-lg border border-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                    >
                                        <option value="user">使用者</option>
                                        <option value="admin">管理員</option>
                                    </select>
                                )}
                            </div>
                            <p className="text-sm text-slate-600">{u.email}</p>
                            <div className="flex items-center justify-between">
                                {u.id === 'u0' ? (
                                    <Badge variant={statusBadge[u.status]}>啟用</Badge>
                                ) : (
                                    <button onClick={() => handleToggleStatus(u.id)} className="cursor-pointer">
                                        <Badge variant={statusBadge[u.status]}>
                                            {u.status === 'active' ? '啟用' : '停用'}
                                        </Badge>
                                    </button>
                                )}
                                {u.role !== 'admin' && (
                                    <button
                                        onClick={() => handleDelete(u.id)}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer"
                                    >
                                        刪除
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">總帳號數</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{users.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">管理員</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">{users.filter((u) => u.role === 'admin').length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">啟用中</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">{users.filter((u) => u.status === 'active').length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">已停用</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{users.filter((u) => u.status === 'disabled').length}</p>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 w-full max-w-md mx-4">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">新增帳號</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">姓名</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="請輸入姓名"
                                    className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
                                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="請輸入 Email"
                                    className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
                                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">角色</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
                                    className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900
                                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                                >
                                    <option value="user">使用者</option>
                                    <option value="admin">管理員</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                                取消
                            </Button>
                            <Button onClick={handleAdd} loading={saving}>
                                新增
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
