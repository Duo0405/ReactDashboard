import { useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, RoundedBox } from '@react-three/drei'
import type { Group } from 'three'
import type { ServerData } from '../../types/dashboard'

const statusColor: Record<ServerData['status'], string> = {
    online: '#10b981',
    warning: '#f59e0b',
    critical: '#ef4444',
}

export interface ServerRoom3DProps {
    /** 要顯示的伺服器列表 */
    servers: ServerData[]
    /** 目前選中的伺服器 ID */
    selectedServerId?: string | null
    /** 選中伺服器時觸發 */
    onSelectServer?: (serverId: string) => void
    /** 容器高度 */
    height?: number
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
            const targetScale = selected ? 1.08 : 1
            groupRef.current.scale.x += (targetScale - groupRef.current.scale.x) * delta * 5
            groupRef.current.scale.y += (targetScale - groupRef.current.scale.y) * delta * 5
            groupRef.current.scale.z += (targetScale - groupRef.current.scale.z) * delta * 5
        }
    })

    return (
        <group ref={groupRef} position={position}>
            <RoundedBox args={[1.6, 0.5, 0.8]} radius={0.05} smoothness={4} onClick={onClick}>
                <meshStandardMaterial color={selected ? color : '#334155'} metalness={0.6} roughness={0.3} />
            </RoundedBox>

            {/* Status LED */}
            <mesh position={[0.65, 0, 0.41]}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
            </mesh>

            {/* Label */}
            <Text position={[0, 0, 0.41]} fontSize={0.1} color="#94a3b8" anchorX="center" anchorY="middle">
                {server.name}
            </Text>
        </group>
    )
}

// ── Rack Frame ───────────────────────────────────────────────
function RackFrame() {
    return (
        <group>
            <mesh position={[-1, 0.5, 0]}>
                <boxGeometry args={[0.05, 4.5, 1]} />
                <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[1, 0.5, 0]}>
                <boxGeometry args={[0.05, 4.5, 1]} />
                <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 2.75, 0]}>
                <boxGeometry args={[2.1, 0.05, 1]} />
                <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, -1.75, 0]}>
                <boxGeometry args={[2.1, 0.05, 1]} />
                <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
            </mesh>
        </group>
    )
}

// ── Floor ────────────────────────────────────────────────────
function Floor() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.8} />
        </mesh>
    )
}

// ── Main Component ───────────────────────────────────────────
export function ServerRoom3D({
    servers,
    selectedServerId = null,
    onSelectServer,
    height = 480,
}: ServerRoom3DProps) {
    const [internalSelectedId, setInternalSelectedId] = useState<string | null>(selectedServerId)

    // 支援受控和非受控模式
    const actualSelectedId = selectedServerId !== null ? selectedServerId : internalSelectedId

    const handleSelect = (id: string) => {
        setInternalSelectedId(id)
        onSelectServer?.(id)
    }

    return (
        <div
            className="bg-slate-900 rounded-xl shadow-sm border border-slate-700 overflow-hidden"
            style={{ height }}
        >
            <Canvas camera={{ position: [3, 2, 4], fov: 50 }} gl={{ antialias: true }}>
                <color attach="background" args={['#0f172a']} />
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <pointLight position={[-3, 3, 3]} intensity={0.5} color="#818cf8" />

                <Floor />
                <RackFrame />

                {servers.map((server, i) => (
                    <ServerBox
                        key={server.id}
                        server={server}
                        position={[0, 2 - i * 0.7, 0]}
                        selected={actualSelectedId === server.id}
                        onClick={() => handleSelect(server.id)}
                    />
                ))}

                <OrbitControls enablePan={false} minDistance={3} maxDistance={8} maxPolarAngle={Math.PI / 2} />
            </Canvas>
        </div>
    )
}
