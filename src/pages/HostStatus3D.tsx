import { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, RoundedBox } from '@react-three/drei'
import { Badge } from '../components/ui/Badge'
import type { Group } from 'three'

// ── Mock Data ────────────────────────────────────────────────
interface ServerData {
    id: string
    name: string
    status: 'online' | 'warning' | 'critical'
    cpu: number
    ram: number
    disk: number
    uptime: string
}

const servers: ServerData[] = [
    { id: 's1', name: 'web-prod-01', status: 'online', cpu: 45, ram: 62, disk: 78, uptime: '45 days' },
    { id: 's2', name: 'web-prod-02', status: 'online', cpu: 38, ram: 55, disk: 65, uptime: '45 days' },
    { id: 's3', name: 'api-prod-01', status: 'warning', cpu: 82, ram: 78, disk: 90, uptime: '12 days' },
    { id: 's4', name: 'db-prod-01', status: 'online', cpu: 55, ram: 70, disk: 45, uptime: '90 days' },
    { id: 's5', name: 'cache-prod-01', status: 'critical', cpu: 95, ram: 92, disk: 88, uptime: '3 days' },
    { id: 's6', name: 'lb-prod-01', status: 'online', cpu: 22, ram: 35, disk: 30, uptime: '120 days' },
]

const statusColor = {
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

// ── 3D Server Box ────────────────────────────────────────────
function ServerBox({
    server,
    position,
    selected,
    onClick,
}: {
    server: ServerData
    position: [number, number, number]
    selected: boolean
    onClick: () => void
}) {
    const groupRef = useRef<Group>(null!)
    const color = statusColor[server.status]

    useFrame((_, delta) => {
        if (groupRef.current) {
            // Scale pulse for selected
            const targetScale = selected ? 1.08 : 1
            groupRef.current.scale.x += (targetScale - groupRef.current.scale.x) * delta * 5
            groupRef.current.scale.y += (targetScale - groupRef.current.scale.y) * delta * 5
            groupRef.current.scale.z += (targetScale - groupRef.current.scale.z) * delta * 5
        }
    })

    return (
        <group ref={groupRef} position={position}>
            {/* Server body */}
            <RoundedBox
                args={[1.6, 0.5, 0.8]}
                radius={0.05}
                smoothness={4}
                onClick={onClick}
            >
                <meshStandardMaterial
                    color={selected ? color : '#334155'}
                    metalness={0.6}
                    roughness={0.3}
                />
            </RoundedBox>

            {/* Status LED */}
            <mesh position={[0.65, 0, 0.41]}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={2}
                />
            </mesh>

            {/* Label */}
            <Text
                position={[0, 0, 0.41]}
                fontSize={0.1}
                color="#94a3b8"
                anchorX="center"
                anchorY="middle"
            >
                {server.name}
            </Text>
        </group >
    )
}

// ── Rack Frame ───────────────────────────────────────────────
function RackFrame() {
    return (
        <group>
            {/* Left rail */}
            <mesh position={[-1, 0.5, 0]}>
                <boxGeometry args={[0.05, 4.5, 1]} />
                <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Right rail */}
            <mesh position={[1, 0.5, 0]}>
                <boxGeometry args={[0.05, 4.5, 1]} />
                <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Top bar */}
            <mesh position={[0, 2.75, 0]}>
                <boxGeometry args={[2.1, 0.05, 1]} />
                <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Bottom bar */}
            <mesh position={[0, -1.75, 0]}>
                <boxGeometry args={[2.1, 0.05, 1]} />
                <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
            </mesh>
        </group>
    )
}

// ── Floor Grid ───────────────────────────────────────────────
function Floor() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.8} />
        </mesh>
    )
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
    const [selected, setSelected] = useState<ServerData | null>(null)

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

    useEffect(() => {
        if (selectedId) {
            setSelected(serversData.find(s => s.id === selectedId) || null)
        }
    }, [selectedId, serversData])

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
                <div className="lg:col-span-2 bg-slate-900 rounded-xl shadow-sm border border-slate-700 overflow-hidden"
                    style={{ height: 480 }}
                >
                    <Canvas
                        camera={{ position: [3, 2, 4], fov: 50 }}
                        gl={{ antialias: true }}
                    >
                        <color attach="background" args={['#0f172a']} />
                        <ambientLight intensity={0.4} />
                        <directionalLight position={[5, 5, 5]} intensity={1} />
                        <pointLight position={[-3, 3, 3]} intensity={0.5} color="#818cf8" />

                        <Floor />
                        <RackFrame />

                        {!loading && serversData.map((server, i) => (
                            <ServerBox
                                key={server.id}
                                server={server}
                                position={[0, 2 - i * 0.7, 0]}
                                selected={selectedId === server.id}
                                onClick={() => setSelectedId(server.id)}
                            />
                        ))}

                        <OrbitControls
                            enablePan={false}
                            minDistance={3}
                            maxDistance={8}
                            maxPolarAngle={Math.PI / 2}
                        />
                    </Canvas>
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
