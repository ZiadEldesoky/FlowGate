import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type KpiItem = {
    key: string;
    label: string;
    value: ReactNode;
    hint?: string;
};

type KpiStripProps = {
    items: KpiItem[];
    className?: string;
};

export function KpiStrip({ items, className }: KpiStripProps) {
    return (
        <div
            className={cn(
                'grid gap-3 sm:grid-cols-2 xl:grid-cols-5',
                className,
            )}
        >
            {items.map((item) => (
                <div
                    key={item.key}
                    className="rounded-md border bg-card px-3 py-3"
                >
                    <p className="text-xs font-medium text-muted-foreground">
                        {item.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums">
                        {item.value}
                    </p>
                    {item.hint ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {item.hint}
                        </p>
                    ) : null}
                </div>
            ))}
        </div>
    );
}
