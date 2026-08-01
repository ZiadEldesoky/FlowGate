import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
};

function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            data-slot="empty-state"
            className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-muted/20 px-6 py-12 text-center',
                className,
            )}
        >
            {Icon ? (
                <div className="flex size-10 items-center justify-center rounded-md border bg-background text-muted-foreground">
                    <Icon className="size-5" aria-hidden />
                </div>
            ) : null}
            <div className="space-y-1">
                <h3 className="text-sm font-medium text-foreground">{title}</h3>
                {description ? (
                    <p className="max-w-sm text-sm text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>
            {action ? <div className="pt-1">{action}</div> : null}
        </div>
    );
}

export { EmptyState };
export type { EmptyStateProps };
