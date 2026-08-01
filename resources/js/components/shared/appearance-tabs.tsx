import type { HTMLAttributes } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { useDirection } from '@/hooks/use-direction';
import { appearanceOptions } from '@/lib/appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();
    const { locale } = useDirection();

    return (
        <div
            role="radiogroup"
            aria-label={locale === 'ar' ? 'المظهر' : 'Appearance'}
            className={cn(
                'inline-flex gap-1 rounded-md border border-border bg-muted p-1',
                className,
            )}
            {...props}
        >
            {appearanceOptions.map(({ value, icon: Icon, label }) => {
                const selected = appearance === value;

                return (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => updateAppearance(value)}
                        className={cn(
                            'flex items-center rounded-md px-3.5 py-1.5 text-sm transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                            selected
                                ? 'bg-background text-foreground shadow-xs'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        )}
                    >
                        <Icon className="-ms-1 size-4" aria-hidden />
                        <span className="ms-1.5">{label[locale]}</span>
                    </button>
                );
            })}
        </div>
    );
}
