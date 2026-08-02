import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatMoney } from '@/features/purchase-requests';
import { maxTrendAmount, trendBarWidth } from '@/features/reports/utils';
import type { AppLocale } from '@/types/locale';
import type { ProcurementMonthlyTrendItem } from '@/types/reports';

type MonthlyTrendProps = {
    items: ProcurementMonthlyTrendItem[];
    locale: AppLocale;
    currency: string;
    labels: {
        month: string;
        count: string;
        amount: string;
        empty: string;
    };
};

export function MonthlyTrend({
    items,
    locale,
    currency,
    labels,
}: MonthlyTrendProps) {
    if (items.length === 0) {
        return (
            <p className="px-1 py-6 text-sm text-muted-foreground">
                {labels.empty}
            </p>
        );
    }

    const maxAmount = maxTrendAmount(items);

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{labels.month}</TableHead>
                    <TableHead className="text-end">{labels.count}</TableHead>
                    <TableHead className="min-w-[12rem]">
                        {labels.amount}
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => {
                    const width = trendBarWidth(item.totalAmount, maxAmount);

                    return (
                        <TableRow key={item.month}>
                            <TableCell className="font-medium">
                                {item.month}
                            </TableCell>
                            <TableCell className="text-end tabular-nums">
                                {item.requestCount}
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <p className="font-mono text-xs tabular-nums">
                                        {formatMoney(
                                            item.totalAmount,
                                            currency,
                                            locale,
                                        )}
                                    </p>
                                    <div
                                        className="h-2 overflow-hidden rounded-full bg-muted"
                                        role="img"
                                        aria-label={`${item.month}: ${item.totalAmount}`}
                                    >
                                        <div
                                            className="h-full rounded-full bg-primary/70"
                                            style={{ width: `${width}%` }}
                                        />
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
