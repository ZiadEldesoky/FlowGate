import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type FilterBarProps = {
    children: ReactNode;
    actions?: ReactNode;
    className?: string;
};

function FilterBar({ children, actions, className }: FilterBarProps) {
    return (
        <div
            data-slot="filter-bar"
            className={cn(
                'flex flex-col gap-3 rounded-md border bg-card p-3 sm:flex-row sm:items-end sm:justify-between',
                className,
            )}
        >
            <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {children}
            </div>
            {actions ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                </div>
            ) : null}
        </div>
    );
}

type FilterFieldProps = {
    label: string;
    htmlFor?: string;
    children: ReactNode;
    className?: string;
};

function FilterField({
    label,
    htmlFor,
    children,
    className,
}: FilterFieldProps) {
    return (
        <div data-slot="filter-field" className={cn('grid gap-1.5', className)}>
            <label
                htmlFor={htmlFor}
                className="text-xs font-medium text-muted-foreground"
            >
                {label}
            </label>
            {children}
        </div>
    );
}

export { FilterBar, FilterField };
export type { FilterBarProps, FilterFieldProps };
