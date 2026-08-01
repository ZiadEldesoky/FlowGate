import { Check } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { useAppearance } from '@/hooks/use-appearance';
import { useDirection } from '@/hooks/use-direction';
import { appearanceOptions, getAppearanceTriggerIcon } from '@/lib/appearance';
import { cn } from '@/lib/utils';

type AppearanceSwitcherProps = {
    className?: string;
    align?: 'start' | 'center' | 'end';
};

export function AppearanceSwitcher({
    className,
    align = 'end',
}: AppearanceSwitcherProps) {
    const { appearance, resolvedAppearance, updateAppearance } =
        useAppearance();
    const { locale } = useDirection();

    const triggerIcon = getAppearanceTriggerIcon(
        appearance,
        resolvedAppearance,
    );
    const triggerLabel = locale === 'ar' ? 'تبديل المظهر' : 'Switch appearance';
    const menuLabel = locale === 'ar' ? 'المظهر' : 'Appearance';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <IconButton
                    label={triggerLabel}
                    variant="outline"
                    size="icon"
                    className={className}
                >
                    <Icon iconNode={triggerIcon} className="size-4" />
                </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} className="min-w-48">
                <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
                {appearanceOptions.map((option) => {
                    const selected = appearance === option.value;

                    return (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => updateAppearance(option.value)}
                            aria-checked={selected}
                            role="menuitemradio"
                            data-active={selected}
                            className={cn(
                                'gap-2 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground',
                            )}
                        >
                            <Icon
                                iconNode={option.icon}
                                className="size-4 shrink-0"
                            />
                            <span className="flex min-w-0 flex-1 flex-col">
                                <span className="text-sm font-medium">
                                    {option.label[locale]}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {option.description[locale]}
                                </span>
                            </span>
                            <Check
                                className={cn(
                                    'size-4 shrink-0 text-primary',
                                    selected ? 'opacity-100' : 'opacity-0',
                                )}
                                aria-hidden
                            />
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
