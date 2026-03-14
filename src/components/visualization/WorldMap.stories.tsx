import type { Meta, StoryObj } from '@storybook/react'
import { WorldMap } from './WorldMap'
import type { RegionData } from '../../types/dashboard'

const mockRegions: RegionData[] = [
    {
        id: 'na',
        name: '北美洲',
        status: 'online',
        activeNodes: 124,
        totalNodes: 125,
        latency: 45,
        color: 0x3b82f6,
        path: [80, 200, 240, 200, 250, 250, 220, 250, 150, 350, 70, 200],
    },
    {
        id: 'sa',
        name: '南美洲',
        status: 'warning',
        activeNodes: 42,
        totalNodes: 45,
        latency: 120,
        color: 0xf59e0b,
        path: [200, 330, 260, 310, 300, 380, 320, 400, 240, 480],
    },
    {
        id: 'eu',
        name: '歐洲',
        status: 'online',
        activeNodes: 88,
        totalNodes: 88,
        latency: 35,
        color: 0x10b981,
        path: [480, 210, 520, 200, 490, 240, 320, 260, 360, 200],
    },
    {
        id: 'af',
        name: '非洲',
        status: 'online',
        activeNodes: 56,
        totalNodes: 58,
        latency: 85,
        color: 0x8b5cf6,
        path: [370, 270, 460, 270, 480, 289, 450, 440, 390, 440, 340, 280],
    },
    {
        id: 'as',
        name: '亞洲',
        status: 'critical',
        activeNodes: 156,
        totalNodes: 180,
        latency: 210,
        color: 0xef4444,
        path: [490, 200, 750, 200, 780, 180, 680, 270, 580, 290, 510, 200],
    },
    {
        id: 'oc',
        name: '大洋洲',
        status: 'online',
        activeNodes: 32,
        totalNodes: 32,
        latency: 65,
        color: 0x0ea5e9,
        path: [620, 360, 700, 360, 720, 400, 680, 400, 600, 420],
    },
]

const meta: Meta<typeof WorldMap> = {
    title: 'Visualization/WorldMap',
    component: WorldMap,
    parameters: {
        layout: 'padded',
    },
    argTypes: {
        selectedRegionId: {
            control: 'select',
            options: [null, ...mockRegions.map((r) => r.id)],
        },
        height: {
            control: { type: 'range', min: 300, max: 800, step: 50 },
        },
    },
}
export default meta

type Story = StoryObj<typeof WorldMap>

export const Default: Story = {
    args: {
        regions: mockRegions,
        selectedRegionId: 'na',
        height: 500,
    },
}

export const NoneSelected: Story = {
    args: {
        regions: mockRegions,
        selectedRegionId: null,
        height: 500,
    },
}

export const CriticalHighlight: Story = {
    args: {
        regions: mockRegions,
        selectedRegionId: 'as',
        height: 500,
    },
}

export const Compact: Story = {
    args: {
        regions: mockRegions,
        selectedRegionId: 'eu',
        height: 350,
    },
}
