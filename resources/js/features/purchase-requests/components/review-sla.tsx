import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/features/purchase-requests/utils';
import { cn } from '@/lib/utils';
import type { AppLocale } from '@/types/locale';

export type ReviewSlaLabels = {
    reviewDueAt: string;
    overdue: string;
    due: string;
    notAvailable: string;
};

type ReviewSlaProps = {
    reviewDueAt: string | null;
    isOverdue: boolean;
    locale: AppLocale;
    labels: ReviewSlaLabels;
    className?: string;
    showLabel?: boolean;
};

/**
 * Presentation-only SLA display for server-owned reviewDueAt / isOverdue.
 * Never derives overdue from the browser clock.
 */
export function ReviewSla({
    reviewDueAt,
    isOverdue,
    locale,
    labels,
    className,
    showLabel = false,
}: ReviewSlaProps) {
    if (!reviewDueAt) {
        return (
            <span className={cn('text-muted-foreground', className)}>
                {labels.notAvailable}
            </span>
        );
    }

    const dueLabel = formatDateTime(reviewDueAt, locale) ?? reviewDueAt;

    return (
        <div className={cn('space-y-1', className)}>
            {showLabel ? (
                <p className="text-xs font-medium text-muted-foreground">
                    {labels.reviewDueAt}
                </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
                {isOverdue ? (
                    <Badge variant="destructive">{labels.overdue}</Badge>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        {labels.due}
                    </span>
                )}
                <span
                    className={cn(
                        'text-sm tabular-nums',
                        isOverdue ? 'font-medium text-destructive' : undefined,
                    )}
                >
                    {dueLabel}
                </span>
            </div>
        </div>
    );
}
