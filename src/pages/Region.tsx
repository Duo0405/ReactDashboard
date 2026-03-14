import { useEffect, useRef, useState } from 'react'
import * as PIXI from 'pixi.js'
import { Badge } from '../components/ui/Badge'

// ── Mock Data ────────────────────────────────────────────────
interface RegionData {
    id: string
    name: string
    status: 'online' | 'warning' | 'critical'
    activeNodes: number
    totalNodes: number
    latency: number
    color: number // PIXI 色碼
    path: number[] // 簡化版的多邊形座標 (相對於 800x600 的畫布)
}

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
    const pixiContainerRef = useRef<HTMLDivElement>(null)
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(regionsInfo[0].id)
    const selectedRegion = regionsInfo.find((r) => r.id === selectedRegionId)

    // 用一個 ref 來儲存所有的 Pixi Graphics，這樣外部就能操作它們
    const regionGraphicsRef = useRef<Record<string, PIXI.Graphics>>({})

    useEffect(() => {
        if (!pixiContainerRef.current) return

        let isDestroyed = false
        // 1. 初始化 Pixi Application
        const app = new PIXI.Application()

        const resize = () => {
            if (!pixiContainerRef.current || !app.renderer) return
            const parent = pixiContainerRef.current
            const targetW = 800
            const targetH = 600

            // 取得外層可用空間
            const containerWidth = parent.clientWidth
            const containerHeight = Math.max(parent.clientHeight, 400) // 最少給 400px

            // 計算讓畫面完全包含 (contain) 在裡面的縮放比例
            const scaleX = containerWidth / targetW
            const scaleY = containerHeight / targetH
            const scale = Math.min(scaleX, scaleY) // 也可以改成用更小值，確保不被裁切

            // Canvas 本身的解析度
            const finalW = targetW * scale
            const finalH = targetH * scale

            app.renderer.resize(finalW, finalH)
            app.stage.scale.set(scale)

            // 讓整個畫面的原點置中對齊
            app.stage.position.set(
                (containerWidth - finalW) / 2,
                (containerHeight - finalH) / 2
            )
        }

        // 使用 async 函數來處理初始化
        const initPixi = async () => {
            await app.init({
                width: 800,
                height: 600,
                backgroundColor: 0x0f172a, // slate-900
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
            })

            // 載入背景地圖
            const mapTexture = await PIXI.Assets.load('/world-map.png')

            // 如果還沒初始化完成元件就已經卸載，則銷毀這份 App 並直接結束
            if (isDestroyed) {
                app.destroy(true, { children: true })
                return
            }

            // 確保容器存在且為空再加入
            if (pixiContainerRef.current) {
                pixiContainerRef.current.innerHTML = ''
                pixiContainerRef.current.appendChild(app.canvas)
            }

            window.addEventListener('resize', resize)
            // 延遲一點點執行首次 resize 以確保 container 寬度已計算
            setTimeout(resize, 0)

            // 1.5. 建立背景圖片
            const bgSprite = new PIXI.Sprite(mapTexture)
            // 將圖片調整至剛好填滿 800x600 的畫布大小
            bgSprite.width = 800
            bgSprite.height = 600
            bgSprite.alpha = 0.5 // 調暗一點讓色塊比較明顯
            app.stage.addChild(bgSprite)

            // 2. 建立地圖圖層
            const mapContainer = new PIXI.Container()
            app.stage.addChild(mapContainer)

            // 3. 繪製各州區塊
            // 4. 管理互動狀態 (不依賴 React state 重建)
            let currentSelectedId = selectedRegionId

            regionsInfo.forEach((region) => {
                const g = new PIXI.Graphics()

                // 設定互動屬性
                g.eventMode = 'static'
                g.cursor = 'pointer'

                const drawRegion = (isHovered: boolean, isSelected: boolean) => {
                    g.clear()

                    // 邊框
                    const alpha = isHovered || isSelected ? 1 : 0.6
                    const lineColor = isSelected ? 0xffffff : region.color

                    g.lineStyle(isSelected ? 3 : 2, lineColor, alpha)

                    // 填色
                    g.beginFill(region.color, isHovered ? 0.3 : (isSelected ? 0.4 : 0.1))

                    // 繪製多邊形
                    g.drawPolygon(region.path)
                    g.endFill()
                }

                // 初始繪製
                drawRegion(false, region.id === currentSelectedId)

                // 互動事件
                g.on('pointerover', () => drawRegion(true, region.id === currentSelectedId))
                g.on('pointerout', () => drawRegion(false, region.id === currentSelectedId))
                g.on('pointerdown', () => {
                    // 通知 React 更新右側面板
                    setSelectedRegionId(region.id)
                    currentSelectedId = region.id

                    // 直接強制重繪所有區塊，不需要銷毀整個 app
                    regionsInfo.forEach(r => {
                        const targetG = regionGraphicsRef.current[r.id]
                        if (!targetG) return
                        
                        const isThisSelected = r.id === currentSelectedId
                        
                        targetG.clear()
                        const alpha = isThisSelected ? 1 : 0.6
                        const lineColor = isThisSelected ? 0xffffff : r.color
                        targetG.lineStyle(isThisSelected ? 3 : 2, lineColor, alpha)
                        targetG.beginFill(r.color, isThisSelected ? 0.4 : 0.1)
                        targetG.drawPolygon(r.path)
                        targetG.endFill()
                    })
                })

                regionGraphicsRef.current[region.id] = g
                mapContainer.addChild(g)
            })

            // 文字標籤層
            const textContainer = new PIXI.Container()
            app.stage.addChild(textContainer)

            regionsInfo.forEach((region) => {
                const text = new PIXI.Text({
                    text: region.name,
                    style: {
                        fontFamily: 'sans-serif',
                        fontSize: 16,
                        fill: 0xffffff,
                        fontWeight: 'bold',
                        dropShadow: {
                            alpha: 0.5,
                            angle: Math.PI / 6,
                            blur: 4,
                            color: 0x000000,
                            distance: 2,
                        }
                    }
                })

                // 計算多邊形中心點來放文字 (簡易算法：取X/Y平均值)
                let sumX = 0, sumY = 0
                for (let i = 0; i < region.path.length; i += 2) {
                    sumX += region.path[i]
                    sumY += region.path[i + 1]
                }
                const count = region.path.length / 2

                text.position.set(sumX / count, sumY / count)
                text.anchor.set(0.5)
                textContainer.addChild(text)
            })
        }

        initPixi()

        // 清理 UI
        return () => {
            isDestroyed = true
            window.removeEventListener('resize', resize)
            // 只有當 renderer 已經存在 (代表初始化已完成)，才在此處直接執行 destroy
            if (app.renderer) {
                app.destroy(true, { children: true })
            }
        }
    }, []) // 將依賴陣列清空，避免 React state 選取變化時重建整個 Pixi App！

    // 監聽 selectedRegionId 的變化（例如從右側選單點擊）同步更新 Pixi 的繪圖狀態
    useEffect(() => {
        if (!selectedRegionId || Object.keys(regionGraphicsRef.current).length === 0) return

        regionsInfo.forEach(r => {
            const targetG = regionGraphicsRef.current[r.id]
            if (!targetG) return

            const isThisSelected = r.id === selectedRegionId
            
            targetG.clear()
            const alpha = isThisSelected ? 1 : 0.6
            const lineColor = isThisSelected ? 0xffffff : r.color
            targetG.lineStyle(isThisSelected ? 3 : 2, lineColor, alpha)
            targetG.beginFill(r.color, isThisSelected ? 0.4 : 0.1)
            targetG.drawPolygon(r.path)
            targetG.endFill()
        })
    }, [selectedRegionId])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">全球地區監控</h1>
                <p className="mt-1 text-sm text-slate-500">
                    點擊地圖上的大洲區塊，以查看該地區的網路節點狀態
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pixi.js Map Area */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-700 overflow-hidden relative h-[500px] flex items-center justify-center">
                        {/* 畫布容器 */}
                        <div ref={pixiContainerRef} className="w-full h-full" />

                        {/* 裝飾文字 */}
                        <div className="absolute top-4 left-4 text-slate-400 text-xs font-mono select-none pointer-events-none">
                            [PIXI.JS RENDERER ACTIVE] // WORLD_MAP_V1
                        </div>
                    </div>
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
                                    {regionsInfo.map((r) => (
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
