import { Languages } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDirection } from '@/hooks/use-direction';
import type { AppLocale } from '@/types/locale';

const localeOptions: {
    value: AppLocale;
    label: { en: string; ar: string };
}[] = [
    { value: 'ar', label: { en: 'Arabic', ar: 'العربية' } },
    { value: 'en', label: { en: 'English', ar: 'الإنجليزية' } },
];

export function LocaleSwitcher() {
    const { locale, updateLocale } = useDirection();

    const triggerLabel = locale === 'ar' ? 'تبديل اللغة' : 'Switch language';
    const menuLabel = locale === 'ar' ? 'اللغة' : 'Language';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <IconButton label={triggerLabel} variant="outline" size="icon">
                    <Languages className="size-4" />
                </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
                {localeOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => updateLocale(option.value)}
                        data-active={locale === option.value}
                        className="data-[active=true]:bg-accent"
                    >
                        {option.label[locale]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
