export interface RegionData {
    id: string
    name: string
    status: 'online' | 'warning' | 'critical'
    activeNodes: number
    totalNodes: number
    latency: number
    color: number // PIXI 色碼
    path: number[] // 簡化版的多邊形座標 (相對於 800x600 的畫布)
}

export interface ServerData {
    id: string
    name: string
    status: 'online' | 'warning' | 'critical'
    cpu: number
    ram: number
    disk: number
    uptime: string
}
