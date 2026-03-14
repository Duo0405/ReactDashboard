import { useEffect, useRef, useCallback } from 'react'
import * as PIXI from 'pixi.js'
import type { RegionData } from '../../types/dashboard'

export interface WorldMapProps {
    /** 要顯示在地圖上的地區資料 */
    regions: RegionData[]
    /** 目前選中的地區 ID */
    selectedRegionId?: string | null
    /** 選中地區時觸發 */
    onSelectRegion?: (regionId: string) => void
    /** 地圖背景圖片路徑 */
    mapImageUrl?: string
    /** 容器高度 */
    height?: number
}

export function WorldMap({
    regions,
    selectedRegionId = null,
    onSelectRegion,
    mapImageUrl = '/world-map.png',
    height = 500,
}: WorldMapProps) {
    const pixiContainerRef = useRef<HTMLDivElement>(null)
    const regionGraphicsRef = useRef<Record<string, PIXI.Graphics>>({})
    const selectedIdRef = useRef(selectedRegionId)

    // 同步 ref
    useEffect(() => {
        selectedIdRef.current = selectedRegionId
    }, [selectedRegionId])

    // 外部 selectedRegionId 變化時同步重繪
    useEffect(() => {
        if (!selectedRegionId || Object.keys(regionGraphicsRef.current).length === 0) return

        regions.forEach((r) => {
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
    }, [selectedRegionId, regions])

    const handleRegionClick = useCallback(
        (regionId: string) => {
            onSelectRegion?.(regionId)
        },
        [onSelectRegion]
    )

    useEffect(() => {
        if (!pixiContainerRef.current || regions.length === 0) return

        let isDestroyed = false
        const app = new PIXI.Application()

        const resize = () => {
            if (!pixiContainerRef.current || !app.renderer) return
            const parent = pixiContainerRef.current
            const targetW = 800
            const targetH = 600

            const containerWidth = parent.clientWidth
            const containerHeight = Math.max(parent.clientHeight, 400)

            // Renderer 填滿整個容器
            app.renderer.resize(containerWidth, containerHeight)

            // Stage 縮放以 contain 800x600 內容
            const scaleX = containerWidth / targetW
            const scaleY = containerHeight / targetH
            const scale = Math.min(scaleX, scaleY)

            app.stage.scale.set(scale)

            // 置中
            const scaledW = targetW * scale
            const scaledH = targetH * scale
            app.stage.position.set(
                (containerWidth - scaledW) / 2,
                (containerHeight - scaledH) / 2
            )
        }

        const initPixi = async () => {
            await app.init({
                width: 800,
                height: 600,
                backgroundColor: 0x0f172a,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
            })

            // 載入背景地圖 (如果存在)
            let mapTexture: PIXI.Texture | null = null
            try {
                mapTexture = await PIXI.Assets.load(mapImageUrl)
            } catch {
                console.warn('World map image not found, skipping background')
            }

            if (isDestroyed) {
                app.destroy(true, { children: true })
                return
            }

            if (pixiContainerRef.current) {
                pixiContainerRef.current.innerHTML = ''
                pixiContainerRef.current.appendChild(app.canvas)
            }

            window.addEventListener('resize', resize)
            setTimeout(resize, 0)

            // 背景圖片
            if (mapTexture) {
                const bgSprite = new PIXI.Sprite(mapTexture)
                bgSprite.width = 800
                bgSprite.height = 600
                bgSprite.alpha = 0.5
                app.stage.addChild(bgSprite)
            }

            // 地圖圖層
            const mapContainer = new PIXI.Container()
            app.stage.addChild(mapContainer)

            // 繪製各州區塊
            regions.forEach((region) => {
                const g = new PIXI.Graphics()
                g.eventMode = 'static'
                g.cursor = 'pointer'

                const drawRegion = (isHovered: boolean, isSelected: boolean) => {
                    g.clear()
                    const alpha = isHovered || isSelected ? 1 : 0.6
                    const lineColor = isSelected ? 0xffffff : region.color
                    g.lineStyle(isSelected ? 3 : 2, lineColor, alpha)
                    g.beginFill(region.color, isHovered ? 0.3 : isSelected ? 0.4 : 0.1)
                    g.drawPolygon(region.path)
                    g.endFill()
                }

                drawRegion(false, region.id === selectedIdRef.current)

                g.on('pointerover', () => drawRegion(true, region.id === selectedIdRef.current))
                g.on('pointerout', () => drawRegion(false, region.id === selectedIdRef.current))
                g.on('pointerdown', () => {
                    handleRegionClick(region.id)
                    selectedIdRef.current = region.id

                    regions.forEach((r) => {
                        const targetG = regionGraphicsRef.current[r.id]
                        if (!targetG) return
                        const isThisSelected = r.id === region.id
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

            regions.forEach((region) => {
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
                        },
                    },
                })

                let sumX = 0,
                    sumY = 0
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

        return () => {
            isDestroyed = true
            window.removeEventListener('resize', resize)
            if (app.renderer) {
                app.destroy(true, { children: true })
            }
        }
    }, [regions, mapImageUrl, handleRegionClick])

    return (
        <div
            className="bg-slate-900 rounded-xl shadow-sm border border-slate-700 overflow-hidden relative flex items-center justify-center"
            style={{ height }}
        >
            <div ref={pixiContainerRef} className="w-full h-full" />
            <div className="absolute top-4 left-4 text-slate-400 text-xs font-mono select-none pointer-events-none">
                [PIXI.JS RENDERER ACTIVE] // WORLD_MAP_V1
            </div>
        </div>
    )
}
