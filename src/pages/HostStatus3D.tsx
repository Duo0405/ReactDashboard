import { useState, useEffect } from 'react'
import { Badge } from '../components/ui/Badge'
import { ServerRoom3D } from '../components/visualization/ServerRoom3D'
import type { ServerData } from '../types/dashboard'

// ── Mock Data ────────────────────────────────────────────────
const servers: ServerData[] = [
    { id: 's1', name: 'web-prod-01', status: 'online', cpu: 45, ram: 62, disk: 78, uptime: '45 days' },
    { id: 's2', name: 'web-prod-02', status: 'online', cpu: 38, ram: 55, disk: 65, uptime: '45 days' },
    { id: 's3', name: 'api-prod-01', status: 'warning', cpu: 82, ram: 78, disk: 90, uptime: '12 days' },
    { id: 's4', name: 'db-prod-01', status: 'online', cpu: 55, ram: 70, disk: 45, uptime: '90 days' },
    { id: 's5', name: 'cache-prod-01', status: 'critical', cpu: 95, ram: 92, disk: 88, uptime: '3 days' },
    { id: 's6', name: 'lb-prod-01', status: 'online', cpu: 22, ram: 35, disk: 30, uptime: '120 days' },
]

const statusColor: Record<ServerData['status'], string> = {
    online: '#10b981',
    warning: '#f59e0b',
    critical: '#ef4444',
}

const statusBadgeVariant = {
    online: 'success' as const,
    warning: 'warning' as const,
    critical: 'danger' as const,
}

const statusLabel = {
    online: '正常',
    warning: '警告',
    critical: '異常',
}

// ── Metric Bar ───────────────────────────────────────────────
function MetricBar({ label, value }: { label: string; value: number }) {
    const color =
        value >= 90 ? 'bg-red-500' : value >= 70 ? 'bg-amber-500' : 'bg-emerald-500'

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">{label}</span>
                <span className="font-medium text-slate-900">{value}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    )
}

// ── Page ─────────────────────────────────────────────────────
export function HostStatus3D() {
    const [serversData, setServersData] = useState<ServerData[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    useEffect(() => {
        const fetchServers = async () => {
            try {
                const res = await fetch('/api/dashboard/servers')
                if (res.ok) {
                    const data = await res.json()
                    if (data && data.length > 0) {
                        setServersData(data)
                        setSelectedId(data[0].id)
                        return
                    }
                }
                throw new Error('No data')
            } catch (error) {
                console.warn('API servers fetch failed, using mock data:', error)
                setServersData(servers)
                setSelectedId(servers[0].id)
            } finally {
                setLoading(false)
            }
        }
        fetchServers()
    }, [])

    const selected = serversData.find(s => s.id === selectedId) || null

    return (
        <div className="space-y-6">
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            )}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">3D 主機監控</h1>
                <p className="mt-1 text-sm text-slate-500">
                    點擊伺服器查看詳細資訊，拖曳旋轉場景
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 3D Canvas */}
                <div className="lg:col-span-2">
                    {!loading && (
                        <ServerRoom3D
                            servers={serversData}
                            selectedServerId={selectedId}
                            onSelectServer={setSelectedId}
                            height={480}
                        />
                    )}
                </div>

                {/* Detail Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5 h-fit">
                    {selected ? (
                        <>
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {selected.name}
                                </h3>
                                <Badge variant={statusBadgeVariant[selected.status]}>
                                    {statusLabel[selected.status]}
                                </Badge>
                            </div>

                            <div className="text-sm text-slate-500">
                                Uptime: <span className="font-medium text-slate-700">{selected.uptime}</span>
                            </div>

                            <div className="space-y-4">
                                <MetricBar label="CPU" value={selected.cpu} />
                                <MetricBar label="RAM" value={selected.ram} />
                                <MetricBar label="Disk" value={selected.disk} />
                            </div>

                            {/* Server list mini */}
                            <div className="border-t border-slate-200 pt-4">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                                    所有伺服器
                                </p>
                                <div className="space-y-1.5">
                                    {serversData.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setSelectedId(s.id)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${selectedId === s.id
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className="font-medium">{s.name}</span>
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: statusColor[s.status] }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-slate-500">點擊 3D 場景中的伺服器查看詳細資訊</p>
                    )}
                </div>
            </div>
        </div>
    )
}
