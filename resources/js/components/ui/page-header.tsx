import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
    title: string;
    description?: string;
    actions?: ReactNode;
    meta?: ReactNode;
    className?: string;
};

function PageHeader({
    title,
    description,
    actions,
    meta,
    className,
}: PageHeaderProps) {
    return (
        <header
            data-slot="page-header"
            className={cn(
                'flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between',
                className,
            )}
        >
            <div className="min-w-0 space-y-1">
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {title}
                </h1>
                {description ? (
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        {description}
                    </p>
                ) : null}
                {meta ? <div className="pt-1">{meta}</div> : null}
            </div>
            {actions ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                </div>
            ) : null}
        </header>
    );
}

export { PageHeader };
export type { PageHeaderProps };
