import { StatusBadge } from '@/components/ui/status-badge';
import { statusBarWidth } from '@/features/reports/utils';
import type { AppLocale } from '@/types/locale';
import type { StatusBreakdownItem } from '@/types/reports';

type StatusBreakdownListProps = {
    items: StatusBreakdownItem[];
    locale: AppLocale;
    emptyLabel: string;
    countLabel: string;
};

export function StatusBreakdownList({
    items,
    locale,
    emptyLabel,
    countLabel,
}: StatusBreakdownListProps) {
    if (items.length === 0) {
        return (
            <p className="px-1 py-6 text-sm text-muted-foreground">
                {emptyLabel}
            </p>
        );
    }

    const max = Math.max(...items.map((item) => item.count), 0);

    return (
        <ul className="space-y-3">
            {items.map((item) => {
                const width = statusBarWidth(item.count, max);

                return (
                    <li key={item.status} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                            <StatusBadge status={item.status} locale={locale} />
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {countLabel}: {item.count}
                            </span>
                        </div>
                        <div
                            className="h-2 overflow-hidden rounded-md bg-muted"
                            role="img"
                            aria-label={`${item.status}: ${item.count}`}
                        >
                            <div
                                className="h-full rounded-md bg-primary/70"
                                style={{ width: `${width}%` }}
                            />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
