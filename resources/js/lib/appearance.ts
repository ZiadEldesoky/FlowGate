import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { Appearance, ResolvedAppearance } from '@/hooks/use-appearance';
import type { AppLocale } from '@/types/locale';

export type AppearanceOption = {
    value: Appearance;
    icon: LucideIcon;
    label: Record<AppLocale, string>;
    description: Record<AppLocale, string>;
};

export const appearanceOptions: readonly AppearanceOption[] = [
    {
        value: 'light',
        icon: Sun,
        label: {
            en: 'Light',
            ar: 'فاتح',
        },
        description: {
            en: 'Always use light theme',
            ar: 'استخدم المظهر الفاتح دائمًا',
        },
    },
    {
        value: 'dark',
        icon: Moon,
        label: {
            en: 'Dark',
            ar: 'داكن',
        },
        description: {
            en: 'Always use dark theme',
            ar: 'استخدم المظهر الداكن دائمًا',
        },
    },
    {
        value: 'system',
        icon: Monitor,
        label: {
            en: 'System',
            ar: 'النظام',
        },
        description: {
            en: 'Follow the operating system preference',
            ar: 'اتبع تفضيل نظام التشغيل',
        },
    },
] as const;

export function getAppearanceOption(
    value: Appearance,
): AppearanceOption | undefined {
    return appearanceOptions.find((option) => option.value === value);
}

export function getAppearanceTriggerIcon(
    appearance: Appearance,
    resolvedAppearance: ResolvedAppearance,
): LucideIcon {
    if (appearance === 'system') {
        return Monitor;
    }

    return resolvedAppearance === 'dark' ? Moon : Sun;
}
