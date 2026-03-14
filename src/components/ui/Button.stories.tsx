import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
    title: 'UI/Button',
    component: Button,
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'danger', 'ghost'],
        },
        size: { control: 'select', options: ['sm', 'md', 'lg'] },
        loading: { control: 'boolean' },
        disabled: { control: 'boolean' },
    },
}
export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
    args: { children: 'Primary Button', variant: 'primary' },
}

export const Secondary: Story = {
    args: { children: 'Secondary', variant: 'secondary' },
}

export const Danger: Story = {
    args: { children: 'Delete', variant: 'danger' },
}

export const Ghost: Story = {
    args: { children: 'Ghost', variant: 'ghost' },
}

export const Loading: Story = {
    args: { children: 'Saving...', loading: true },
}

export const Small: Story = {
    args: { children: 'Small', size: 'sm' },
}

export const Large: Story = {
    args: { children: 'Large', size: 'lg' },
}
