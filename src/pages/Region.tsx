import { useEffect, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { WorldMap } from '../components/visualization/WorldMap'
import type { RegionData } from '../types/dashboard'

// ── Mock Data ────────────────────────────────────────────────
const regionsInfo: RegionData[] = [
    {
        id: 'na',
        name: '北美洲',
        status: 'online',
        activeNodes: 124,
        totalNodes: 125,
        latency: 45,
        color: 0x3b82f6,
        path: [80, 200, 240, 200, 250, 250, 220, 250, 150, 350, 70, 200]
    },
    {
        id: 'sa',
        name: '南美洲',
        status: 'warning',
        activeNodes: 42,
        totalNodes: 45,
        latency: 120,
        color: 0xf59e0b,
        path: [200, 330, 260, 310, 300, 380, 320, 400, 240, 480]
    },
    {
        id: 'eu',
        name: '歐洲',
        status: 'online',
        activeNodes: 88,
        totalNodes: 88,
        latency: 35,
        color: 0x10b981,
        path: [480, 210, 520, 200, 490, 240, 320, 260, 360, 200]
    },
    {
        id: 'af',
        name: '非洲',
        status: 'online',
        activeNodes: 56,
        totalNodes: 58,
        latency: 85,
        color: 0x8b5cf6,
        path: [370, 270, 460, 270, 480, 289, 450, 440, 390, 440, 340, 280]
    },
    {
        id: 'as',
        name: '亞洲',
        status: 'critical',
        activeNodes: 156,
        totalNodes: 180,
        latency: 210,
        color: 0xef4444,
        path: [490, 200, 750, 200, 780, 180, 680, 270, 580, 290, 510, 200]
    },
    {
        id: 'oc',
        name: '大洋洲',
        status: 'online',
        activeNodes: 32,
        totalNodes: 32,
        latency: 65,
        color: 0x0ea5e9,
        path: [620, 360, 700, 360, 720, 400, 680, 400, 600, 420]
    }
]

const statusBadgeVariant = {
    online: 'success' as const,
    warning: 'warning' as const,
    critical: 'danger' as const,
}

const statusLabel = {
    online: '正常運行',
    warning: '部分節點異常',
    critical: '服務中斷',
}

// ── Metric Box ───────────────────────────────────────────────
function MetricBox({ label, value, unit }: { label: string; value: number | string; unit?: string }) {
    return (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900">
                {value}
                {unit && <span className="text-sm font-medium text-slate-500 ml-1">{unit}</span>}
            </p>
        </div>
    )
}

export function Region() {
    const [regionsData, setRegionsData] = useState<RegionData[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const res = await fetch('/api/dashboard/regions')
                if (res.ok) {
                    const data = await res.json()
                    if (data && data.length > 0) {
                        setRegionsData(data)
                        setSelectedRegionId(data[0].id)
                        return
                    }
                }
                throw new Error('No data')
            } catch (error) {
                console.warn('API regions fetch failed, using mock data:', error)
                setRegionsData(regionsInfo)
                setSelectedRegionId(regionsInfo[0].id)
            } finally {
                setLoading(false)
            }
        }
        fetchRegions()
    }, [])

    const selectedRegion = regionsData.find(r => r.id === selectedRegionId) || null

    return (
        <div className="space-y-6">
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            )}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">全球地區監控</h1>
                <p className="mt-1 text-sm text-slate-500">
                    點擊地圖上的大洲區塊，以查看該地區的網路節點狀態
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pixi.js Map Area */}
                <div className="lg:col-span-2">
                    {!loading && (
                        <WorldMap
                            regions={regionsData}
                            selectedRegionId={selectedRegionId}
                            onSelectRegion={setSelectedRegionId}
                            height={500}
                        />
                    )}
                </div>

                {/* Right Panel: Detail Info */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-fit">
                    {selectedRegion ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{selectedRegion.name}</h2>
                                    <p className="text-sm font-mono text-slate-500 mt-1">REGION_ID: {selectedRegion.id.toUpperCase()}</p>
                                </div>
                                <Badge variant={statusBadgeVariant[selectedRegion.status]}>
                                    {statusLabel[selectedRegion.status]}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <MetricBox
                                    label="活躍節點"
                                    value={`${selectedRegion.activeNodes} / ${selectedRegion.totalNodes}`}
                                />
                                <MetricBox
                                    label="平均延遲"
                                    value={selectedRegion.latency}
                                    unit="ms"
                                />
                                <div className="col-span-2">
                                    <MetricBox
                                        label="節點可用率"
                                        value={((selectedRegion.activeNodes / selectedRegion.totalNodes) * 100).toFixed(1)}
                                        unit="%"
                                    />
                                </div>
                            </div>

                            <div className="mt-auto border-t border-slate-100 pt-6">
                                <h3 className="text-sm font-medium text-slate-900 mb-4">地區列表</h3>
                                <div className="space-y-2">
                                    {regionsData.map((r) => (
                                        <button
                                            key={r.id}
                                            onClick={() => setSelectedRegionId(r.id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors border ${selectedRegionId === r.id
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: `#${r.color.toString(16).padStart(6, '0')}` }}
                                                />
                                                <span className="font-medium">{r.name}</span>
                                            </div>
                                            <span className="font-mono text-xs">{r.activeNodes}/{r.totalNodes}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-48 text-slate-500">
                            請選擇一個地區
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
